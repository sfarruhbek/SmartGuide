/**
 * Compresses mobile camera / gallery images client-side to <= 1024px JPEG (< 200KB)
 * so tourists on roaming 4G connections get fast Snap & Ask responses.
 */
export async function compressImageToBase64(
  file: File,
  maxDimension = 1024,
  initialQuality = 0.78,
): Promise<{ base64: string; mimeType: string; previewDataUrl: string }> {
  if (
    !file.size ||
    file.size > 20 * 1024 * 1024 ||
    (file.type && !file.type.startsWith('image/'))
  )
    throw new Error('Choose an image up to 20 MB');
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
    throw new Error('Image processing is unavailable');
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Bound the decoded JPEG size, including detailed photographs that need resizing.
  let quality = initialQuality;
  let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
  let base64 = compressedDataUrl.split(',')[1] ?? '';

  while (base64.length > 250_000) {
    if (quality > 0.45) {
      quality = Math.max(0.4, quality - 0.12);
    } else {
      const resized = document.createElement('canvas');
      resized.width = Math.max(1, Math.round(canvas.width * 0.8));
      resized.height = Math.max(1, Math.round(canvas.height * 0.8));
      const resizedContext = resized.getContext('2d');
      if (!resizedContext) throw new Error('Image processing is unavailable');
      resizedContext.drawImage(canvas, 0, 0, resized.width, resized.height);
      canvas.width = resized.width;
      canvas.height = resized.height;
      ctx.drawImage(resized, 0, 0);
    }
    compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
    base64 = compressedDataUrl.split(',')[1] ?? '';
  }

  if (!base64) throw new Error('Could not encode image');

  return {
    base64,
    mimeType: 'image/jpeg',
    previewDataUrl: compressedDataUrl,
  };
}
