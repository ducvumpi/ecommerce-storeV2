from docx import Document
from docx.shared import Pt, Mm
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.text.paragraph import Paragraph
from docx.table import Table
from pathlib import Path
from lxml import etree
import zipfile
path=Path('Vu_Dang_Minh_Duc_242073_De_an_thac_si_ban_sua_lai.docx')
d=Document(path)
def find(pre):return next(p for p in d.paragraphs if p.text.strip().startswith(pre))
def add_after(a,text,style='Normal'):
 e=OxmlElement('w:p');a._p.addnext(e);p=Paragraph(e,a._parent);p.style=style;p.paragraph_format.line_spacing=1.5
 r=p.add_run(text);r.font.name='Times New Roman';r.font.size=Pt(14)
 if r._element.rPr is not None:
  rf=r._element.rPr.rFonts
  if rf is None:rf=OxmlElement('w:rFonts');r._element.rPr.append(rf)
  rf.set(qn('w:eastAsia'),'Times New Roman')
 return p
# Make the preliminary methodology reproducible and consistent with available evidence.
put=find('3.1. Ph\u01b0\u01a1ng ph\u00e1p nghi\u00ean c\u1ee9u l\u00fd thuy\u1ebft')
for old,new in [
('3.1. Ph\u01b0\u01a1ng ph\u00e1p nghi\u00ean c\u1ee9u l\u00fd thuy\u1ebft','3.1. Ph\u01b0\u01a1ng ph\u00e1p nghi\u00ean c\u1ee9u t\u00e0i li\u1ec7u'),
('3.2. Ph\u01b0\u01a1ng ph\u00e1p ph\u00e2n t\u00edch \u2013 thi\u1ebft k\u1ebf h\u1ec7 th\u1ed1ng','3.2. Ph\u01b0\u01a1ng ph\u00e1p ph\u00e2n t\u00edch v\u00e0 thi\u1ebft k\u1ebf'),
('3.3. Ph\u01b0\u01a1ng ph\u00e1p th\u1ef1c nghi\u1ec7m v\u00e0 \u0111\u00e1nh gi\u00e1','3.3. Ph\u01b0\u01a1ng ph\u00e1p ki\u1ec3m th\u1eed v\u00e0 ph\u00e2n t\u00edch b\u1eb1ng ch\u1ee9ng')]:
 for p in d.paragraphs:
  if p.text.strip()==old:p.text=new;p.style='Heading 3'
# Replace diary-style prose around the approach.
for p in list(d.paragraphs):
 s=p.text.strip()
 if s.startswith('Để có nền tảng lý luận vững'):
  p.text="Ph\u01b0\u01a1ng ph\u00e1p nghi\u00ean c\u1ee9u t\u00e0i li\u1ec7u t\u1ed5ng h\u1ee3p c\u00e1c kh\u00e1i ni\u1ec7m v\u1ec1 chatbot, UX, m\u00f4 h\u00ecnh ch\u1ea5p nh\u1eadn c\u00f4ng ngh\u1ec7 v\u00e0 t\u00edch h\u1ee3p h\u1ec7 th\u1ed1ng. T\u00e0i li\u1ec7u g\u1ed3m c\u00f4ng tr\u00ecnh h\u1ecdc thu\u1eadt v\u00e0 t\u00e0i li\u1ec7u ch\u00ednh th\u1ee9c c\u1ee7a Botpress, Next.js v\u00e0 Supabase. C\u00e1c nh\u1eadn \u0111\u1ecbnh v\u1ec1 h\u1ec7 th\u1ed1ng \u0111\u01b0\u1ee3c \u0111\u1ed1i chi\u1ebfu v\u1edbi m\u00e3 ngu\u1ed3n v\u00e0 b\u00e1o c\u00e1o ki\u1ec3m th\u1eed."
 if s.startswith('Với riêng Botpress'):
  p.text="T\u00e0i li\u1ec7u n\u1ec1n t\u1ea3ng \u0111\u01b0\u1ee3c tham kh\u1ea3o \u0111\u1ec3 x\u00e1c \u0111\u1ecbnh c\u00e1ch nh\u00fang Webchat v\u00e0 c\u00e1ch t\u1ed5 ch\u1ee9c workflow. Phi\u00ean b\u1ea3n, gi\u1edbi h\u1ea1n d\u1ecbch v\u1ee5 v\u00e0 c\u1ea5u h\u00ecnh model ph\u1ea3i ghi r\u00f5 theo th\u1eddi \u0111i\u1ec3m; b\u1ea3n n\u00e0y kh\u00f4ng suy di\u1ec5n c\u00e1c chi ti\u1ebft kh\u00f4ng l\u01b0u trong h\u1ed3 s\u01a1."
 if s.startswith('Quá trình tổng hợp không chỉ'):
  p.text="Quy tr\u00ecnh t\u1ed5ng h\u1ee3p ph\u00e2n bi\u1ec7t ba nh\u00f3m b\u1eb1ng ch\u1ee9ng: (1) t\u00e0i li\u1ec7u l\u00fd thuy\u1ebft, (2) m\u00e3 ngu\u1ed3n/configuration c\u00f3 th\u1ec3 quan s\u00e1t, v\u00e0 (3) k\u1ebft qu\u1ea3 production theo case. N\u1ebfu kh\u00f4ng c\u00f3 b\u1eb1ng ch\u1ee9ng nh\u00f3m 2 ho\u1eb7c 3, n\u1ed9i dung ch\u1ec9 \u0111\u01b0\u1ee3c tr\u00ecnh b\u00e0y nh\u01b0 thi\u1ebft k\u1ebf/gi\u1ea3 thuy\u1ebft."
 if s.startswith('Sau khi có yêu cầu từ khảo sát thực tế'):
  p.text="Ph\u00e2n t\u00edch y\u00eau c\u1ea7u d\u1ef1a tr\u00ean ph\u1ea1m vi website, c\u00e1c lu\u1ed3ng nghi\u1ec7p v\u1ee5 c\u1ee7a chatbot v\u00e0 b\u1ea3n ghi ki\u1ec3m th\u1eed. H\u00ecnh Use Case, lu\u1ed3ng v\u00e0 ki\u1ebfn tr\u00fac l\u00e0 m\u00f4 h\u00ecnh thi\u1ebft k\u1ebf; t\u00ean node/endpoint trong ph\u1ea7n tri\u1ec3n khai ch\u1ec9 \u0111\u01b0\u1ee3c n\u00eau khi x\u00e1c minh trong repo ho\u1eb7c Botpress."
