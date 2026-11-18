from docx import Document
from zipfile import ZipFile
from lxml import etree
from pathlib import Path
from docx.oxml.ns import qn
p=Path('Vu_Dang_Minh_Duc_242073_De_an_thac_si_ban_sua_lai.docx');d=Document(p)
print('NORMAL_STYLE',d.styles['Normal'].font.name,d.styles['Normal'].font.size.pt,d.styles['Normal'].paragraph_format.line_spacing)
print('SECTION_SETUP',[(round(s.page_width.mm),round(s.page_height.mm),round(s.top_margin.mm),round(s.bottom_margin.mm),round(s.left_margin.mm),round(s.right_margin.mm)) for s in d.sections])
print('TABLE_SPACING',sorted(set(str(c.paragraphs[0].paragraph_format.line_spacing) for t in d.tables for r in t.rows for c in r.cells if c.paragraphs)))
print('COUNTS',len(d.paragraphs),len(d.tables),len(d.inline_shapes))
with ZipFile(p) as z:
 bad=[]; missing=[]
 for name in z.namelist():
  if name.endswith('.xml') and name!='word/numbering.xml':
   root=etree.fromstring(z.read(name)); ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
   for r in root.xpath('.//w:r[.//w:t]',namespaces=ns):
    fonts=r.xpath('./w:rPr/w:rFonts',namespaces=ns)
    if not fonts: missing.append(name)
    else:
     vals=[fonts[0].get(qn('w:'+k)) for k in ('ascii','hAnsi','eastAsia','cs')]
     if any(v!='Times New Roman' for v in vals): bad.append((name,vals))
   # all XML parts well-formed
 print('FONT_MISSING_TEXT_RUNS',len(missing),'FONT_MISMATCH_TEXT_RUNS',len(bad),'ZIP_ERROR',z.testzip())
 print('XML_OK')
print('TOC_REFRESH', 'w:updateFields' in d.settings.element.xml)
print('QA',len(d.tables[7].rows)-1, {s:sum(1 for r in d.tables[7].rows[1:] if r.cells[2].text.strip()==s) for s in ('Pass','Partial','Fail')})
