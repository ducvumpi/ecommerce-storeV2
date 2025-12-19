import Image from "next/image";
export default function AboutPage() {
  return (
    <div>
      <main className="container mx-auto px-4 py-12">
        <section className="relative rounded-3xl overflow-hidden mb-16 h-96">
          <Image
            width={1200}
            height={630}
            src="http://static.photos/workspace/1200x630/1"
            alt="Our Team"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70"></div>
          <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
            <h1 className="text-5xl font-bold mb-4">Câu chuyện của chúng tôi</h1>
            <p className="text-xl max-w-2xl">
              Khám phá niềm đam mê đằng sau Tiệm mùa chậm</p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Chúng tôi là ai</h2>
              <p className="text-lg text-gray-600 mb-4">
                Được thành lập vào năm 2025, Tiệm mùa chậm khởi đầu là một cửa hàng thời trang nhỏ với tầm nhìn lớn - mang thời trang cao cấp đến với tất cả mọi người mà không ảnh hưởng đến chất lượng hay phong cách.
              </p>
              <p className="text-lg text-gray-600">
                {
                  "Ngày nay, chúng tôi tự hào là một trong những điểm đến thời trang trực tuyến phát triển nhanh nhất, phục vụ khách hàng tại hơn 50 quốc gia với các bộ sưu tập được tuyển chọn kỹ lưỡng từ các nhà thiết kế nổi tiếng và các tài năng mới nổi."
                }
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <Image
                width={1200}
                height={630}
                src="http://static.photos/workspace/640x360/2"
                alt="Our Store"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">Giá trị của chúng tôi
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-md text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i data-feather="heart" className="text-purple-500 w-8 h-8"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">Niềm đam mê thời trang
              </h3>
              <p className="text-gray-600">
                Chúng tôi sống và hít thở cùng thời trang, liên tục tìm kiếm xu hướng lớn tiếp theo để mang đến cho tủ đồ của bạn.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i data-feather="shield" className="text-pink-500 w-8 h-8"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">Đảm bảo chất lượng</h3>
              <p className="text-gray-600">
                Mỗi sản phẩm đều được tuyển chọn kỹ lưỡng và kiểm tra chất lượng để đảm bảo đáp ứng các tiêu chuẩn cao của chúng tôi.

              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i data-feather="users" className="text-blue-500 w-8 h-8"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">Khách hàng là trên hết</h3>
              <p className="text-gray-600">
                Sự hài lòng của bạn là ưu tiên hàng đầu của chúng tôi, từ trải nghiệm mua sắm liền mạch đến dịch vụ khách hàng xuất sắc.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Nhóm của chúng tôi
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <Image
                width={1200}
                height={630}
                src="http://static.photos/people/400x400/1"
                alt="Team Member"
                className="w-32 h-32 rounded-full object-cover mx-auto mb-4 shadow-md"
              />
              <h3 className="text-xl font-bold">Sarah Johnson</h3>
              <p className="text-gray-600">Founder & CEO</p>
            </div>
            <div className="text-center">
              <Image
                width={1200}
                height={630}
                src="http://static.photos/people/400x400/2"
                alt="Team Member"
                className="w-32 h-32 rounded-full object-cover mx-auto mb-4 shadow-md"
              />
              <h3 className="text-xl font-bold">Michael Chen</h3>
              <p className="text-gray-600">Giám đốc sáng tạo
              </p>
            </div>
            <div className="text-center">
              <Image
                width={1200}
                height={630}
                src="http://static.photos/people/400x400/3"
                alt="Team Member"
                className="w-32 h-32 rounded-full object-cover mx-auto mb-4 shadow-md"
              />
              <h3 className="text-xl font-bold">Emma Rodriguez</h3>
              <p className="text-gray-600">Trưởng phòng tạo mẫu
              </p>
            </div>
            <div className="text-center">
              <Image
                width={1200}
                height={630}
                src="http://static.photos/people/400x400/4"
                alt="Team Member"
                className="w-32 h-32 rounded-full object-cover mx-auto mb-4 shadow-md"
              />
              <h3 className="text-xl font-bold">David Wilson</h3>
              <p className="text-gray-600">Trải nghiệm khách hàng
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-10 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            Bạn đã sẵn sàng tham gia Hành trình Thời trang của chúng tôi chưa?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Đăng ký ngay hôm nay để được giảm giá 15% cho đơn hàng đầu tiên cùng quyền truy cập độc quyền vào các bộ sưu tập mới.
          </p>
          <a
            href="/signup"
            className="inline-block bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-opacity-90 transition"
          >
            Tham gia ngay
          </a>
        </section>
      </main>
    </div>
  );
}
