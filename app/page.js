import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#02337D] px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-[#FE7401]">
            BrightSpark Electricals & Electronics
          </p>

          <h1 className="max-w-4xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Powering Your Home,
            <span className="text-[#FE7401]">
              {" "}Business & Future
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-200">
            Discover quality phone accessories, electrical and electronic products for
            your home, office, business, and everyday needs.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button variant="secondary">
              Shop Products
            </Button>

            <Button variant="outline">
              Contact Us
            </Button>
          </div>

        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="mb-10 text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-[#FE7401]">
              Why BrightSpark
            </p>

            <h2 className="mt-2 text-3xl font-bold text-[#02337D]">
              Everything You Need
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              We're building a convenient platform where customers
              can discover products and interact with BrightSpark
              easily.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">

            <Card>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#02337D] text-xl text-white">
                ⚡
              </div>

              <h3 className="text-xl font-bold text-[#02337D]">
                Quality Products
              </h3>

              <p className="mt-3 leading-6 text-gray-600">
                Browse electrical and electronic products suitable
                for homes, offices, and businesses.
              </p>
            </Card>

            <Card>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#FE7401] text-xl text-white">
                🏪
              </div>

              <h3 className="text-xl font-bold text-[#02337D]">
                Multiple Branches
              </h3>

              <p className="mt-3 leading-6 text-gray-600">
                BrightSpark operates from its Roysambu and Rongai
                branches.
              </p>
            </Card>

            <Card>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#02337D] text-xl text-white">
                🛒
              </div>

              <h3 className="text-xl font-bold text-[#02337D]">
                Easy Shopping
              </h3>

              <p className="mt-3 leading-6 text-gray-600">
                Customers will be able to browse products, add
                items to their cart, and place orders online.
              </p>
            </Card>

          </div>

        </div>
      </section>

      {/* Branches */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="grid gap-8 md:grid-cols-2">

            <div className="rounded-2xl bg-[#02337D] p-8 text-white">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#FE7401]">
                Visit Us
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Roysambu Branch
              </h2>

              <p className="mt-4 text-gray-200">
                Find us along Lumumba Drive in Roysambu,
                Nairobi.
              </p>
            </div>

            <div className="rounded-2xl border-2 border-[#02337D] p-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#FE7401]">
                Visit Us
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[#02337D]">
                Rongai Branch
              </h2>

              <p className="mt-4 text-gray-600">
                Find us at Rangau shopping center, Rongai for electrical and
                electronic products.
              </p>
            </div>

          </div>

        </div>
      </section>
    </>
  );
}