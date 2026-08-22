import { Fragment, type ReactNode } from "react";

/**
 * Renders the simple markup the admin editor accepts: blank-line paragraphs,
 * "## " headings, "- " bullets, **bold**, *italic* and [links](url).
 *
 * Deliberately NOT a markdown library rendered with dangerouslySetInnerHTML.
 * Post bodies are typed by clinic staff and stored in the database; if that
 * account were ever compromised, raw HTML would be a script-injection route.
 * Building React elements instead means the content is escaped by construction
 * and no HTML in the source is ever executed.
 */

/** Handles **bold**, *italic* and [text](url) inside a single line. */
function inline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${i++}`;

    if (token.startsWith("**")) {
      out.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("[")) {
      const [, label, href] = token.match(/\[([^\]]+)\]\(([^)]+)\)/) ?? [];
      // Only http(s) and mailto — blocks javascript: and data: URLs.
      const safe = /^(https?:|mailto:|\/)/i.test(href ?? "") ? href : undefined;
      out.push(
        safe ? (
          <a key={key} href={safe} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        ) : (
          <Fragment key={key}>{label}</Fragment>
        )
      );
    } else {
      out.push(<em key={key}>{token.slice(1, -1)}</em>);
    }

    last = match.index + token.length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function PostBody({ body }: { body: string }) {
  const blocks = body.replace(/\r\n/g, "\n").split(/\n{2,}/);

  return (
    <div className="post-body">
      {blocks.map((block, b) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith("### ")) {
          return <h3 key={b}>{inline(trimmed.slice(4), `h${b}`)}</h3>;
        }
        if (trimmed.startsWith("## ")) {
          return <h2 key={b}>{inline(trimmed.slice(3), `h${b}`)}</h2>;
        }

        const lines = trimmed.split("\n");
        if (lines.every((l) => /^[-*]\s+/.test(l.trim()))) {
          return (
            <ul key={b}>
              {lines.map((l, i) => (
                <li key={i}>{inline(l.trim().replace(/^[-*]\s+/, ""), `l${b}-${i}`)}</li>
              ))}
            </ul>
          );
        }

        return <p key={b}>{inline(trimmed.replace(/\n/g, " "), `p${b}`)}</p>;
      })}
    </div>
  );
}
