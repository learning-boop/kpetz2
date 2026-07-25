import dog from "@/assets/hero-dog.jpg";
import cat from "@/assets/hero-cat.jpg";
import bird from "@/assets/hero-bird.jpg";
import supplies from "@/assets/service-supplies.jpg";
import Reveal from "./Reveal";

const CATEGORIES = [
  { name: "Dogs", count: "48 products", img: dog },
  { name: "Cats", count: "36 products", img: cat },
  { name: "Birds", count: "21 products", img: bird },
  { name: "Accessories", count: "62 products", img: supplies },
];

export default function Categories() {
  return (
    <section aria-label="Shop by pet" className="bg-cream-deep py-14 md:py-16">
      <div className="container-x grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
        {CATEGORIES.map((cat, i) => (
          <Reveal key={cat.name} delay={i * 90}>
            <a href="#shop" className="group flex flex-col items-center text-center">
              <span className="relative block h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-md transition duration-300 group-hover:border-brand md:h-36 md:w-36">
                <img
                  src={cat.img}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
              </span>
              <span className="mt-4 font-display text-lg font-extrabold transition group-hover:text-brand md:text-xl">
                {cat.name}
              </span>
              <span className="mt-1 text-sm font-semibold text-ink-soft">{cat.count}</span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
