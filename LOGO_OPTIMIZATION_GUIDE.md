# Logo Optimization Guide

## Current Issue
- **Current logo**: 900 KB (899,965 bytes)
- **Mobile load time**: 6.8 seconds
- **URL**: https://cxusfyodasfrhkxdroxq.supabase.co/storage/v1/object/public/images/logos/1791573014627-ymd2y7l8.png

## Target
- **Format**: WebP
- **Size**: 400x400 pixels max
- **File size**: < 30 KB
- **Expected load time**: < 0.5 seconds

## Step-by-Step Instructions

### Option 1: Using Online Tool (Easiest)
1. Go to https://squoosh.app/
2. Upload your current logo
3. Settings:
   - Format: WebP
   - Resize: 400x400 (maintain aspect ratio)
   - Quality: 80-85
4. Download the optimized WebP file
5. Verify file size is < 30 KB

### Option 2: Using Command Line (ffmpeg)
```bash
ffmpeg -i input.png -vf scale=400:400 -quality 85 output.webp
```

### Option 3: Using ImageMagick
```bash
convert input.png -resize 400x400 -quality 85 output.webp
```

## Upload to Supabase

1. Go to Supabase Dashboard → Storage → images → logos
2. Upload the new optimized WebP file
3. Copy the new URL

## Update in Admin Panel

1. Go to `/ms-control-9x7k2p/settings`
2. Find "Site Logo" field
3. Paste the new Supabase URL
4. Save settings

## Verification

After optimization, verify:
1. Logo loads quickly on mobile (< 0.5s)
2. File size in DevTools Network tab shows < 30 KB
3. Image is still clear at 400x400 size
4. No layout shift or quality issues

## Why This Matters

- **900 KB → 30 KB**: 97% reduction
- **6.8s → 0.5s**: 13x faster load time
- **Mobile performance**: Will improve from 84 to 90+
- **Data usage**: Saves ~870 KB per visitor
