import type { Blog, FAQ } from '@/types';

// ==========================================
// SCHEMA TYPES
// ==========================================

interface BreadcrumbItem {
  position: number;
  name: string;
  item: string;
}

interface VideoObjectSchemaInput {
  name: string;
  description?: string;
  youtubeUrl: string;
  uploadDate: string;
}

interface BreadcrumbItem {
  position: number;
  name: string;
  item: string;
}

interface VideoGameSchemaInput {
  name: string;
  description?: string;
  image?: string;
  operatingSystem?: string;
}

interface HowToSchemaInput {
  gameName: string;
  levelNumber: number;
  walkthrough?: string;
}

// ==========================================
// ORGANIZATION SCHEMA
// ==========================================

export function generateOrganizationSchema() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://puzzlewalkthroughs.com').replace(/\/$/, '');

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MS Digital System',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: ['https://www.youtube.com/@MSDigitalSystem'],
  };
}

// ==========================================
// WEBSITE SCHEMA
// ==========================================

export function generateWebsiteSchema() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://puzzlewalkthroughs.com').replace(/\/$/, '');

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Puzzle Walkthroughs',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

// ==========================================
// ARTICLE SCHEMA (Blog Posts)
// ==========================================

export function generateArticleSchema(blog: Blog & { canonicalUrl: string }) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://puzzlewalkthroughs.com').replace(/\/$/, '');

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.meta_description || blog.content?.slice(0, 160) || '',
    image: blog.cover_image,
    datePublished: blog.created_at,
    dateModified: blog.created_at,
    author: {
      '@type': 'Organization',
      name: 'MS Digital System',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Puzzle Walkthroughs',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': blog.canonicalUrl,
    },
  };
}

// ==========================================
// FAQ SCHEMA
// ==========================================

export function generateFAQSchema(faqs: FAQ[]) {
  if (!faqs || faqs.length === 0) return null;

  // Filter out invalid FAQs and normalize field names
  const validFaqs = faqs
    .map((faq) => {
      // Handle both {q, a} and {question, answer} formats
      const question = faq.q || (faq as { question?: string }).question;
      const answer = faq.a || (faq as { answer?: string }).answer;

      if (!question || !answer) return null;

      return {
        '@type': 'Question' as const,
        name: question,
        acceptedAnswer: {
          '@type': 'Answer' as const,
          text: answer,
        },
      };
    })
    .filter((faq): faq is NonNullable<typeof faq> => faq !== null);

  if (validFaqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: validFaqs,
  };
}

// ==========================================
// VIDEO OBJECT SCHEMA
// ==========================================

export function generateVideoObjectSchema(video: VideoObjectSchemaInput) {
  const youtubeId = extractYoutubeId(video.youtubeUrl);

  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.name,
    description: video.description || '',
    thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
    uploadDate: video.uploadDate,
    embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
    contentUrl: video.youtubeUrl,
  };
}

// ==========================================
// BREADCRUMB SCHEMA
// ==========================================

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      item: item.item,
    })),
  };
}

// ==========================================
// VIDEO GAME SCHEMA
// ==========================================

export function generateVideoGameSchema(game: VideoGameSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.name,
    description: game.description || '',
    image: game.image,
    applicationCategory: 'PuzzleGame',
    operatingSystem: game.operatingSystem || 'Android, iOS',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}

// ==========================================
// HOW-TO SCHEMA (Level Walkthroughs)
// ==========================================

export function generateHowToSchema(level: HowToSchemaInput) {
  const steps: Array<{ '@type': string; text: string }> = [];

  if (level.walkthrough) {
    // Split walkthrough into paragraphs and create steps
    const paragraphs = level.walkthrough
      .split('\n')
      .filter((p) => p.trim().length > 0)
      .slice(0, 10); // Limit to 10 steps

    paragraphs.forEach((paragraph) => {
      steps.push({
        '@type': 'HowToStep',
        text: paragraph.trim(),
      });
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to solve ${level.gameName} Level ${level.levelNumber}`,
    step: steps,
  };
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function extractYoutubeId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return '';
}

function decodeHtmlEntities(text: string): string {
  const entityMap: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&#39;': "'",
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#x3D;': '=',
    '&#60;': '<',
    '&#62;': '>',
    '&#34;': '"',
    '&nbsp;': ' ',
  };

  return text.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
    return entityMap[entity] || entity;
  });
}

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

export function extractFaqsFromHtml(html: string): Array<{ q: string; a: string }> {
  const faqs: Array<{ q: string; a: string }> = [];

  // Match h3 tags followed by p tags
  const h3Pattern = /<h3[^>]*>(.*?)<\/h3>/gi;
  let match: RegExpExecArray | null;

  while ((match = h3Pattern.exec(html)) !== null && faqs.length < 10) {
    const questionHtml = match[1];
    const question = decodeHtmlEntities(stripHtmlTags(questionHtml)).trim();

    if (!question) continue;

    // Find the next p tag after this h3
    const afterH3 = html.slice(match.index + match[0].length);
    const pMatch = afterH3.match(/<p[^>]*>(.*?)<\/p>/i);

    if (pMatch) {
      const answerHtml = pMatch[1];
      const answer = decodeHtmlEntities(stripHtmlTags(answerHtml)).trim();

      if (answer) {
        faqs.push({ q: question, a: answer });
      }
    }
  }

  return faqs;
}
