from docx import Document
from docx.shared import Mm,Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.text.paragraph import Paragraph
from copy import deepcopy
from pathlib import Path
from lxml import etree
import zipfile
src=Path('Vu_Dang_Minh_Duc_242073_De_an_thac_si_hoan_thien_v2.docx')
out=Path('Vu_Dang_Minh_Duc_242073_De_an_thac_si_ban_sua_lai.docx')
d=Document(src);body=d._element.body
def find(pre):return next(p for p in d.paragraphs if p.text.strip().startswith(pre))
def setp(p,text,style=None):
 old=p.style;p.clear();p.add_run(text);p.style=style or old
# Put the opening in the sequence prescribed by the guide.
setp(find('2.3. Ph\u1ea1m vi nghi\u00ean c\u1ee9u'),'4. Ph\u1ea1m vi nghi\u00ean c\u1ee9u','Heading 2')
setp(find('2.4. \u0110\u1ed1i t\u01b0\u1ee3ng nghi\u00ean c\u1ee9u'),'5. \u0110\u1ed1i t\u01b0\u1ee3ng nghi\u00ean c\u1ee9u','Heading 2')
setp(find('3. Ph\u01b0\u01a1ng ph\u00e1p nghi\u00ean c\u1ee9u'),'3. Ph\u01b0\u01a1ng ph\u00e1p nghi\u00ean c\u1ee9u','Heading 2')
for p in d.paragraphs:
 if p.text.strip().startswith(('3.1. Ph\u01b0\u01a1ng ph\u00e1p','3.2. Ph\u01b0\u01a1ng ph\u00e1p','3.3. Ph\u01b0\u01a1ng ph\u00e1p')):p.style='Heading 3'
# Reorganize Chapter 1 to the guide's two top-level sections.
renumber={
'1.1 Tổng quan Chatbot trong thương mại điện tử':('1.1. Cơ sở lý thuyết','Heading 2'),
'1.1.1. Khái niệm Chatbot':('1.1.1. Chatbot trong thương mại điện tử','Heading 3'),
'1.1.2. Vai trò chatbot trong TMĐT':('1.1.1.2. Vai trò chatbot trong TMĐT','Heading 4'),
'1.1.3. Các mô hình chatbot phổ biến':('1.1.1.3. Các mô hình chatbot phổ biến','Heading 4'),
'1.1.4. Các thành phần chính của Conversational AI':('1.1.1.4. Các thành phần Conversational AI','Heading 4'),
'Vai trò của Retrieval Augmented Generation':('1.1.1.5. RAG: mô hình khái quát','Heading 4'),
'1.2. Cơ sở lý thuyết về trải nghiệm người dùng':'1.1.2. Trải nghiệm người dùng trong TMĐT',
'1.2.1. Khái niệm User Experience':'1.1.2.1. Khái niệm UX',
'1.2.2. Các yếu tố ảnh hưởng':'1.1.2.2. Các yếu tố ảnh hưởng tới UX',
'1.2.3. Mô hình đánh giá':'1.1.2.3. Mô hình đánh giá UX',
'1.3. Tổng quan về nền tảng Botpress':'1.1.3. Nền tảng Botpress',
'1.3.1. Giới thiệu nền tảng':'1.1.3.1. Giới thiệu Botpress',
'1.3.2. Kiến trúc hệ thống':'1.1.3.2. Kiến trúc và thành phần',
'1.3.3. Các thành phần chính':'1.1.3.3. Thành phần sử dụng',
'1.3.4. Khả năng tích hợp':'1.1.3.4. Khả năng tích hợp',
'1.3.5. So sánh Botpress':'1.1.3.5. So sánh nền tảng',
'1.4. Tổng quan các công trình nghiên cứu liên quan':'1.2. Tổng quan công trình đã công bố liên quan',
'1.4.1. Các nghiên cứu về chatbot':'1.2.1. Nghiên cứu chatbot trong TMĐT',
'1.4.2. Các nghiên cứu về cải thiện':'1.2.2. Nghiên cứu UX',
'1.4.3. Phân tích, đánh giá':'1.2.3. Phân tích khoảng trống nghiên cứu',
'1.4.4. Tính khoa học':'1.2.4. Tính khoa học và thực tiễn',
'1.4.5. Một số case study':'1.2.5. Case study tham khảo'
}
# Apply most-specific heading mappings first so a prefix doesn't consume a nested heading.
for p in d.paragraphs:
 s=p.text.strip()
 matches=[(k,v) for k,v in renumber.items() if s.startswith(k)]
 if matches:
  k,v=max(matches,key=lambda x:len(x[0]))
  if isinstance(v,tuple): title,sty=v
  else:
   title=v
   if k=='1.4. Tổng quan các công trình nghiên cứu liên quan':sty='Heading 2'
   elif k.startswith('1.4.') or k.startswith('1.2.1.') or k.startswith('1.2.2.') or k.startswith('1.2.3.') or k.startswith('1.3.') or k.startswith('1.1.2.') or k.startswith('1.1.3.') or k.startswith('1.1.4.'):sty='Heading 3' if k.startswith('1.4.') or k.startswith('1.2.') or k.startswith('1.3.') else 'Heading 4'
   else:sty='Heading 3'
  setp(p,title,sty)
