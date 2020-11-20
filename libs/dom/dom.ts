type Param =
  | null
  | undefined
  | string
  | number
  | boolean
  | HTMLElement
  | DocumentFragment
  | { __html__: string };

const temporalMap = new Map<string, HTMLElement | DocumentFragment>();
const template = document.createElement('template');
let seq = 0;

export function dom<T extends HTMLElement = HTMLElement>(
  chunks: TemplateStringsArray,
  ...content: Param[]
) {
  const html = String.raw(chunks, ...content.map(cleanParam));
  template.innerHTML = html;
  const fragment = template.content;

  for (const [id, el] of temporalMap) {
    const placeholder = fragment.querySelector(`#${id}`)!;
    placeholder.replaceWith(el);
  }

  temporalMap.clear();

  if (fragment.children.length > 1) {
    throw new Error(
      'dom`template string` can only generate one element: ' + html,
    );
  }

  return fragment.children[0] as T;
}

export function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/  +/g, x => '&nbsp;'.repeat(x.length));
}

function cleanParam(param: Param) {
  if (param == null) return '';

  if (typeof param === 'string') {
    return escapeHtml(param);
  }

  if (typeof param === 'number' || typeof param === 'boolean') {
    return String(param);
  }

  if (param instanceof HTMLElement || param instanceof DocumentFragment) {
    return temporalElement(param);
  }

  if (typeof param.__html__ === 'string') {
    return param.__html__;
  }

  return escapeHtml(JSON.stringify(param, null, 2));
}

function temporalElement(el: HTMLElement | DocumentFragment) {
  const id = `__DOM_TEMPLATE_PLACEHOLDER__${Date.now()}__${seq++}`;
  temporalMap.set(id, el);
  return `<div id="${id}"></div>`;
}
