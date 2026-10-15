import type { ImageMedia, VideoMedia } from "@/types";

export function isOptimizableImageUrl(value: string): boolean {
  if (value.startsWith("/")) return true;
  try {
    return ["res.cloudinary.com", "images.unsplash.com", "plus.unsplash.com", "media.istockphoto.com"].includes(new URL(value).hostname);
  } catch {
    return false;
  }
}

export function isAllowedImageUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (/^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/]+=*$/i.test(value)) return value.length <= 16 * 1024 * 1024;
  if (value.length > 2048) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;

  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export function parseExternalVideoUrl(value: string): Pick<VideoMedia, "url" | "provider"> | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;

    if (["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(url.hostname)) {
      const id = url.pathname === "/watch" ? url.searchParams.get("v") : url.pathname.split("/").filter(Boolean).at(-1);
      if (!id || !/^[\w-]{11}$/.test(id)) return null;
      return { url: `https://www.youtube.com/watch?v=${id}`, provider: "youtube" };
    }

    if (["youtu.be"].includes(url.hostname)) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      if (!id || !/^[\w-]{11}$/.test(id)) return null;
      return { url: `https://www.youtube.com/watch?v=${id}`, provider: "youtube" };
    }

    if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(url.hostname)) {
      const id = url.pathname.split("/").filter(Boolean).at(-1);
      if (!id || !/^\d+$/.test(id)) return null;
      return { url: `https://vimeo.com/${id}`, provider: "vimeo" };
    }
  } catch {
    return null;
  }
  return null;
}

export function validateMediaPayload(value: unknown): { images: ImageMedia[]; videos: VideoMedia[] } | null {
  if (!value || typeof value !== "object") return null;
  const body = value as { images?: unknown; videos?: unknown };
  const images = body.images === undefined ? [] : body.images;
  const videos = body.videos === undefined ? [] : body.videos;
  if (!Array.isArray(images) || images.length > 30 || !Array.isArray(videos) || videos.length > 20) return null;

  const cleanImages: ImageMedia[] = [];
  for (const [index, item] of images.entries()) {
    if (!item || typeof item !== "object") return null;
    const image = item as Partial<ImageMedia>;
    if (!isAllowedImageUrl(image.url) || (image.publicId !== undefined && (typeof image.publicId !== "string" || image.publicId.length > 300)) ||
      (image.alt !== undefined && (typeof image.alt !== "string" || image.alt.length > 250))) return null;
    cleanImages.push({ url: image.url, publicId: image.publicId || "", alt: image.alt || "", sortOrder: index });
  }

  const cleanVideos: VideoMedia[] = [];
  for (const [index, item] of videos.entries()) {
    if (!item || typeof item !== "object") return null;
    const video = item as Partial<VideoMedia>;
    if (typeof video.url !== "string" || video.url.length > 2048 ||
      !["cloudinary", "youtube", "vimeo"].includes(video.provider || "") ||
      (video.thumbnailUrl && !isAllowedImageUrl(video.thumbnailUrl)) ||
      (video.title !== undefined && (typeof video.title !== "string" || video.title.length > 250)) ||
      (video.publicId !== undefined && (typeof video.publicId !== "string" || video.publicId.length > 300))) return null;
    if (video.provider === "cloudinary") {
      let parsed: URL;
      try { parsed = new URL(video.url); } catch { return null; }
      if (parsed.protocol !== "https:" || parsed.hostname !== "res.cloudinary.com" || !parsed.pathname.includes("/video/upload/")) return null;
    } else {
      const external = parseExternalVideoUrl(video.url);
      if (!external || external.provider !== video.provider) return null;
    }
    cleanVideos.push({ url: video.url, provider: video.provider as VideoMedia["provider"], publicId: video.publicId || "", thumbnailUrl: video.thumbnailUrl || "", title: video.title || "", sortOrder: index });
  }
  return { images: cleanImages, videos: cleanVideos };
}

export function prepareMediaBody(body: Record<string, unknown>, requireCover = false): boolean {
  const hasImageFields = ["images", "image", "gallery", "coverImage"].some((key) => key in body);
  const hasVideoFields = "videos" in body;
  if (!hasImageFields && !hasVideoFields) return true;

  const legacyImages = [
    ...(typeof body.image === "string" && body.image ? [body.image] : []),
    ...(Array.isArray(body.gallery) ? body.gallery.filter((item): item is string => typeof item === "string" && Boolean(item)) : []),
  ];
  const candidate = {
    images: body.images === undefined || (Array.isArray(body.images) && body.images.length === 0 && legacyImages.length > 0)
      ? legacyImages.map((url) => ({ url }))
      : body.images,
    videos: body.videos === undefined ? [] : body.videos,
  };
  const media = validateMediaPayload(candidate);
  if (!media) return false;

  if (hasImageFields) {
    const requestedCover = typeof body.coverImage === "string" && body.coverImage
      ? body.coverImage
      : typeof body.image === "string" && body.image
        ? body.image
        : media.images[0]?.url || "";
    if (requestedCover && !media.images.some((image) => image.url === requestedCover)) return false;
    if (requireCover && !requestedCover) return false;
    const cover = requestedCover || "";
    body.images = media.images;
    body.coverImage = cover;
    body.image = cover;
    body.gallery = media.images.filter((image) => image.url !== cover).map((image) => image.url);
  }

  if (hasVideoFields) body.videos = media.videos;
  return true;
}