# State Chapter 2 as the analysis/design chapter required by the guide.
setp(find('CH\u01af\u01a0NG 2.'),'CH\u01af\u01a0NG 2. PH\u00c2N T\u00cdCH V\u00c0 THI\u1ebeT K\u1ebe PH\u1ea6N M\u1ec0M CHATBOT','Heading 1')
setp(find('2.2. Thi\u1ebft k\u1ebf ki\u1ebfn tr\u00fac h\u1ec7 th\u1ed1ng'),'2.2. Thi\u1ebft k\u1ebf Use Case, ki\u1ebfn tr\u00fac v\u00e0 lu\u1ed3ng t\u01b0\u01a1ng t\u00e1c','Heading 2')
# Page setup mandated by the school's guide.
for sec in d.sections:
 sec.page_width=Mm(210);sec.page_height=Mm(297)
 sec.top_margin=Mm(35);sec.bottom_margin=Mm(30);sec.left_margin=Mm(35);sec.right_margin=Mm(20)
 sec.header_distance=Mm(15);sec.footer_distance=Mm(15)
# Insert section breaks before introduction and appendices; one existing break separates cover from preliminary pages.
def section_break_before(p):
 ppr=p._p.get_or_add_pPr()
 if ppr.find(qn('w:sectPr')) is None:ppr.append(deepcopy(body.sectPr))
intro=find('PH\u1ea6N M\u1ede \u0110\u1ea6U');appendix=find('PH\u1ee4 L\u1ee4C')
section_break_before(intro);section_break_before(appendix)
# Re-number front matter with Roman numerals, main text from 1, appendices with PL prefix.
sections=list(d.sections)
if len(sections)!=4:raise ValueError('Expected 4 sections after adding intro/appendix breaks; got '+str(len(sections)))
def set_pagefmt(sec,fmt,start='1'):
 el=sec._sectPr.find(qn('w:pgNumType'))
 if el is None:el=OxmlElement('w:pgNumType');sec._sectPr.append(el)
 el.set(qn('w:fmt'),fmt);el.set(qn('w:start'),start)
set_pagefmt(sections[1],'lowerRoman','1');set_pagefmt(sections[2],'decimal','1');set_pagefmt(sections[3],'decimal','1')
# Place page numbers at the top center. Cover section remains unnumbered.
for idx,sec in enumerate(sections):
 sec.header.is_linked_to_previous=False
 hp=sec.header.paragraphs[0];hp.clear();hp.alignment=WD_ALIGN_PARAGRAPH.CENTER
 if idx==0:
  sec.different_first_page_header_footer=True
  sec.first_page_header.paragraphs[0].clear()
  continue
 if idx==3:hp.add_run('PL')
 fld=OxmlElement('w:fldSimple');fld.set(qn('w:instr'),' PAGE ')
 run=OxmlElement('w:r');text=OxmlElement('w:t');text.text='1';run.append(text);fld.append(run);hp._p.append(fld)
# Standardize the document on Times New Roman 14 pt and 1.5 spacing.
for style in d.styles:
 try:
  style.font.name='Times New Roman';style.font.size=Pt(14)
  rpr=style._element.get_or_add_rPr();rf=rpr.rFonts
  if rf is None:rf=OxmlElement('w:rFonts');rpr.append(rf)
  rf.set(qn('w:eastAsia'),'Times New Roman')
  if style.type==WD_STYLE_TYPE.PARAGRAPH:style.paragraph_format.line_spacing=1.5
 except Exception:pass
for p in d.paragraphs:
 p.paragraph_format.line_spacing=1.5
 for r in p.runs:
  r.font.name='Times New Roman';r.font.size=Pt(14)
  if r._element.rPr is not None:
   rf=r._element.rPr.rFonts
   if rf is None:rf=OxmlElement('w:rFonts');r._element.rPr.append(rf)
   rf.set(qn('w:eastAsia'),'Times New Roman')
for t in d.tables:
 for row in t.rows:
  for c in row.cells:
   for p in c.paragraphs:
    p.paragraph_format.line_spacing=1.5
    for r in p.runs:
     r.font.name='Times New Roman';r.font.size=Pt(14)
     if r._element.rPr is not None:
      rf=r._element.rPr.rFonts
      if rf is None:rf=OxmlElement('w:rFonts');r._element.rPr.append(rf)
      rf.set(qn('w:eastAsia'),'Times New Roman')
# Ask Word to refresh the existing automatic table of contents and page references.
settings=d.settings._element
up=settings.find(qn('w:updateFields'))
if up is None:up=OxmlElement('w:updateFields');settings.append(up)
up.set(qn('w:val'),'true')
d.core_properties.subject='Hi\u1ec7u ch\u1ec9nh theo H\u01b0\u1edbng d\u1eabn \u0111\u1ec1 \u00e1n th\u1ea1c s\u0129 KTPM 2023'
d.save(out)
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 for name in z.namelist():
  if name.endswith('.xml') or name.endswith('.rels'):etree.fromstring(z.read(name))
check=Document(out)
print(out,'sections',len(check.sections),'size',check.stat() if hasattr(check,'stat') else out.stat().st_size,'paragraphs',len(check.paragraphs),'tables',len(check.tables),'images',len(check.inline_shapes))
