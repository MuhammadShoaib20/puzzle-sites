// ==========================================
// CATEGORY
// ==========================================
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  created_at?: string;
}

// ==========================================
// GAME
// ==========================================
export interface CustomButton {
  label: string;
  url: string;
  newTab?: boolean;
}

export interface FAQ {
  q: string;
  a: string;
}

export interface Game {
  id: string;
  name: string;
  slug: string;
  category_id?: string;
  cover_image?: string;
  short_description?: string;
  full_description?: string;
  walkthrough_intro?: string;
  youtube_trailer_url?: string;
  youtube_channel_url?: string;
  custom_buttons: CustomButton[];
  faq: FAQ[];
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  total_levels: number;
  views: number;
  published: boolean;
  created_at: string;
  updated_at?: string;
}

// ==========================================
// LEVEL
// ==========================================
export interface Level {
  id: string;
  game_id: string;
  level_number: number;
  title?: string;
  slug?: string;
  youtube_url: string;
  youtube_id: string;
  description?: string;
  walkthrough?: string;
  tips?: string;
  meta_title?: string;
  meta_description?: string;
  views: number;
  published: boolean;
  created_at: string;
}

// ==========================================
// BLOG
// ==========================================
export interface Blog {
  id: string;
  game_id?: string;
  title: string;
  slug: string;
  content?: string;
  cover_image?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  views: number;
  published: boolean;
  created_at: string;
}

// ==========================================
// GAME LINK (Custom Buttons)
// ==========================================
export interface GameLink {
  id: string;
  game_id: string;
  label: string;
  url: string;
  icon?: string;
  position: number;
  new_tab: boolean;
}

// ==========================================
// SETTINGS
// ==========================================
export interface Settings {
  id: number;
  site_name: string;
  site_url: string;
  site_logo?: string;
  site_description?: string;
  adsense_header?: string;
  adsense_in_article?: string;
  adsense_sidebar?: string;
  adsense_footer?: string;
  adsense_ads_txt?: string;
  youtube_button_text: string;
  switch_youtube_enabled: boolean;
  google_analytics_id?: string;
  google_search_console?: string;
  social_links: Record<string, string>;
  updated_at?: string;
}

// ==========================================
// ADMIN USER
// ==========================================
export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  created_at: string;
}