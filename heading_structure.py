from docx import Document
from docx.shared import Pt
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.text.paragraph import Paragraph
from pathlib import Path
p=Path('Vu_Dang_Minh_Duc_242073_De_an_thac_si_ban_sua_lai.docx');d=Document(p)
def setp(x,text,style):
 x.clear();x.add_run(text);x.style=style
# Opening hierarchy requested by the graduate-school guide.
for x in d.paragraphs:
 s=x.text.strip()
 if s.startswith('3. Ph\u01b0\u01a1ng ph\u00e1p nghi\u00ean c\u1ee9u'):x.style='Heading 2'
 elif s.startswith(('3.1. Ph\u01b0\u01a1ng ph\u00e1p','3.2. Ph\u01b0\u01a1ng ph\u00e1p','3.3. Ph\u01b0\u01a1ng ph\u00e1p')):x.style='Heading 3'
# Literature Chapter 1: one theory section plus a separate prior-work section.
p11=next(x for x in d.paragraphs if x.text.strip()=='1.1. C\u01a1 s\u1edf l\u00fd thuy\u1ebft')
pconcept=next(x for x in d.paragraphs if x.text.strip().startswith('1.1.1. Chatbot trong th\u01b0\u01a1ng m\u1ea1i \u0111i\u1ec7n t\u1eed'))
setp(pconcept,'1.1.1.1. Kh\u00e1i ni\u1ec7m chatbot','Heading 4')
e=OxmlElement('w:p');pconcept._p.addprevious(e);hp=Paragraph(e,d);hp.style='Heading 3';hp.add_run('1.1.1. Chatbot trong th\u01b0\u01a1ng m\u1ea1i \u0111i\u1ec7n t\u1eed')
for x in d.paragraphs:
 s=x.text.strip()
 if s.startswith('1.1.1.2.') or s.startswith('1.1.1.3.') or s.startswith('1.1.1.4.') or s.startswith('1.1.1.5.'):x.style='Heading 4'
 if s.startswith('1.1.2. Tr\u1ea3i nghi\u1ec7m ng\u01b0\u1eddi d\u00f9ng'):x.style='Heading 3'
 if s.startswith(('1.1.2.1.','1.1.2.2.','1.1.2.3.')):x.style='Heading 4'
 if s.startswith('1.1.3. N\u1ec1n t\u1ea3ng Botpress'):x.style='Heading 3'
 if s.startswith(('1.1.3.1.','1.1.3.2.','1.1.3.3.','1.1.3.4.','1.1.3.5.')):x.style='Heading 4'
 if s.startswith('1.2. T\u1ed5ng quan c\u00f4ng tr\u00ecnh'):x.style='Heading 2'
 if s.startswith(('1.2.1.','1.2.2.','1.2.3.','1.2.4.','1.2.5.')):x.style='Heading 3'
# Promote the architecture subsection to a proper numbered heading and normalize numbering.
for x in d.paragraphs:
 s=x.text.strip()
 if s.startswith('2.2.1 Ki\u1ebfn tr\u00fac t\u1ed5ng th\u1ec3'):x.style='Heading 3';setp(x,'2.2.1. Ki\u1ebfn tr\u00fac t\u1ed5ng th\u1ec3 h\u1ec7 th\u1ed1ng','Heading 3')
 if s.startswith('2.2.2. Thi\u1ebft k\u1ebf Use Case'):x.style='Heading 3'
 if s.startswith('2.2.5. Thi\u1ebft k\u1ebf c\u01a1 s\u1edf d\u1eef li\u1ec7u'):x.style='Heading 3'
 if s.startswith('2.2.6. Thi\u1ebft k\u1ebf t\u00edch h\u1ee3p'):x.style='Heading 3'
# Ensure field refresh is enabled after headings were changed.
u=d.settings._element.find(qn('w:updateFields'))
if u is None:u=OxmlElement('w:updateFields');d.settings._element.append(u)
u.set(qn('w:val'),'true')
d.save(p)
print('headings normalized')
