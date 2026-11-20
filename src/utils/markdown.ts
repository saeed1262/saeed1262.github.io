function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function inlineMarkdownToHtml(text: string): string {
  const escaped = escapeHtml(text);
  // External http(s) links open in a new tab; site-relative paths ("/projects/x/")
  // stay in the same tab. Anything else, including "//host" and "javascript:", is left as text.
  const withLinks = escaped.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/(?!\/)[^)\s]*)\)/g,
    (_m, label: string, url: string) =>
      url.startsWith('/')
        ? `<a href="${url}">${label}</a>`
        : `<a href="${url}" target="_blank" rel="noopener">${label}</a>`,
  );
  return withLinks.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}
