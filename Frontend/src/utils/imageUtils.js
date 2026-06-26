const DEFAULT_IMAGE_WIDTH = 480;

export function getOptimizedImageUrl(imageUrl, options = {}) {
  if (!imageUrl) return "";

  const width = options.width || DEFAULT_IMAGE_WIDTH;
  const isCloudinaryUrl = /cloudinary\.com/.test(imageUrl);

  if (!isCloudinaryUrl) {
    return imageUrl;
  }

  const url = new URL(imageUrl);
  const params = new URLSearchParams(url.search);

  params.set('q', 'auto');
  params.set('f', 'auto');
  params.set('w', String(width));
  params.set('c', 'fill');
  params.set('g', 'center');

  url.search = params.toString();
  return url.toString();
}
