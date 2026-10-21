import { supabase, supabaseAdmin } from './supabase';
import type { Game, Level, Blog, Page, Category, GameLink, Settings } from '@/types';

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

export async function getAllGameSlugs(): Promise<{ slug: string }[]> {
  const { data, error } = await supabase
    .from('games')
    .select('slug')
    .eq('published', true);

  if (error) {
    console.error('getAllGameSlugs error:', error.message);
    return [];
  }
  return (data || []) as { slug: string }[];
}

type SitemapPageResult<T> = {
  data: T[] | null;
  error: { message: string; code?: string } | null;
};

async function getAllSitemapRows<T>(
  fetchPage: (from: number, to: number) => PromiseLike<SitemapPageResult<T>>,
  queryName: string
): Promise<T[]> {
  const pageSize = 1000;
  const result: T[] = [];

  for (let from = 0; ; ) {
    const { data, error } = await fetchPage(from, from + pageSize - 1);
    if (error) {
      throw new Error(`${queryName} failed: ${error.message}`);
    }

    const batch = data || [];
    result.push(...batch);
    if (batch.length < pageSize) break;
    from += batch.length;
  }

  return result;
}

export async function getAllPublishedGamesForSitemap(): Promise<
  Pick<Game, 'id' | 'slug' | 'created_at' | 'updated_at'>[]
> {
  return getAllSitemapRows<Pick<Game, 'id' | 'slug' | 'created_at' | 'updated_at'>>(
    (from, to) =>
      supabase
        .from('games')
        .select('id, slug, created_at, updated_at')
        .eq('published', true)
        .order('id', { ascending: true })
        .range(from, to),
    'getAllPublishedGamesForSitemap'
  );
}

export async function getPublishedLevelsForGameForSitemap(
  gameId: string,
  gameSlug: string
): Promise<
  { game_slug: string; level_number: number; created_at: string; updated_at?: string }[]
> {
  let selectUpdatedAt = true;
  type SitemapLevel = {
    game_slug: string;
    level_number: number;
    created_at: string;
    updated_at?: string;
  };

  return getAllSitemapRows<SitemapLevel>(
    async (from, to) => {
      let rows: Omit<SitemapLevel, 'game_slug'>[] | null = null;

      if (selectUpdatedAt) {
        const response = await supabase
          .from('levels')
          .select('level_number, created_at, updated_at')
          .eq('game_id', gameId)
          .eq('published', true)
          .order('level_number', { ascending: true })
          .order('id', { ascending: true })
          .range(from, to);

        if (
          response.error &&
          (response.error.code === '42703' ||
            response.error.code === 'PGRST204' ||
            response.error.message.includes('levels.updated_at'))
        ) {
          console.warn(
            'levels.updated_at is unavailable; apply the levels updated_at migration. Using created_at for sitemap lastModified.'
          );
          selectUpdatedAt = false;
        } else if (response.error) {
          return { data: null, error: response.error };
        } else {
          rows = response.data;
        }
      }

      if (!selectUpdatedAt) {
        const response = await supabase
          .from('levels')
          .select('level_number, created_at')
          .eq('game_id', gameId)
          .eq('published', true)
          .order('level_number', { ascending: true })
          .order('id', { ascending: true })
          .range(from, to);
        if (response.error) {
          return { data: null, error: response.error };
        }
        rows = response.data;
      }

      return {
        data: (rows || []).map((level) => ({
          game_slug: gameSlug,
          level_number: level.level_number,
          created_at: level.created_at,
          updated_at: level.updated_at,
        })),
        error: null,
      };
    },
    'getPublishedLevelsForGameForSitemap'
  );
}

// ==========================================
// LEVELS
// ==========================================
export type PublishedLevelSummary = Pick<Level, 'id' | 'level_number' | 'title' | 'views'>;

