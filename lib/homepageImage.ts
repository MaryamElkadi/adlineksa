export type HomepageImageCollection = 'products' | 'categories' | 'services' | 'exhibitions';

export function homepageImageUrl(
  collection: HomepageImageCollection,
  id: string,
  image: string | undefined,
  updatedAt?: Date | string,
) {
  if (!image) return '/products/printing.png';

  if (/^data:image\/(?:jpe?g|png|webp|avif|gif);base64,/i.test(image)) {
    const version = updatedAt instanceof Date ? updatedAt.getTime() : updatedAt ? Date.parse(updatedAt) : 0;
    return `/api/homepage-image/${collection}/${id}${version ? `?v=${version}` : ''}`;
  }

  return image;
}