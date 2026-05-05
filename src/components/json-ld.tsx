// Escape `</` so user-controlled strings (e.g. team names) cannot break out
// of the <script> tag. The content is otherwise just JSON, no HTML.
function safeStringify(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeStringify(data) }}
    />
  );
}
