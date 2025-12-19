"use client";
import feather from "feather-icons";
import { useEffect, } from "react";
export default function Footer() {
  useEffect(() => {
    feather.replace();
  }, []);
  return (
    <div className="footer bg-slate-800 text-white py-12 pt-16">
      <div className="footer-container">
        <div className="footer-about">
          <div className="footer-logo">Tiệm Mùa Chậm</div>
          <p className="footer-description">
            Điểm đến của bạn cho những xu hướng và phong cách thời trang mới nhất.
          </p>
          <div className="footer-social">
            <a href="#">
              <i data-feather="facebook"></i>
            </a>
            <a href="#">
              <i data-feather="instagram"></i>
            </a>
            <a href="#">
              <i data-feather="twitter"></i>
            </a>
            <a href="#">
              <i data-feather="youtube"></i>
            </a>
          </div>
        </div>
        <div className="footer-links">
          <h3>Shop</h3>
          <ul>
            <li>
              <a href="/men.html">{"Thời trang nam"}</a>
            </li>
            <li>
              <a href="/women.html">{"Thời trang Nữ"}</a>
            </li>
            <li>
              <a href="/accessories.html">Phụ kiện

              </a>
            </li>
            <li>
              <a href="/footwear.html">Giày dép
              </a>
            </li>
          </ul>
        </div>
        <div className="footer-links" >
          <h3>Hỗ trợ</h3>
          <ul>
            <li>
              <a href="/faq.html">FAQ</a>
            </li>
            <li>
              <a href="/shipping.html">Vận chuyển & Trả hàng
              </a>
            </li>
            <li>
              <a href="/size-guide.html">
                Hướng dẫn chọn kích thước</a>
            </li>
            <li>
              <a href="/contact.html">Liên hệ với chúng tôi
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-links">
          <h3>Công ty
          </h3>
          <ul>
            <li>
              <a href="/about.html">Về chúng tôi
              </a>
            </li>
            <li>
              <a href="/blog.html">Blog</a>
            </li>
            <li>
              <a href="/careers.html">Nghề nghiệp
              </a>
            </li>
            <li>
              <a href="/privacy.html">Chính sách bảo mật
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} Tiệm mùa chậm. Bản quyền thuộc về Tiệm mùa chậm.
      </div>
    </div>
  );
}
