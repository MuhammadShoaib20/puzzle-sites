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

export async function getAllPublishedLevelsForSitemap(): Promise<
  { game_slug: string; level_number: number; created_at: string }[]
> {
  const pageSize = 1000;
  const result: { game_slug: string; level_number: number; created_at: string }[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('levels')
      .select(`
        level_number,
        created_at,
        game:games!inner (slug, published)
      `)
      .eq('published', true)
      .eq('game.published', true)
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('getAllPublishedLevelsForSitemap error:', error.message);
      return [];
    }

    type Row = {
      level_number: number;
      created_at: string;
      game: { slug: string } | { slug: string }[] | null;
    };

    const rows = (data || []) as unknown as Row[];
    for (const row of rows) {
      const game = Array.isArray(row.game) ? row.game[0] : row.game;
      if (!game?.slug) continue;
      result.push({
        game_slug: game.slug,
        level_number: row.level_number,
        created_at: row.created_at,
      });
    }

    if (rows.length < pageSize) break;
  }

  return result;
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

export async function getLatestLevels(
  limit = 12
): Promise<(Level & { game: { id: string; name: string; slug: string } })[]> {
  const { data, error } = await supabase
    .from('levels')
    .select(`
      *,
      game:games!inner (id, name, slug, published)
    `)
    .eq('published', true)
    .eq('game.published', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getLatestLevels error:', error.message);
    return [];
  }
  return (data || []) as (Level & {
    game: { id: string; name: string; slug: string };
  })[];
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

export async function getGamesByCategory(categoryId: string): Promise<Game[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('category_id', categoryId)
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) return [];
  return (data || []) as Game[];
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