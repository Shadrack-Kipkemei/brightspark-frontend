import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-[#02337D] px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#FE7401]">
            BrightSpark Electricals & Electronics
          </p>

          <h1 className="max-w-3xl text-4xl font-bold md:text-6xl">
            Strong Connections. Safe Solutions
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-gray-200">
            Shop quality phone accessories, electrical and electronic products for your home,
            office, business, and other projects.
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

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <h2 className="text-xl font-bold text-[#02337D]">
              Quality Products
            </h2>

            <p className="mt-3 text-gray-600">
              Browse phone accessories, electrical and electronic products available from
              BrightSpark.
            </p>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-[#02337D]">
              Multiple Branches
            </h2>

            <p className="mt-3 text-gray-600">
              BrightSpark operates from Roysambu and Rangau branches.
            </p>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-[#02337D]">
              Easy Ordering
            </h2>

            <p className="mt-3 text-gray-600">
              Customers will be able to browse products and place orders
              online.
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}