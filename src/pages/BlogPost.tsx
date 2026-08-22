import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Header } from "../components/Header";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import PostBody from "../components/PostBody";
import { useBooking } from "../components/BookingProvider";

const API = import.meta.env.VITE_API_URL ?? "";
const IMAGES = `${API}/api/uploads/blog`;

type Post = {
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  cover_image: string | null;
  author: string | null;
  published_at: string;
  read_minutes: number;
};

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [missing, setMissing] = useState(false);
  const { openBooking } = useBooking();

  useEffect(() => {
    window.scrollTo(0, 0);
    setPost(null);
    setMissing(false);

    let live = true;
    fetch(`${API}/api/posts/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => live && setPost(d))
      .catch(() => live && setMissing(true));

    return () => {
      live = false;
    };
  }, [slug]);

  if (missing) {
    return (
      <>
        <div className="relative bg-ink pb-16 pt-3 md:pt-5">
          <Header />
          <div className="container-x relative pt-28 md:pt-32">
            <h1 className="display-lg text-white">We can't find that post</h1>
            <Link
              to="/blog"
              className="mt-6 inline-block font-display text-[12px] font-extrabold uppercase tracking-[0.14em] text-gold hover:underline"
            >
              &larr; All posts
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      {post && (
        <Seo
          title={`${post.title} | K-Petz Hospital`}
          description={post.excerpt ?? `${post.title} — advice from K-Petz Hospital, Vijayawada.`}
          path={`/blog/${post.slug}`}
        />
      )}

      <div className="relative bg-ink pb-16 pt-3 md:pb-20 md:pt-5">
        <Header />
        <div className="container-x relative pt-28 md:pt-32">
          <Link
            to="/blog"
            className="font-display text-[12px] font-extrabold uppercase tracking-[0.14em] text-gold hover:underline"
          >
            &larr; Pet care advice
          </Link>

          {post && (
            <>
              <h1 className="display-lg mt-5 max-w-[22ch] text-white">{post.title}</h1>
              <p className="mt-5 text-[14px] font-semibold text-cream/70">
                {new Date(post.published_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {post.author && <> · {post.author}</>}
                <> · {post.read_minutes} min read</>
              </p>
            </>
          )}
        </div>
      </div>

      <main className="section-y bg-cream">
        <article className="container-x max-w-2xl">
          {!post && <p className="text-[15px] text-ink-soft">Loading…</p>}

          {post && (
            <>
              {post.cover_image && (
                <img
                  src={`${IMAGES}/${post.cover_image}`}
                  alt=""
                  className="mb-10 aspect-[3/2] w-full rounded-[1.5rem] object-cover"
                />
              )}

              <PostBody body={post.body} />

              <div className="mt-14 rounded-2xl bg-cream-deep p-7">
                <p className="font-display text-[19px] font-extrabold text-ink">
                  Worried about your pet?
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                  General advice is no substitute for examining an animal. If something seems
                  wrong, book an appointment and we'll take a proper look.
                </p>
                <button onClick={() => openBooking()} className="btn btn-primary mt-5">
                  Book an appointment
                </button>
              </div>
            </>
          )}
        </article>
      </main>

      <Footer />
    </>
  );
}
