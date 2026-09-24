const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.8;
const COMPRESS_ABOVE_BYTES = 500 * 1024;

/**
 * Shrinks large JPEG/PNG images before upload to save candidates' bandwidth.
 * PDFs and small images are returned unchanged. Falls back to the original file on any error.
 */
export async function compressImage(file) {
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isImage || file.size <= COMPRESS_ABOVE_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.\w+$/, '.jpg');
    return new File([blob], name, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}
