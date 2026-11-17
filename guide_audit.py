from docx import Document
p=r'C:\Users\Win10\Desktop\Hồ sơ đề án tốt nghiệp Thạc sĩ KTPM\Hướng dẫn đề án tốt nghiệp KTPM\1. Hướng dẫn làm đề án tốt nghiệp KTPM.docx'
d=Document(p)
for i,x in enumerate(d.paragraphs):
 t=x.text.strip()
 if t: print(i,t[:300])
