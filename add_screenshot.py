from docx import Document
from docx.shared import Inches,Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.text.paragraph import Paragraph
from pathlib import Path
from lxml import etree
import zipfile
path=Path('Vu_Dang_Minh_Duc_242073_De_an_thac_si_ban_sua_lai.docx')
d=Document(path);body=d._element.body
labels={1:'H\u00ecnh 0.1. Quy tr\u00ecnh nghi\u00ean c\u1ee9u \u0111\u1ec1 xu\u1ea5t',2:'H\u00ecnh 1.1. Khung nghi\u00ean c\u1ee9u chatbot v\u00e0 UX',3:'H\u00ecnh 2.2. S\u01a1 \u0111\u1ed3 Use Case (ph\u1ea1m vi thi\u1ebft k\u1ebf)',4:'H\u00ecnh 2.1. Ki\u1ebfn tr\u00fac t\u00edch h\u1ee3p website, Botpress v\u00e0 Supabase',5:'H\u00ecnh 2.4. Lu\u1ed3ng h\u1ed9i tho\u1ea1i (m\u00f4 h\u00ecnh thi\u1ebft k\u1ebf)',6:'H\u00ecnh 2.3. S\u01a1 \u0111\u1ed3 tu\u1ea7n t\u1ef1 tra c\u1ee9u \u0111\u01a1n',7:'H\u00ecnh 2.5. S\u01a1 \u0111\u1ed3 lu\u1ed3ng d\u1eef li\u1ec7u m\u1ee9c 1',8:'H\u00ecnh 3.1. M\u00f4 h\u00ecnh tri\u1ec3n khai website v\u00e0 cloud',9:'H\u00ecnh 3.3. M\u00f4 h\u00ecnh UX \u0111\u1ec1 xu\u1ea5t; ch\u01b0a c\u00f3 kh\u1ea3o s\u00e1t'}
# Update figure labels and the paragraph beneath each image.
for p in list(d.paragraphs):
 ds=p._p.xpath('.//wp:docPr')
 if not ds or not ds[0].get('name','').startswith('FigJam diagram '):continue
 n=int(ds[0].get('name')[-2:]);ds[0].set('descr',labels[n])
 nxt=p._p.getnext()
 if nxt is not None and nxt.tag==qn('w:p'):
  cp=Paragraph(nxt,d)
  if cp.text.strip().startswith('H\u00ecnh '):
   cp.clear();r=cp.add_run(labels[n]);r.italic=True;r.font.name='Times New Roman';r.font.size=Pt(14);cp.alignment=WD_ALIGN_PARAGRAPH.CENTER
# Add a genuine production Webchat screenshot after its implementation description.
head=next(p for p in d.paragraphs if p.text.strip().startswith('3.2.6. Nh\u00fang Botpress Webchat'))
desc=head._p.getnext()
while desc is not None and (desc.tag!=qn('w:p') or not Paragraph(desc,d).text.strip()):desc=desc.getnext()
if desc is None:raise ValueError('Webchat paragraph missing')
imgp=OxmlElement('w:p');desc.addnext(imgp);ip=Paragraph(imgp,d);ip.alignment=WD_ALIGN_PARAGRAPH.CENTER;ip.paragraph_format.keep_with_next=True
run=ip.add_run();run.add_picture('widget-screenshot.jpg',width=Inches(3.4))
docs=ip._p.xpath('.//wp:docPr')
if docs:docs[0].set('name','Production Webchat guest screenshot');docs[0].set('descr','Guest Webchat on the production storefront, captured 17 November 2026')
cape=OxmlElement('w:p');imgp.addnext(cape);cp=Paragraph(cape,d);cp.alignment=WD_ALIGN_PARAGRAPH.CENTER
r=cp.add_run('H\u00ecnh 3.2. Giao di\u1ec7n Botpress Webchat tr\u00ean website production (guest, 17/11/2026)');r.italic=True;r.font.name='Times New Roman';r.font.size=Pt(14)
# Refresh the manual List of Figures to reflect only the inserted diagrams and screenshot.
h=next(p for p in d.paragraphs if p.text.strip()=='DANH M\u1ee4C H\u00ccNH')
e=next(p for p in d.paragraphs if p.text.strip()=='PH\u1ea6N M\u1ede \u0110\u1ea6U')
kids=list(body);a=kids.index(h._p);b=kids.index(e._p)
for x in kids[a+1:b]:
 if x.tag==qn('w:p'):body.remove(x)
items=[labels[1],labels[2],labels[4],labels[3],labels[6],labels[5],labels[7],labels[8],'H\u00ecnh 3.2. Giao di\u1ec7n Botpress Webchat tr\u00ean website production (guest, 17/11/2026)',labels[9]]
cur=h
for title in items:
 el=OxmlElement('w:p');cur._p.addnext(el);cur=Paragraph(el,d);cur.style='Normal';cur.add_run(title)
# A4 formatting and update fields.
for sec in d.sections:
 sec.page_width=Inches(8.2677);sec.page_height=Inches(11.6929)
 sec.top_margin=Inches(1.378);sec.bottom_margin=Inches(1.181);sec.left_margin=Inches(1.378);sec.right_margin=Inches(.787)
for p in d.paragraphs:
 if p.text.strip().startswith('H\u00ecnh '):
  p.alignment=WD_ALIGN_PARAGRAPH.CENTER
  for r in p.runs:r.font.name='Times New Roman';r.font.size=Pt(14);r.italic=True
u=d.settings._element.find(qn('w:updateFields'))
if u is None:u=OxmlElement('w:updateFields');d.settings._element.append(u)
u.set(qn('w:val'),'true')
d.save(path)
with zipfile.ZipFile(path) as z:
 assert z.testzip() is None
 for n in z.namelist():
  if n.endswith('.xml') or n.endswith('.rels'):etree.fromstring(z.read(n))
print('saved',path.stat().st_size,'images',len(d.inline_shapes),'sections',len(d.sections))
