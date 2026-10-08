import { supabase } from './supabase';
import type { Game, Level, Blog, Category, GameLink, Settings } from '@/types';

// ==========================================
// GAMES
// ==========================================
export async function getAllGames(): Promise<Game[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getAllGames error:', error.message);
    return [];
  }
  return (data || []) as Game[];
}

export async function getGameBySlug(slug: string): Promise<Game | null> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error || !data) return null;
  return data as Game;
}

export async function getFeaturedGames(limit = 6): Promise<Game[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('published', true)
    .order('views', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data || []) as Game[];
}

// ==========================================
// LEVELS
// ==========================================
export async function getLevelsByGame(gameId: string): Promise<Level[]> {
  const { data, error } = await supabase
    .from('levels')
    .select('*')
    .eq('game_id', gameId)
    .eq('published', true)
    .order('level_number', { ascending: true });

  if (error) return [];
  return (data || []) as Level[];
}

export async function getLevelByNumber(
  gameId: string,
  levelNumber: number
): Promise<Level | null> {
  const { data, error } = await supabase
    .from('levels')
    .select('*')
    .eq('game_id', gameId)
    .eq('level_number', levelNumber)
    .eq('published', true)
    .single();

  if (error || !data) return null;
  return data as Level;
}

export async function getLatestLevels(limit = 12): Promise<Level[]> {
  const { data, error } = await supabase
    .from('levels')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data || []) as Level[];
}

// ==========================================
// BLOGS
// ==========================================
export async function getAllBlogs(): Promise<Blog[]> {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) return [];
  return (data || []) as Blog[];
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error || !data) return null;
  return data as Blog;
}

export async function getBlogsByGame(gameId: string, limit = 6): Promise<Blog[]> {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('game_id', gameId)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data || []) as Blog[];
}

export async function getLatestBlogs(limit = 6): Promise<Blog[]> {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data || []) as Blog[];
}

// ==========================================
// CATEGORIES
// ==========================================
export async function getAllCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) return [];
  return (data || []) as Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as Category;
}

// ==========================================
// GAME LINKS (custom buttons)
// ==========================================
export async function getGameLinks(gameId: string): Promise<GameLink[]> {
  const { data, error } = await supabase
    .from('game_links')
    .select('*')
    .eq('game_id', gameId)
    .order('position', { ascending: true });

  if (error) return [];
  return (data || []) as GameLink[];
}

// ==========================================
// SETTINGS
// ==========================================
export async function getSettings(): Promise<Settings | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (error || !data) return null;
  return data as Settings;
}

// ==========================================
// SEARCH
// ==========================================
export async function searchGames(query: string): Promise<Game[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('published', true)
    .ilike('name', `%${query}%`)
    .limit(20);

  if (error) return [];
  return (data || []) as Game[];
}