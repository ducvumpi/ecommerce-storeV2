export const dynamic = 'force-dynamic'; // ✅ thêm dòng này lên đầu file
export const revalidate = 0;

export default function ProductsPage() {
  return (
    <div className="bg-gradient-to-r from-indigo-900 to-purple-800/90 backdrop-blur-md shadow-lg fixed w-full z-50">
      <div
        id="vanta-background"
        className="fixed top-0 left-0 w-full h-full -z-10"
      ></div>

      <nav className="bg-gradient-to-r from-indigo-900 to-purple-800/90 backdrop-blur-md shadow-lg fixed w-full z-50"></nav>

      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-900 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold">Our Digital Products</h1>
          <p className="mt-4 text-lg text-indigo-200">
            Browse our collection of premium digital assets
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex flex-wrap gap-4">
          <button
            className="filter-btn px-4 py-2 rounded-full border border-gray-300 hover:bg-indigo-100 transition-colors active"
            data-category="all"
          >
            All Products
          </button>
          <button
            className="filter-btn px-4 py-2 rounded-full border border-gray-300 hover:bg-indigo-100 transition-colors"
            data-category="ui-kits"
          >
            UI Kits
          </button>
          <button
            className="filter-btn px-4 py-2 rounded-full border border-gray-300 hover:bg-indigo-100 transition-colors"
            data-category="templates"
          >
            Templates
          </button>
          <button
            className="filter-btn px-4 py-2 rounded-full border border-gray-300 hover:bg-indigo-100 transition-colors"
            data-category="graphics"
          >
            Graphics
          </button>
          <button
            className="filter-btn px-4 py-2 rounded-full border border-gray-300 hover:bg-indigo-100 transition-colors"
            data-category="plugins"
          >
            Plugins
          </button>
          <div className="ml-auto relative">
            <select className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500">
              <option>Sort by: Popular</option>
              <option>Sort by: Newest</option>
              <option>Sort by: Price: Low to High</option>
              <option>Sort by: Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8"></div>

        <div className="mt-12 flex justify-center">
          <nav className="inline-flex rounded-md shadow">
            <a
              href="#"
              className="px-4 py-2 rounded-l-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              Previous
            </a>
            <a
              href="#"
              className="px-4 py-2 border-t border-b border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              1
            </a>
            <a
              href="#"
              className="px-4 py-2 border-t border-b border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              2
            </a>
            <a
              href="#"
              className="px-4 py-2 border-t border-b border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              3
            </a>
            <a
              href="#"
              className="px-4 py-2 rounded-r-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              Next
            </a>
          </nav>
        </div>
      </div>
    </div>
  );
}
