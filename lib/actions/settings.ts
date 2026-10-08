'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';

export async function updateSettings(formData: FormData) {
  const site_name = formData.get('site_name') as string;
  const site_url = formData.get('site_url') as string;
  const site_logo = (formData.get('site_logo') as string) || null;
  const site_description = (formData.get('site_description') as string) || null;
  const adsense_header = (formData.get('adsense_header') as string) || null;
  const adsense_in_article = (formData.get('adsense_in_article') as string) || null;
  const adsense_sidebar = (formData.get('adsense_sidebar') as string) || null;
  const adsense_footer = (formData.get('adsense_footer') as string) || null;
  const youtube_button_text =
    (formData.get('youtube_button_text') as string) || 'Watch on YouTube';
  const switch_youtube_enabled = formData.get('switch_youtube_enabled') === 'on';
  const google_analytics_id =
    (formData.get('google_analytics_id') as string) || null;
  const google_search_console =
    (formData.get('google_search_console') as string) || null;

  const social_links: Record<string, string> = {};
  const youtube = (formData.get('social_youtube') as string) || '';
  const facebook = (formData.get('social_facebook') as string) || '';
  const twitter = (formData.get('social_twitter') as string) || '';
  const instagram = (formData.get('social_instagram') as string) || '';

  if (youtube) social_links.youtube = youtube;
  if (facebook) social_links.facebook = facebook;
  if (twitter) social_links.twitter = twitter;
  if (instagram) social_links.instagram = instagram;

  const { error } = await supabaseAdmin
    .from('settings')
    .update({
      site_name,
      site_url,
      site_logo,
      site_description,
      adsense_header,
      adsense_in_article,
      adsense_sidebar,
      adsense_footer,
      youtube_button_text,
      switch_youtube_enabled,
      google_analytics_id,
      google_search_console,
      social_links,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);

  if (error) return { error: error.message };

  revalidatePath('/admin/settings');
  revalidatePath('/');
  revalidatePath('/game', 'layout');
}