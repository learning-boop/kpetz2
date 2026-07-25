# Kpetz

Pet store marketing site — React 18 + Vite 8 + Tailwind CSS v4 + TypeScript.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # tsc --noEmit
npm run build      # -> dist/
npm run preview    # serve dist/ on :4173
```

## Design system

All tokens live in `src/index.css` under `:root` and are exposed to Tailwind through
`@theme inline`, so `bg-cream`, `text-brand`, `border-line` etc. all resolve from one place.
Change a hex there and it propagates everywhere.

| Token          | Value     | Used for                                    |
| -------------- | --------- | ------------------------------------------- |
| `--cream`      | `#faf3ea` | page background                             |
| `--cream-deep` | `#f2e7d7` | alternating section bands                   |
| `--sand`       | `#e9dcc6` | decorative paw watermarks, image backplates |
| `--ink`        | `#2a2724` | headings, dark bands, footer                |
| `--ink-soft`   | `#6d645b` | body copy                                   |
| `--brand`      | `#ef7b22` | primary accent, buttons, eyebrows           |
| `--cocoa`      | `#b5673a` | hound illustration                          |
| `--bark`       | `#463933` | category bar above the hero                 |
| `--line`       | `#e3d7c4` | hairline borders                            |

**Type.** Chivo 700/800/900 for display (`font-display`), Nunito 400–800 for body
(`font-body`), Caveat for the founder signature (`font-script`). Headings use
`display-xl` / `display-lg` / `display-md`, which are `clamp()` scales — they resize
fluidly, so there are no per-breakpoint font-size overrides to maintain.

**Reusable utilities** (defined with `@utility`, so they compose with Tailwind variants):
`container-x`, `section-y`, `eyebrow`, `btn` + `btn-primary` / `btn-ink` / `btn-outline`,
`field`, `reveal` / `reveal-in`, `spin-slow`, `float-y`, plus the two cut-out helpers below.

### Cut-outs

Photos in the About section aren't plain rounded rectangles — shapes are cut *out* of them so
the decoration sits in a hole rather than floating on top.

- `notch-tl` carves a 112x112 square from a photo's top-left corner. The element itself is a
  cream block with a rounded inner corner; its two pseudo-elements are concave flares that make
  the photo edge curve into the cut instead of meeting it at a hard 90 degree corner.
- `cut-ring` is a 12px cream `box-shadow` that makes any round element (the rotating badge, the
  play button) read as a hole punched through the photo behind it.

Both use fixed pixel sizes deliberately: a cut anchored to a corner should stay the same size at
every viewport width. `notch-tl` is applied at `lg` and up only, since the notch exists to hold
the hound illustration, which is hidden on smaller screens.

## Structure

```
src/
  App.tsx                 section composition + skip link
  index.css               tokens, base styles, utilities, keyframes
  components/
    Header.tsx            TopBar (category bar) + overlay header + mobile drawer
    Hero.tsx              full-bleed video/image background + slider + booking card
    BookingForm.tsx       the orange consultation card, hosted inside the hero
    Categories.tsx        circular category chips
    About.tsx             12-col "Know us" layout
    Services.tsx          6 service cards
    Offer.tsx             dark promo band
    Products.tsx          4 product cards
    Testimonials.tsx      3 reviews
    Footer.tsx            links, contact, newsletter
    Reveal.tsx            IntersectionObserver scroll reveal
    decor/Decor.tsx       PawMark, BoneMark, Dachshund, BadgeStamp, PlayButton, Signature
  assets/                 JPEGs, imported so Vite fingerprints them
public/
  media/                  hero video + poster, served from the root and streamed
```

### Hero

The hero is one full-bleed rounded card: media fills it edge to edge, a gradient scrim sits on
top for legibility, and the copy and the orange booking card sit over that. The header is not a
separate band — it's `absolute` over the hero with a translucent nav pill, and it flips to
`fixed` with a solid cream background once you scroll past 160px. The dark category bar above the
hero is the only thing in normal flow before it.

The booking form lives in the hero rather than in its own section, so `#booking` resolves to the
top of the page. Keep one form on the page: two copies would mean duplicate labels and inputs.

Slides carry optional `video`, `poster` and `hold` fields, so any slide can be a video without
touching the markup — set `video` on the slide and it switches from `<img>` to `<video>`.

The video lives in `public/` rather than `src/assets/` so the host serves it directly and can
answer HTTP Range requests; a bundled asset can't be streamed or seeked. It's muted, looping and
`playsInline`, with the audio track stripped at build time (a muted loop doesn't need one) and
the moov atom moved to the front so playback starts before the file finishes downloading. The
poster is frame 0, so there's no visible jump when playback begins.

It's deliberately **not** loaded on mobile or under `prefers-reduced-motion` — both fall back to
the poster image, which keeps 2MB off a phone on mobile data. Video slides also get a longer
`hold` so the loop isn't cut off mid-way by the carousel.

Decorative graphics are hand-drawn inline SVG, not image files — they inherit
`currentColor`, stay sharp at any size, and cost nothing extra to download.

## Accessibility & motion

- Skip link, visible focus rings (`:focus-visible`, 3px brand outline)
- Drawer is removed from the a11y tree and the tab order when closed; body scroll locks when open
- Every image carries an `alt` (decorative ones are `alt=""`)
- Icon-only buttons have `aria-label`s; star ratings expose a text label
- `prefers-reduced-motion: reduce` disables the reveal transitions, the badge spin, the float,
  the pulse ring, the hero autoplay and smooth scrolling

## Verified

No horizontal overflow at 360 / 390 / 820 / 1280 / 1440px, with the drawer both open and closed.

## Deploying

Static output — `npm run build`, then serve `dist/`.

- **Vercel / Netlify:** build `npm run build`, publish directory `dist`
- **cPanel:** upload the contents of `dist/` into `public_html`

The site is a single page of anchor-linked sections, so no SPA rewrite rule is needed. If you
later add client-side routing, add a catch-all rewrite to `/index.html`.

`package-lock.json` records the native `rolldown` bindings for every platform, so the build
works on Linux CI as well as local Windows or macOS.
