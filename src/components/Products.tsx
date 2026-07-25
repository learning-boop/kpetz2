import { Heart, Star } from "lucide-react";
import prodCollar from "@/assets/product-collar.jpg";
import prodCatfood from "@/assets/product-catfood.jpg";
import prodDryfood from "@/assets/product-dryfood.jpg";
import prodToy from "@/assets/product-toy.jpg";
import Reveal from "./Reveal";

const PRODUCTS = [
  { img: prodCollar, tag: "Limited", name: "Padded dog collar", price: "₹750 – ₹820", rating: 4 },
  { img: prodCatfood, tag: "Sale", name: "Protein wet cat food", price: "₹720 – ₹860", rating: 5 },
  { img: prodDryfood, tag: "Sale", name: "Salmon dry cat food", price: "₹640 – ₹770", rating: 4 },
  { img: prodToy, tag: "New", name: "Rubber dumbbell toy", price: "₹380 – ₹450", rating: 5 },
];

export default function Products() {
  return (
    <section id="shop" className="section-y bg-cream pt-0">
      <div className="container-x">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Big sale</p>
            <h2 className="display-lg mt-4">Up To 20% Off</h2>
            <p className="lede mt-4 max-w-lg">
              Best-sellers picked by our trainers and the pet parents who keep re-ordering them.
            </p>
          </div>
          <a href="#shop" className="btn btn-ink">
            View all products
          </a>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((product, i) => (
            <Reveal key={product.name} delay={i * 90}>
              <article className="group h-full rounded-[1.75rem] bg-white p-4 shadow-[0_20px_50px_-40px_rgba(42,39,36,0.7)] transition duration-300 hover:-translate-y-1.5">
                <div className="relative overflow-hidden rounded-[1.25rem] bg-cream-deep">
                  <span className="absolute left-3 top-3 z-10 rounded-full bg-brand px-3 py-1 font-display text-[10px] font-extrabold uppercase tracking-[0.14em] text-white">
                    {product.tag}
                  </span>
                  <button
                    aria-label={`Save ${product.name} to wishlist`}
                    className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white text-ink transition hover:bg-brand hover:text-white"
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                  <img
                    src={product.img}
                    alt={product.name}
                    width={800}
                    height={800}
                    loading="lazy"
                    className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="px-2 pb-1 pt-5">
                  <div className="flex items-center gap-0.5 text-brand" aria-label={`Rated ${product.rating} out of 5`}>
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        className={`h-3.5 w-3.5 ${s < product.rating ? "fill-current" : "opacity-25"}`}
                      />
                    ))}
                  </div>
                  <h3 className="mt-2.5 font-display text-lg font-extrabold">{product.name}</h3>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="font-display text-[15px] font-extrabold">{product.price}</span>
                    <button className="font-display text-[11px] font-extrabold uppercase tracking-[0.12em] text-brand hover:underline">
                      Choose size
                    </button>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
