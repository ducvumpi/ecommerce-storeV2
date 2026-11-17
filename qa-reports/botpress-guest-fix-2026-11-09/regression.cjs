const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const snapshot = require('../guest-catalog-2026-11-09.json');
const norm = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase();
const products = snapshot.products.map((p, i) => ({...p, id: String(i), slug: 'fixture-' + i}));
const variants = products.flatMap(p => p.product_variants.map((v, i) => ({...v, id: p.id + '-' + i, product_id: p.id, price: p.base_price})));
const axios = {get: async (url, {params}) => {
  if (url.endsWith('/products')) return {data: [...products].sort((a,b) => a.base_price - b.base_price)};
  if (url.endsWith('/categories')) return {data: []};
  const ids = params.product_id.slice(4,-1).split(',');
  const filtered = variants.filter(v => ids.includes(v.product_id));
  return {data: filtered.slice(params.offset, params.offset + params.limit)};
}};
function compile(name) {
  const source = fs.readFileSync(path.join(__dirname, name), 'utf8');
  const result = ts.transpileModule(source, {compilerOptions:{target:ts.ScriptTarget.ES2020},reportDiagnostics:true});
  assert.equal((result.diagnostics || []).filter(d=>d.category===ts.DiagnosticCategory.Error).length,0, name + ' syntax');
  return new (Object.getPrototypeOf(async function(){}).constructor)('workflow','conversation','user','event','env','axios',result.outputText);
}
const search = compile('search.after.ts.txt');
const respond = compile('response.after.ts.txt');
const env = {SUPABASE_URL:'https://fixture.invalid',SUPABASE_SERVICE_KEY:'fixture-only'};
const evidence = [];
async function turn(id,text,conversation={},user={}) {
  const workflow = {userMessage:text};
  await search(workflow,conversation,user,{payload:{text}},env,axios);
  await respond(workflow,conversation,user,{payload:{text}},env,axios);
  const rows = JSON.parse(workflow.productsJson);
  assert.ok(!String(workflow.debugConsult).startsWith('ERR'), workflow.debugConsult);
  evidence.push({id,text,count:workflow.productCount,names:rows.map(r=>r.name),reply:workflow.consultText});
  return {workflow,rows,conversation,user};
}
(async()=>{
  let c={};
  let r=await turn('G02','Mình tìm áo len nữ mặc đi làm, màu trung tính như be, kem hoặc nâu, size M, giá tối đa 400 nghìn; ưu tiên loại mềm và còn hàng nhé.',c);
  assert.equal(r.rows.length,8); assert.ok(r.rows.every(p=>p.variants.every(v=>v.size==='M'&&v.stock>0)));
  r=await turn('G02-cheapest','Trong mấy mẫu đó mẫu nào rẻ nhất?',c); assert.equal(r.rows.length,1); assert.equal(r.rows[0].minPrice,329000);
  r=await turn('G02-reference','Mẫu đó còn màu kem size M không, hay chỉ còn be/nâu?',c); assert.equal(r.rows.length,1);
  r=await turn('G03','Nếu không có màu kem thì đổi sang be hoặc nâu cũng được, miễn dưới 400 nghìn. À size S cũng được nếu không còn M.',c);
  assert.ok(r.rows.length>0); assert.ok(r.rows.every(p=>p.variants.every(v=>['Be','Nâu'].includes(v.color))));
  // G03 order-of-phrasing regression: M is unavailable, S is in stock.
  const knit=products.find(p=>p.name==='Áo len nữ Weekend');
  const knitM=variants.find(v=>v.product_id===knit.id&&v.color==='Nâu'&&v.size==='M');
  const knitS=variants.find(v=>v.product_id===knit.id&&v.color==='Nâu'&&v.size==='S');
  const priorM=knitM.stock,priorS=knitS.stock; knitM.stock=0;knitS.stock=40;
  r=await turn('G03-size-fallback','Áo len nữ Weekend màu nâu size M, nếu không còn M thì size S cũng được, dưới 400 nghìn.');
  assert.equal(r.rows.length,1);assert.deepEqual(r.rows[0].variants.map(v=>[v.color,v.size,v.stock]),[['Nâu','S',40]]);
  knitM.stock=priorM;knitS.stock=priorS;
  r=await turn('G04','Thôi tìm áo thun nam màu đen size M dưới 250 nghìn cho chồng mình; bỏ tiêu chí áo len và nữ nhé.',c); assert.equal(r.rows.length,7);
  c={}; await turn('G05-price','Áo thun nam Daily giá bao nhiêu?',c);
  r=await turn('G05-price-stock','Nếu lấy size M màu đen thì giá có khác không và hiện shop có xác nhận còn hàng không?',c);
  assert.equal(r.rows.length,1); assert.match(r.workflow.consultText,/Đen.*M.*20/); assert.match(r.workflow.consultText,/219/);
  r=await turn('G07','Có bao nhiêu áo thun nam dưới 250 nghìn màu đen còn size M? Liệt kê giúp mình các mẫu đó, nhưng đừng tính mẫu hết hàng.'); assert.equal(r.rows.length,7); assert.match(r.workflow.consultText,/Có 7/); assert.ok(r.rows.every(p=>r.workflow.consultText.includes(p.name)));
  const skuConversation={};
  r=await turn('G08','Mình tìm Quantum Unicorn ZX-999, nếu hết thì cho mẫu gần giống nhất dưới 300 nghìn, màu tối, size M.',skuConversation); assert.equal(r.rows.length,0); assert.match(r.workflow.consultText,/loại sản phẩm nào/);
  r=await turn('G08-type-clarification','Áo thun nam',skuConversation);assert.ok(r.rows.length>0);assert.ok(r.rows.every(p=>p.gender_id===1&&p.minPrice<=300000&&p.variants.every(v=>v.size==='M'&&['Đen','Xanh navy','Xám đậm','Nâu'].includes(v.color))));
  c={}; r=await turn('G09-conflict','Tìm áo vừa dưới 200 nghìn vừa trên 300 nghìn.',c); assert.match(r.workflow.consultText,/mâu thuẫn/);
  r=await turn('G09-correct','Ý mình là tối đa 300 nghìn, không cần mức tối thiểu.',c); assert.equal(r.workflow.productCount,23);
  c={}; r=await turn('G10-vague','Cho mình cái đẹp nhất.',c); assert.match(r.workflow.consultText,/loại sản phẩm nào/);
  r=await turn('G10-budget','Áo nữ mặc hằng ngày, dễ phối, khoảng 300 nghìn; mình chưa chọn màu.',c); assert.match(r.workflow.consultText,/ngân sách/);
  r=await turn('G10-followup','Có mẫu nào màu đen không?',c); assert.match(r.workflow.consultText,/màu đen/);assert.match(r.workflow.consultText,/300\.000đ/);assert.match(r.workflow.consultText,/unisex/);
  c={}; r=await turn('G12-groups','Mình đang chọn đồ cho hai người: áo nữ size M dưới 400 nghìn, còn chồng mình cần áo thun nam size L màu đen. Cho mình tách hai nhóm nhé.',c); assert.match(r.workflow.consultText,/hai người/);
  r=await turn('G12-select','Chỉ giữ nhóm của chồng, đổi size sang XL.',c); assert.equal(r.workflow.productCount,15); assert.match(r.workflow.consultText,/5\/15/);
  r=await turn('G01','Shop có áo nào dễ mặc đi làm không?'); assert.match(r.workflow.consultText,/sơ mi hay áo thun/); assert.doesNotMatch(r.workflow.consultText,/95/);
  // A matching color and a matching size on separate rows must never count as a match.
  const daily=products.find(p=>p.name==='Áo thun nam Daily');
  const blackM=variants.find(v=>v.product_id===daily.id&&v.color==='Đen'&&v.size==='M');
  const oldStock=blackM.stock; blackM.stock=0;
  r=await turn('Sold-out-combination','Áo thun nam Daily màu đen size M còn hàng không?');
  assert.equal(r.rows.length,0);
  r=await turn('Sold-out-detail','Áo thun nam Daily màu đen size M');
  assert.equal(r.rows.length,1); assert.match(r.workflow.consultText,/hết hàng/);
  blackM.stock=oldStock;
  // A new conversation must not silently inherit another conversation's product query.
  r=await turn('Conversation-isolation','Màu đen size M',{}, {lastProductQuery:'Áo thun nam Daily',lastProductQueryAt:Date.now()});
  assert.notEqual(r.conversation.lastProductQuery,'Áo thun nam Daily màu đen size M');
  assert.ok(r.rows.every(p=>p.name!=='Áo thun nam Daily'));
  // Unavailable service must remain an error, not become a verified zero count.
  const wf={userMessage:'Áo thun nam đen size M'};
  await search(wf,{}, {},{payload:{text:wf.userMessage}},env,{get:async()=>{throw Error('fixture outage');}});
  await respond(wf,{}, {},{},env,axios); assert.match(wf.consultText,/chưa thể truy vấn/);
  fs.writeFileSync(path.join(__dirname,'local-regression-results.json'),JSON.stringify({source:'Local action regression; mocked HTTP using public snapshot; variant prices are fixture values, not live evidence',at:new Date().toISOString(),passed:evidence.length+1,evidence},null,2));
  console.log(JSON.stringify({passed:evidence.length+1}));
})().catch(error=>{console.error(error);process.exitCode=1;});
