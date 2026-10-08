import 'server-only';

import sanitizeHtml from 'sanitize-html';

const DEFAULT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's',
    'ul', 'ol', 'li', 'a', 'img', 'blockquote',
    'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'div', 'span',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height', 'loading'],
    '*': ['class', 'id'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowProtocolRelative: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
  },
};

const ADSENSE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ['script', 'ins', 'div', 'span', 'iframe'],
  allowedAttributes: {
    script: ['async', 'src', 'crossorigin', 'data-ad-client'],
    ins: [
      'class',
      'style',
      'data-ad-client',
      'data-ad-slot',
      'data-ad-format',
      'data-full-width-responsive',
    ],
    iframe: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen'],
    '*': ['class', 'style', 'id'],
  },
  allowedSchemes: ['http', 'https'],
  allowProtocolRelative: false,
  allowedScriptHostnames: ['pagead2.googlesyndication.com'],
  allowedIframeHostnames: [
    'googleads.g.doubleclick.net',
    'tpc.googlesyndication.com',
  ],
  allowVulnerableTags: true,
  allowedStyles: {
    '*': {
      display: [/^(?:block|inline|inline-block|none)$/],
      width: [/^\d+(?:px|%|em|rem|vw)?$/],
      height: [/^\d+(?:px|%|em|rem|vh)?$/],
      'max-width': [/^\d+(?:px|%|em|rem|vw)?$/],
      'max-height': [/^\d+(?:px|%|em|rem|vh)?$/],
      margin: [/^\d+(?:px|%|em|rem)(?:\s+\d+(?:px|%|em|rem)){0,3}$/],
      padding: [/^\d+(?:px|%|em|rem)(?:\s+\d+(?:px|%|em|rem)){0,3}$/],
      'background-color': [/^(?:#[\da-f]{3,8}|rgba?\([\d.,%\s]+\)|[a-z]{1,20})$/i],
      color: [/^(?:#[\da-f]{3,8}|rgba?\([\d.,%\s]+\)|[a-z]{1,20})$/i],
      'text-align': [/^(?:left|right|center)$/],
    },
  },
};

export function sanitize(html: string): string {
  return sanitizeHtml(html, DEFAULT_OPTIONS);
}

/** Only use for AdSense snippets entered by authenticated site administrators. */
export function sanitizeAdsense(code: string): string {
  return sanitizeHtml(code, ADSENSE_OPTIONS);
}