import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "../components/Header";
import Footer from "../components/Footer";
import Seo from "../components/Seo";

const API = import.meta.env.VITE_API_URL ?? "";
const IMAGES = `${API}/api/uploads/blog`;
type Post = {
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  author: string | null;
  published_at: string;
};

export default function Blog() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    let live = true;
    fetch(`${API}/api/posts`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => live && setPosts(d.data ?? []))
      .catch(() => live && setFailed(true));

    return () => {
      live = false;
    };
  }, []);

  return (
    <>
      <Seo
        title="Pet Care Advice | K-Petz Hospital, Vijayawada"
        description="Practical advice on vaccination, deworming, grooming and everyday pet care, written by the veterinarians at K-Petz Hospital, Vijayawada."
        path="/blog"
      />

      <div className="relative bg-ink pb-16 pt-3 md:pb-20 md:pt-5">
        <Header />
        <div className="container-x relative pt-28 md:pt-32">
          <p className="eyebrow text-gold">From the clinic</p>
          <h1 className="display-lg mt-4 text-white">Pet Care Advice</h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-cream/80">
            Answers to the questions we're asked most often, written by our veterinarians.
          </p>
        </div>
      </div>

      <main className="section-y bg-cream">
        <div className="container-x">
          {posts === null && !failed && (
            <p className="text-center text-[15px] text-ink-soft">Loading…</p>
          )}

          {failed && (
            <p className="text-center text-[15px] text-ink-soft">
              We couldn't load the posts just now. Please try again shortly.
            </p>
          )}

          {posts?.length === 0 && (
            <p className="text-center text-[15px] text-ink-soft">
              Nothing here yet — we're writing.
            </p>
          )}

          {posts && posts.length > 0 && (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article key={post.slug} className="group">
                  <Link to={`/blog/${post.slug}`} className="block">
                    <div className="overflow-hidden rounded-[1.25rem] bg-cream-deep">
                      {post.cover_image ? (
                        <img
                          src={`${IMAGES}/${post.cover_image}`}
                          alt=""
                          loading="lazy"
                          className="aspect-[3/2] w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="aspect-[3/2] w-full bg-sand" />
                      )}
                    </div>

                    <p className="mt-4 font-display text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-soft">
                      {new Date(post.published_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <h2 className="mt-2 font-display text-[21px] font-extrabold leading-snug text-ink transition group-hover:text-brand">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                        {post.excerpt}
                      </p>
                    )}
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
