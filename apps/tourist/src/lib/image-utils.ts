/**
 * Compresses mobile camera captures client-side to <= 1024px JPEG (~80-150KB)
 * so tourists on roaming 4G connections get fast Snap & Ask responses.
 */
export async function compressImageToBase64(
  file: File,
  maxDimension = 1024,
  quality = 0.8,
): Promise<{ base64: string; mimeType: string; previewDataUrl: string }> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read image file'));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not decode image'));
    image.src = dataUrl;
  });

  const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
  const targetWidth = Math.max(1, Math.round(img.width * scale));
  const targetHeight = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    const rawBase64 = dataUrl.split(',')[1] ?? '';
    return { base64: rawBase64, mimeType: file.type || 'image/jpeg', previewDataUrl: dataUrl };
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
  const base64 = compressedDataUrl.split(',')[1] ?? '';

  return {
    base64,
    mimeType: 'image/jpeg',
    previewDataUrl: compressedDataUrl,
  };
}