export async function getPublishedLevelSummariesByGame(
  gameId: string
): Promise<PublishedLevelSummary[]> {
  const pageSize = 1000;
  const result: PublishedLevelSummary[] = [];

  for (let from = 0; ; ) {
    const { data, error } = await supabase
      .from('levels')
      .select('id, level_number, title, views')
      .eq('game_id', gameId)
      .eq('published', true)
      .order('level_number', { ascending: true })
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('getPublishedLevelSummariesByGame error:', error.message);
      return [];
    }

    const batch = (data || []) as PublishedLevelSummary[];
    if (batch.length === 0) break;
    result.push(...batch);
    from += batch.length;
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

export async function getPopularLevelSlugs(limit = 100): Promise<{ game_slug: string; level_number: number }[]> {
  const { data, error } = await supabase
    .from('levels')
    .select(`
      level_number,
      game:games!inner (slug, published)
    `)
    .eq('published', true)
    .eq('game.published', true)
    .order('views', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getPopularLevelSlugs error:', error.message);
    return [];
  }

  type Row = {
    level_number: number;
    game: { slug: string } | { slug: string }[] | null;
  };

  const rows = (data || []) as unknown as Row[];
  const result: { game_slug: string; level_number: number }[] = [];

  for (const row of rows) {
    const game = Array.isArray(row.game) ? row.game[0] : row.game;
    if (!game?.slug) continue;
    result.push({
      game_slug: game.slug,
      level_number: row.level_number,
    });
  }

  return result;
}

export async function getRecentLevelSlugs(limit = 100): Promise<{ game_slug: string; level_number: number }[]> {
  const { data, error } = await supabase
    .from('levels')
    .select(`
      level_number,
      game:games!inner (slug, published)
    `)
    .eq('published', true)
    .eq('game.published', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getRecentLevelSlugs error:', error.message);
    return [];
  }

  type Row = {
    level_number: number;
    game: { slug: string } | { slug: string }[] | null;
  };

  const rows = (data || []) as unknown as Row[];
  const result: { game_slug: string; level_number: number }[] = [];

  for (const row of rows) {
    const game = Array.isArray(row.game) ? row.game[0] : row.game;
    if (!game?.slug) continue;
    result.push({
      game_slug: game.slug,
      level_number: row.level_number,
    });
  }

  return result;
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

export async function getAllPublishedBlogsForSitemap(): Promise<
  Pick<Blog, 'slug' | 'created_at'>[]
> {
  return getAllSitemapRows<Pick<Blog, 'slug' | 'created_at'>>(
    (from, to) =>
      supabase
        .from('blogs')
        .select('slug, created_at')
        .eq('published', true)
        .order('id', { ascending: true })
        .range(from, to),
    'getAllPublishedBlogsForSitemap'
  );
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

export async function getAllBlogSlugs(): Promise<{ slug: string }[]> {
  const { data, error } = await supabase
    .from('blogs')
    .select('slug')
    .eq('published', true);

  if (error) {
    console.error('getAllBlogSlugs error:', error.message);
    return [];
  }
  return (data || []) as { slug: string }[];
}

// ==========================================
// PAGES
// ==========================================
export async function getPageBySlug(slug: string): Promise<Page | null> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    console.error('getPageBySlug error:', error.message);
    return null;
  }
  return data as Page | null;
}

export async function getFooterPages(): Promise<Page[]> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('is_published', true)
    .eq('show_in_footer', true)
    .order('sort_order', { ascending: true })
    .order('title', { ascending: true });

  if (error) {
    console.error('getFooterPages error:', error.message);
    return [];
  }
  return (data || []) as Page[];
}

export async function getAllPublishedPagesForSitemap(): Promise<
  Pick<Page, 'slug' | 'created_at' | 'updated_at'>[]
> {
  return getAllSitemapRows<Pick<Page, 'slug' | 'created_at' | 'updated_at'>>(
    (from, to) =>
      supabase
        .from('pages')
        .select('slug, created_at, updated_at')
        .eq('is_published', true)
        .order('id', { ascending: true })
        .range(from, to),
    'getAllPublishedPagesForSitemap'
  );
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

export async function getAllCategoriesForSitemap(): Promise<Category[]> {
  return getAllSitemapRows<Category>(
    (from, to) =>
      supabase
        .from('categories')
        .select('*')
        .order('id', { ascending: true })
        .range(from, to),
    'getAllCategoriesForSitemap'
  );
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

// ==========================================
// ACTIVITY LOG
// ==========================================

export type ActivityEntry = {
  id: string;
  type: 'login' | 'logout' | 'password_change' | 'admin_action';
  action: string;
  status: 'success' | 'failure';
  email: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
};

export async function getRecentActivity(limit = 20): Promise<ActivityEntry[]> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  // Get login attempts from last 24 hours
  const { data: loginAttempts, error: loginError } = await supabaseAdmin
    .from('admin_login_attempts')
    .select('*')
    .gte('attempted_at', oneHourAgo)
    .order('attempted_at', { ascending: false })
    .limit(limit);

  // Get activity log from last 24 hours
  const { data: activityLog, error: activityError } = await supabaseAdmin
    .from('admin_activity_log')
    .select('*')
    .gte('created_at', oneHourAgo)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (loginError || activityError) {
    console.error('getRecentActivity error:', loginError?.message, activityError?.message);
    return [];
  }

  // Convert login attempts to activity entries
  const loginEntries: ActivityEntry[] = (loginAttempts || []).map((attempt) => ({
    id: attempt.id,
    type: 'login',
    action: attempt.success ? 'Successful login' : 'Failed login attempt',
    status: attempt.success ? 'success' : 'failure',
    email: attempt.email,
    ip_address: attempt.ip_address,
    user_agent: attempt.user_agent,
    created_at: attempt.attempted_at,
  }));

  // Convert activity log to activity entries
  const activityEntries: ActivityEntry[] = (activityLog || []).map((log) => ({
    id: log.id,
    type: 'admin_action',
    action: log.action,
    status: 'success',
    email: log.admin_email,
    ip_address: log.ip_address,
    user_agent: log.user_agent,
    created_at: log.created_at,
  }));

  // Merge and sort by timestamp
  const allEntries = [...loginEntries, ...activityEntries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return allEntries.slice(0, limit);
}

export async function getActivitySummary() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  // Get today's login attempts
  const { data: loginAttempts, error: loginError } = await supabaseAdmin
    .from('admin_login_attempts')
    .select('*')
    .gte('attempted_at', todayIso);

  // Get last successful login
  const { data: lastLogin, error: lastLoginError } = await supabaseAdmin
    .from('admin_login_attempts')
    .select('*')
    .eq('success', true)
    .order('attempted_at', { ascending: false })
    .limit(1)
    .single();

  if (loginError || lastLoginError) {
    console.error('getActivitySummary error:', loginError?.message, lastLoginError?.message);
    return {
      totalLoginsToday: 0,
      failedAttemptsToday: 0,
      lastSuccessfulLogin: null,
    };
  }

  const totalLoginsToday = (loginAttempts || []).filter((a) => a.success).length;
  const failedAttemptsToday = (loginAttempts || []).filter((a) => !a.success).length;

  return {
    totalLoginsToday,
    failedAttemptsToday,
    lastSuccessfulLogin: lastLogin ? lastLogin.attempted_at : null,
  };
}

export async function getSuspiciousIPs(): Promise<string[]> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin
    .from('admin_login_attempts')
    .select('ip_address')
    .gte('attempted_at', oneHourAgo)
    .eq('success', false);

  if (error) {
    console.error('getSuspiciousIPs error:', error.message);
    return [];
  }

  // Count failed attempts per IP
  const ipCounts = new Map<string, number>();
  (data || []).forEach((attempt) => {
    const count = ipCounts.get(attempt.ip_address) || 0;
    ipCounts.set(attempt.ip_address, count + 1);
  });

  // Return IPs with 5+ failed attempts
  return Array.from(ipCounts.entries())
    .filter(([, count]) => count >= 5)
    .map(([ip]) => ip);
}