# Add the guide's requested, source-backed data-access/security design under Chapter 2.
dbhead=find('2.2.5. Thi\u1ebft k\u1ebf c\u01a1 s\u1edf d\u1eef li\u1ec7u')
p=dbhead
p=add_after(p,"Trong lu\u1ed3ng profile, Supabase Auth cung c\u1ea5p user id sau khi x\u00e1c minh session/access token. Route /api/chat/profile truy v\u1ea5n b\u1ea3ng profiles v\u1edbi \u0111i\u1ec1u ki\u1ec7n id = user.id v\u00e0 ch\u1ec9 ch\u1ecdn id, email, first_name, last_name. Profile \u0111\u01b0\u1ee3c tr\u1ea3 v\u1ec1 client theo nhu c\u1ea7u chatbot; response \u0111\u01b0\u1ee3c g\u1eafn Cache-Control: private, no-store.")
p=add_after(p,"Route /api/chat/orders truy v\u1ea5n orders v\u00e0 c\u00e1c order_items li\u00ean k\u1ebft, bao g\u1ed3m t\u00ean s\u1ea3n ph\u1ea9m, s\u1ed1 l\u01b0\u1ee3ng, size, m\u00e0u, gi\u00e1, t\u1ed5ng ti\u1ec1n v\u00e0 tr\u1ea1ng th\u00e1i. K\u1ebft qu\u1ea3 \u0111\u01b0\u1ee3c gi\u1edbi h\u1ea1n t\u1ed1i \u0111a 10 \u0111\u01a1n v\u00e0 s\u1eafp theo created_at gi\u1ea3m d\u1ea7n; query b\u1eaft bu\u1ed9c .eq('user_id', authorizedUserId).")
p=add_after(p,"Th\u00f4ng tin x\u00e1c th\u1ef1c \u0111\u01b0\u1ee3c coi l\u00e0 bi\u00ean tin c\u1eady: route kh\u00f4ng d\u00f9ng userId/email t\u1eeb body/event \u0111\u1ec3 ph\u00e2n quy\u1ec1n. Khi d\u00f9ng chat token, service-role key ch\u1ec9 \u0111\u01b0\u1ee3c kh\u1edfi t\u1ea1o trong server runtime; truy v\u1ea5n v\u1eabn b\u1ecb r\u00e0ng bu\u1ed9c theo subject trong token.")
p=add_after(p,"Th\u01b0 m\u1ee5c sql c\u00f3 t\u1eadp harden_customer_data_rls.sql \u0111\u1ec1 xu\u1ea5t policy own-row cho profiles, orders, order_items v\u00e0 addresses, c\u00f9ng ki\u1ec3m tra app_metadata cho admin. T\u00e0i li\u1ec7u n\u00e0y ghi r\u00f5 c\u1ea7n review/apply; ch\u01b0a c\u00f3 b\u1eb1ng ch\u1ee9ng policy \u0111\u00e3 \u0111\u01b0\u1ee3c \u00e1p d\u1ee5ng tr\u00ean production, n\u00ean \u0111\u1ec1 \u00e1n kh\u00f4ng tuy\u00ean b\u1ed1 \u0111i\u1ec1u \u0111\u00f3.")
# Add a detailed trust-boundary subsection after the architecture/API diagrams.
anchor=find('H\u00ecnh 2.7.')
p=add_after(anchor,'2.2.7. Thi\u1ebft k\u1ebf x\u00e1c th\u1ef1c v\u00e0 ph\u00e2n quy\u1ec1n','Heading 3')
p=add_after(p,"H\u1ec7 th\u1ed1ng c\u00f3 hai nh\u00f3m danh t\u00ednh. Guest c\u00f3 th\u1ec3 t\u01b0\u01a1ng t\u00e1c v\u1edbi workflow s\u1ea3n ph\u1ea9m, nh\u01b0ng kh\u00f4ng \u0111\u01b0\u1ee3c truy c\u1eadp d\u1eef li\u1ec7u \u0111\u01a1n h\u00e0ng. Auth \u0111\u01b0\u1ee3c x\u00e1c minh b\u1eb1ng Supabase Auth; route ph\u00eda website l\u1ea5y profile theo user id c\u1ee7a session. T\u00e1ch lu\u1ed3ng n\u00e0y tr\u00e1nh vi\u1ec7c l\u1ea5y m\u1ed9t tr\u01b0\u1eddng email ho\u1eb7c userId t\u1ef1 khai t\u1eeb chat l\u00e0m b\u1eb1ng ch\u1ee9ng \u0111\u1ecbnh danh.")
p=add_after(p,"Botpress kh\u00f4ng c\u00f3 cookie Supabase c\u1ee7a tr\u00ecnh duy\u1ec7t. V\u00ec v\u1eady, sau khi profile \u0111\u01b0\u1ee3c x\u00e1c minh, server c\u00f3 th\u1ec3 ph\u00e1t h\u00e0nh chat order token khi BOTPRESS_ORDER_TOKEN_SECRET \u0111\u1ee7 \u0111\u1ed9 d\u00e0i. Payload g\u1ed3m subject (sub), scope chat:orders:read v\u00e0 th\u1eddi h\u1ea1n exp; TTL \u0111\u01b0\u1ee3c c\u1ea5u h\u00ecnh 15 ph\u00fat. Token d\u00f9ng HMAC-SHA256/base64url v\u00e0 verify b\u1eb1ng timingSafeEqual; secret kh\u00f4ng g\u1eedi ra browser.")
p=add_after(p,"Orders route \u01b0u ti\u00ean session Supabase server-side; n\u1ebfu kh\u00f4ng c\u00f3 session, route th\u1eed x\u00e1c minh bearer token. Token chat h\u1ee3p l\u1ec7 m\u1edbi cho ph\u00e9p d\u00f9ng service-role client t\u1ea1i server. C\u00e1c l\u1ed7i \u0111\u01b0\u1ee3c tr\u1ea3 v\u1edbi m\u00e3 ph\u00f9 h\u1ee3p: 401 khi kh\u00f4ng x\u00e1c th\u1ef1c, 503 khi ch\u01b0a c\u1ea5u h\u00ecnh service secret, v\u00e0 500 khi truy v\u1ea5n l\u1ed7i; th\u00f4ng tin chi ti\u1ebft ch\u1ec9 ghi log server.")
p=add_after(p,"Bi\u00ean tin c\u1eady c\u1ee7a h\u1ec7 th\u1ed1ng n\u1eb1m \u1edf route server v\u00e0 Supabase Auth, c\u00f2n Botpress ch\u1ec9 chuy\u1ec3n y\u00eau c\u1ea7u \u0111\u00e3 x\u00e1c th\u1ef1c. B\u00e1o c\u00e1o production quan s\u00e1t guest b\u1ecb y\u00eau c\u1ea7u \u0111\u0103ng nh\u1eadp; tuy nhi\u00ean, c\u00e1c b\u00e0i ki\u1ec3m tra n\u00e0y kh\u00f4ng thay cho audit backend/trace.")
# Add assessment methodology details without inventing a participant study.
p=find('Báo cáo production ngày 16/11/2026 gồm 15 case Guest')
p=add_after(p,"Quy tr\u00ecnh test ghi nh\u1eadn ng\u00e0y ch\u1ea1y, vai tr\u00f2, t\u00ecnh hu\u1ed1ng, ph\u1ea3n h\u1ed3i UI v\u00e0 nh\u00e3n k\u1ebft qu\u1ea3. Pass ch\u1ec9 c\u00f3 ngh\u0129a case \u0111\u00e1p \u1ee9ng k\u1ef3 v\u1ecdng tr\u00ean giao di\u1ec7n trong l\u1ea7n ch\u1ea1y \u0111\u00f3; Partial c\u00f3 ngh\u0129a c\u00f3 gi\u1edbi h\u1ea1n ch\u01b0a th\u1eed \u0111\u01b0\u1ee3c ho\u1eb7c th\u00f4ng tin thi\u1ebfu; Fail l\u00e0 h\u00e0nh vi quan s\u00e1t \u0111i ng\u01b0\u1ee3c k\u1ef3 v\u1ecdng.")
p=add_after(p,"Ki\u1ec3m th\u1eed Guest d\u00f9ng conversation guest \u0111ang m\u1edf v\u00e0 g\u1eedi c\u00e1c case li\u00ean ti\u1ebfp; do kh\u00f4ng nh\u1ea5n Restart, m\u1ed9t s\u1ed1 case nhi\u1ec1u l\u01b0\u1ee3t c\u00f3 th\u1ec3 b\u1ecb \u1ea3nh h\u01b0\u1edfng context tr\u01b0\u1edbc. Case Auth ch\u1ec9 \u0111i\u1ec1u h\u01b0\u1edbng v\u00e0 \u0111\u1ecdc d\u1eef li\u1ec7u hi\u1ec7n c\u00f3; kh\u00f4ng submit login/register, logout, \u0111\u1ed5i h\u1ed3 s\u01a1 hay t\u1ea1o \u0111\u01a1n.")
# Add measured-result interpretation and improvement priorities after the 24-case matrix.
tab=next(t for t in d.tables if t.rows and t.cell(0,0).text.strip()=='ID' and len(t.rows)==25)
anchor=Paragraph(tab._tbl,d)
p=add_after(anchor,"Ph\u00e2n b\u1ed5 theo vai tr\u00f2: Guest 11/15 Pass (73,3%), 3/15 Partial (20,0%), 1/15 Fail (6,7%); Auth 5/9 Pass (55,6%), 3/9 Partial (33,3%), 1/9 Fail (11,1%). T\u1ec9 l\u1ec7 g\u1ed9p 16/24 Pass (66,7%), 6/24 Partial (25,0%) v\u00e0 2/24 Fail (8,3%). C\u00e1c t\u1ec9 l\u1ec7 n\u00e0y ch\u1ec9 m\u00f4 t\u1ea3 t\u1eadp case \u0111\u00e3 ch\u1ea1y, kh\u00f4ng \u0111\u1ea1i di\u1ec7n cho t\u1ea5t c\u1ea3 lu\u1ed3ng ho\u1eb7c ng\u01b0\u1eddi d\u00f9ng.")
p=add_after(p,"Ba v\u1ea5n \u0111\u1ec1 \u01b0u ti\u00ean t\u1eeb c\u00e1c k\u1ebft qu\u1ea3 l\u00e0 ho\u00e0n t\u1ea5t fallback s\u1ea3n ph\u1ea9m thay th\u1ebf cho SKU kh\u00f4ng t\u1ed3n t\u1ea1i; s\u1eeda li\u00ean k\u1ebft /settings tr\u1ea3 404; v\u00e0 \u0111\u1ed3ng b\u1ed9 greeting Guest/Auth sau khi \u0111\u0103ng nh\u1eadp. C\u00e1c v\u1ea5n \u0111\u1ec1 kh\u00e1c c\u1ea7n b\u1ed5 sung th\u00f4ng tin ph\u00ed/th\u1eddi gian v\u1eadn chuy\u1ec3n, ch\u1ecdn trang login/register khi user \u0111\u00e3 Auth v\u00e0 test fallback size khi M h\u1ebft h\u00e0ng.")
# Ensure page setup, field refresh and save.
for s in d.sections:
 s.page_width=Mm(210);s.page_height=Mm(297)
 s.top_margin=Mm(35);s.bottom_margin=Mm(30);s.left_margin=Mm(35);s.right_margin=Mm(20)
d.save(path)
