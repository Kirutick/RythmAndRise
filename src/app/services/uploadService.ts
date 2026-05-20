/**
 * Uploads a media file (image or video) to the backend.
 * 
 * ### Usage in a React component:
 * ```tsx
 * import { uploadMedia } from '../services/uploadService';
 * 
 * const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 *   const file = e.target.files?.[0];
 *   if (!file) return;
 * 
 *   try {
 *     const { url, title } = await uploadMedia(file);
 *     console.log('Permanent URL:', url);   // store this in your DB
 *   } catch (err) {
 *     console.error(err);
 *   }
 * };
 * ```
 */
export async function uploadMedia(file: File): Promise<{ url: string; title: string }> {
  const formData = new FormData();
  formData.append('media', file);          // key must match 'media' in api/auth/upload.js

  const res = await fetch('/api/auth/upload', {
    method: 'POST',
    credentials: 'include',
    body: formData,
    // ❌ Do NOT set Content-Type header — browser sets it automatically with boundary
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Upload failed');
  }

  return res.json();
}