// ==========================================
// RELATED CONTENT
// ==========================================

export async function getRelatedGames(
  currentGameId: string,
  limit = 4
): Promise<Game[]> {
  // First try to get games from same category
  const currentGame = await supabase
    .from('games')
    .select('category_id')
    .eq('id', currentGameId)
    .single();

  if (currentGame.data?.category_id) {
    const { data: categoryGames } = await supabase
      .from('games')
      .select('*')
      .eq('category_id', currentGame.data.category_id)
      .eq('published', true)
      .neq('id', currentGameId)
      .order('views', { ascending: false })
      .limit(limit);

    if (categoryGames && categoryGames.length > 0) {
      return categoryGames as Game[];
    }
  }

  // Fallback: random published games
  const { data: randomGames } = await supabase
    .from('games')
    .select('*')
    .eq('published', true)
    .neq('id', currentGameId)
    .order('views', { ascending: false })
    .limit(limit);

  return (randomGames || []) as Game[];
}

export async function getRelatedBlogs(
  currentBlogId: string,
  gameId?: string,
  limit = 3
): Promise<Blog[]> {
  if (gameId) {
    // First try: same game blogs
    const { data: gameBlogs } = await supabase
      .from('blogs')
      .select('*')
      .eq('game_id', gameId)
      .eq('published', true)
      .neq('id', currentBlogId)
      .order('views', { ascending: false })
      .limit(limit);

    if (gameBlogs && gameBlogs.length > 0) {
      return gameBlogs as Blog[];
    }
  }

  // Fallback: latest blogs
  const { data: latestBlogs } = await supabase
    .from('blogs')
    .select('*')
    .eq('published', true)
    .neq('id', currentBlogId)
    .order('views', { ascending: false })
    .limit(limit);

  return (latestBlogs || []) as Blog[];
}

export async function getRelatedLevels(
  gameId: string,
  currentLevelNumber: number,
  limit = 5
): Promise<Level[]> {
  // Get adjacent levels (current - 2 to current + 2)
  const minLevel = Math.max(1, currentLevelNumber - 2);
  const maxLevel = currentLevelNumber + 2;

  const { data: adjacentLevels } = await supabase
    .from('levels')
    .select('*')
    .eq('game_id', gameId)
    .eq('published', true)
    .gte('level_number', minLevel)
    .lte('level_number', maxLevel)
    .neq('level_number', currentLevelNumber)
    .order('level_number', { ascending: true })
    .limit(limit);

  if (adjacentLevels && adjacentLevels.length >= limit) {
    return adjacentLevels as Level[];
  }

  // Fallback: popular levels from same game
  const { data: popularLevels } = await supabase
    .from('levels')
    .select('*')
    .eq('game_id', gameId)
    .eq('published', true)
    .neq('level_number', currentLevelNumber)
    .order('views', { ascending: false })
    .limit(limit);

  return (popularLevels || []) as Level[];
}
