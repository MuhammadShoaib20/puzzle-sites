'use client';

import imageCompression from 'browser-image-compression';
import { useRef, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

type Props = {
  /** Form field name (e.g. "cover_image") */
  name: string;
  /** Existing URL (for edit mode) */
  defaultValue?: string;
  /** Storage folder inside the "images" bucket (e.g. "games", "blogs", "logos") */
  folder?: string;
  /** Optional label */
  label?: string;
  /** Aspect ratio of the preview */
  aspect?: 'video' | 'square' | 'wide' | 'auto';
};

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const COMPRESSIBLE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_INPUT_SIZE = 20 * 1024 * 1024;
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

export default function ImageUpload({
  name,
  defaultValue = '',
  folder = 'general',
  label,
  aspect = 'video',
}: Props) {
  const [url, setUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError('');

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Sirf JPG, PNG, WebP, GIF ya AVIF allowed hain.');
      return;
    }
    if (file.size > MAX_INPUT_SIZE) {
      setError('Original image 20MB se chhoti honi chahiye.');
      return;
    }

    setUploading(true);
    try {
      const shouldCompress = COMPRESSIBLE_TYPES.includes(file.type);
      setUploadStatus(shouldCompress ? 'Optimizing image…' : 'Preparing image…');
      const uploadFile = shouldCompress
        ? await imageCompression(file, {
              maxSizeMB: 1.5,
              maxWidthOrHeight: 1920,
              initialQuality: 0.82,
              useWebWorker: false,
            })
        : file;

      if (uploadFile.size > MAX_UPLOAD_SIZE) {
        setError(
          shouldCompress
            ? 'Image compression ke baad bhi 5MB se badi hai.'
            : 'GIF ya AVIF file 5MB se chhoti honi chahiye.'
        );
        return;
      }

      setUploadStatus('Uploading directly to Supabase…');
      const signResponse = await fetch('/api/upload/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folder,
          type: uploadFile.type,
          size: uploadFile.size,
        }),
      });
      const signPayload: unknown = await signResponse.json();
      if (!signPayload || typeof signPayload !== 'object') {
        throw new Error('Could not prepare image upload.');
      }

      const signedData = signPayload as { error?: unknown; path?: unknown; token?: unknown };
      if (!signResponse.ok) {
        throw new Error(
          typeof signedData.error === 'string' ? signedData.error : 'Could not prepare image upload.'
        );
      }
      if (typeof signedData.path !== 'string' || typeof signedData.token !== 'string') {
        throw new Error('Upload authorization response was invalid.');
      }

      const { error: uploadError } = await supabaseBrowser.storage
        .from('images')
        .uploadToSignedUrl(signedData.path, signedData.token, uploadFile, {
          contentType: uploadFile.type,
          cacheControl: '31536000',
        });
      if (uploadError) throw new Error(`Supabase upload failed: ${uploadError.message}`);

      const { data } = supabaseBrowser.storage.from('images').getPublicUrl(signedData.path);
      setUrl(data.publicUrl);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadStatus('');
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function clear() {
    setUrl('');
    if (inputRef.current) inputRef.current.value = '';
  }

  const aspectClass = {
    video: 'aspect-video',
    square: 'aspect-square',
    wide: 'aspect-[21/9]',
    auto: '',
  }[aspect];

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-1.5">{label}</label>
      )}

      {/* Hidden input — actual value submitted with form */}
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div
          className="relative rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--line)' }}
        >
          <div className={`${aspectClass} relative`} style={{ background: '#F1F5F9' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Preview" className="w-full h-full object-cover" />
          </div>

          <div className="absolute top-2 right-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="text-xs font-bold px-3 py-2 min-h-11 rounded-lg shadow-md transition hover:scale-105 disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.96)', color: 'var(--ink)' }}
            >
              {uploading ? 'Uploading…' : '🔄 Change'}
            </button>
            <button
              type="button"
              onClick={clear}
              className="text-xs font-bold px-3 py-2 min-h-11 rounded-lg shadow-md text-white transition hover:scale-105"
              style={{ background: '#EF4444' }}
            >
              ✕ Remove
            </button>
          </div>

          {uploading && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.7)' }}
            >
              <div
                className="w-8 h-8 border-[3px] rounded-full animate-spin"
                style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}
              />
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={`${aspectClass} rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200`}
          style={{
            borderColor: dragging ? 'var(--primary)' : 'var(--line)',
            background: dragging ? 'var(--primary-soft)' : '#fff',
            minHeight: aspect === 'auto' ? 120 : undefined,
          }}
        >
          {uploading ? (
            <>
              <div
                className="w-9 h-9 border-[3px] rounded-full animate-spin mb-3"
                style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}
              />
              <p
                className="text-sm font-semibold"
                style={{ color: 'var(--ink)' }}
                role="status"
                aria-label={uploadStatus || 'Uploading image'}
              >
                {uploadStatus || 'Uploading…'}
              </p>
            </>
          ) : (
            <>
              <div className="text-4xl mb-2">🖼️</div>
              <p className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
                Photo choose karein ya camera se lein
              </p>
              <p className="text-xs mt-1 px-4" style={{ color: 'var(--muted)' }}>
                JPG · PNG · WebP · GIF · AVIF · Max 20MB original
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs mt-2 font-medium" style={{ color: '#B91C1C' }}>
          {error}
          <span className="block mt-1 text-[10px] font-normal" style={{ color: '#64748B' }}>
            (You can still submit the form without an image)
          </span>
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onSelect}
        className="hidden"
      />
    </div>
  );
}
