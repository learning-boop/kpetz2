import { useEffect } from "react";

type Props = {
  title: string;
  description: string;
  /** Path only, e.g. "/vet-home-visit". Combined with the site origin. */
  path: string;
};

const SITE = "https://kpetz.com";

/**
 * Sets the title, description and canonical URL for a page.
 *
 * Written as a hook rather than pulling in react-helmet: this site has a
 * handful of routes, and a dependency for four meta tags isn't worth it.
 *
 * Note this only helps crawlers that execute JavaScript. Google does, but
 * WhatsApp and Facebook link previews read the raw HTML and will always show
 * whatever is in index.html. That's the trade-off of a single-page app.
 */
export default function Seo({ title, description, path }: Props) {
  useEffect(() => {
    document.title = title;

    const set = (selector: string, attr: string, value: string) => {
      let el = document.head.querySelector(selector);

      if (!el) {
        const isLink = selector.startsWith("link");
        el = document.createElement(isLink ? "link" : "meta");

        const match = selector.match(/\[(?:name|property|rel)="([^"]+)"\]/);
        const name = match?.[1];

        if (name) {
          if (isLink) el.setAttribute("rel", name);
          else if (selector.includes("property")) el.setAttribute("property", name);
          else el.setAttribute("name", name);
        }

        document.head.appendChild(el);
      }

      el.setAttribute(attr, value);
    };

    set('meta[name="description"]', "content", description);
    set('link[rel="canonical"]', "href", `${SITE}${path}`);
    set('meta[property="og:title"]', "content", title);
    set('meta[property="og:description"]', "content", description);
    set('meta[property="og:url"]', "content", `${SITE}${path}`);
    set('meta[property="og:type"]', "content", "website");

    // Explicit: React treats anything other than a function or undefined as an
    // error and throws "destroy is not a function" while unmounting.
    return undefined;
  }, [title, description, path]);

  return null;
}