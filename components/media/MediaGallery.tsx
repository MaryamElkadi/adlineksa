"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { ImageMedia, VideoMedia } from "@/types";

function optimizedSource(src: string) {
  if (src.startsWith("/")) return true;
  try {
    return ["res.cloudinary.com", "images.unsplash.com", "plus.unsplash.com", "media.istockphoto.com"].includes(new URL(src).hostname);
  } catch {
    return false;
  }
}

function videoEmbed(video: VideoMedia) {
  try {
    const url = new URL(video.url);
    if (video.provider === "youtube") {
      const id = url.searchParams.get("v");
      return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : "";
    }
    if (video.provider === "vimeo") {
      const id = url.pathname.split("/").filter(Boolean).at(-1);
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : "";
    }
  } catch {
    return "";
  }
  return "";
}

export function MediaGallery({
  images,
  videos = [],
  alt,
}: {
  images: (ImageMedia | string)[];
  videos?: VideoMedia[];
  alt: string;
}) {
  const items = useMemo(() => [
    ...images.map((image, index) => ({
      kind: "image" as const,
      url: typeof image === "string" ? image : image.url,
      alt: typeof image === "string" ? alt : image.alt || alt,
      key: `image-${typeof image === "string" ? image : image.url}-${index}`,
    })),
    ...videos.map((video, index) => ({ kind: "video" as const, video, key: `video-${video.publicId || video.url}-${index}` })),
  ], [alt, images, videos]);
  const [selectedKey, setSelectedKey] = useState("");
  const selected = items.find((item) => item.key === selectedKey) || items[0];

  if (!items.length) {
    return <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-slate-100">
      <Image src="/products/printing.png" alt={alt} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
    </div>;
  }

  return (
    <div dir="rtl" className="flex flex-col gap-4">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-lg">
        {selected?.kind === "image" ? (
          <Image src={selected.url || "/products/printing.png"} alt={selected.alt} fill priority sizes="(max-width: 1024px) 100vw, 50vw" quality={75} unoptimized={!optimizedSource(selected.url)} className="object-contain" />
        ) : selected?.video.provider === "cloudinary" ? (
          <video src={selected.video.url} poster={selected.video.thumbnailUrl || undefined} controls preload="metadata" className="h-full w-full object-contain" aria-label={selected.video.title || alt} />
        ) : (
          videoEmbed(selected.video) ? (
            <iframe src={videoEmbed(selected.video)} title={selected.video.title || alt} allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" className="h-full w-full" />
          ) : <p className="p-6 text-center text-sm text-white">تعذر تحميل رابط الفيديو.</p>
        )}
      </div>

      {items.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {items.map((item, index) => {
            const active = selected?.key === item.key;
            return (
              <button key={item.key} type="button" aria-label={item.kind === "image" ? `عرض الصورة ${index + 1}` : `عرض الفيديو ${index + 1}`} aria-pressed={active} onClick={() => setSelectedKey(item.key)} className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${active ? "scale-105 border-amber-400" : "border-slate-200 opacity-75 hover:opacity-100"}`}>
                {item.kind === "image" ? (
                  <Image src={item.url || "/products/printing.png"} alt="" fill loading="lazy" sizes="80px" quality={72} unoptimized={!optimizedSource(item.url)} className="object-cover" />
                ) : item.video.thumbnailUrl ? (
                  <Image src={item.video.thumbnailUrl} alt="" fill loading="lazy" sizes="80px" unoptimized={!optimizedSource(item.video.thumbnailUrl)} className="object-cover" />
                ) : <span className="flex h-full items-center justify-center bg-slate-900 text-xl text-white" aria-hidden="true">▶</span>}
                {item.kind === "video" && <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 text-[9px] text-white">فيديو</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
