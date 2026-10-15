"use client";

import { useState } from "react";
import Image from "next/image";
import type { ImageMedia, VideoMedia } from "@/types";
import { isOptimizableImageUrl, parseExternalVideoUrl } from "@/lib/media";

interface MediaManagerProps {
  images: ImageMedia[];
  videos: VideoMedia[];
  coverImage: string;
  onCoverImageChange: (url: string) => void;
  onImagesChange: (images: ImageMedia[]) => void;
  onVideosChange: (videos: VideoMedia[]) => void;
}

function uploadFile(file: File, kind: "image" | "video", onProgress: (value: number) => void) {
  return new Promise<{ url: string; publicId: string; provider?: "cloudinary" }>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/media/upload");
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onerror = () => reject(new Error("Upload connection failed."));
    request.onload = () => {
      let data: { url?: string; publicId?: string; provider?: "cloudinary"; message?: string };
      try { data = JSON.parse(request.responseText); } catch { reject(new Error("The upload server returned an invalid response.")); return; }
      if (request.status < 200 || request.status >= 300 || !data.url || !data.publicId) {
        reject(new Error(data.message || "Upload failed."));
        return;
      }
      resolve(data as { url: string; publicId: string; provider?: "cloudinary" });
    };
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);
    request.send(formData);
  });
}

function embedUrl(video: VideoMedia) {
  try {
    if (video.provider === "youtube") {
      const id = new URL(video.url).searchParams.get("v");
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : "";
    }
    if (video.provider === "vimeo") {
      const id = new URL(video.url).pathname.split("/").filter(Boolean).at(-1);
      return id ? `https://player.vimeo.com/video/${id}` : "";
    }
  } catch {
    return "";
  }
  return "";
}

export function MediaManager({ images, videos, coverImage, onCoverImageChange, onImagesChange, onVideosChange }: MediaManagerProps) {
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoPoster, setVideoPoster] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const uploadFiles = async (files: FileList | null, kind: "image" | "video") => {
    if (!files?.length) return;
    setError("");
    const addedImages = [...images];
    const addedVideos = [...videos];
    for (const file of Array.from(files)) {
      try {
        setProgress(`جارٍ رفع ${file.name} — 0%`);
        const result = await uploadFile(file, kind, (value) => setProgress(`جارٍ رفع ${file.name} — ${value}%`));
        if (kind === "image") {
          addedImages.push({ url: result.url, publicId: result.publicId, alt: "", sortOrder: addedImages.length });
          onImagesChange([...addedImages]);
        } else {
          addedVideos.push({ url: result.url, publicId: result.publicId, provider: "cloudinary", title: file.name.replace(/\.[^.]+$/, ""), sortOrder: addedVideos.length });
          onVideosChange([...addedVideos]);
        }
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : `تعذر رفع ${file.name}`);
        break;
      }
    }
    setProgress("");
  };

  const addImageUrl = () => {
    try {
      const parsed = new URL(imageUrl);
      if (parsed.protocol !== "https:") throw new Error();
      onImagesChange([...images, { url: parsed.href, alt: "", sortOrder: images.length }]);
      setImageUrl("");
      setError("");
    } catch {
      setError("أدخل رابط صورة HTTPS صالحاً.");
    }
  };

  const addVideoUrl = () => {
    const parsed = parseExternalVideoUrl(videoUrl.trim());
    if (!parsed) {
      setError("الرابط المدعوم هو YouTube أو Vimeo باستخدام HTTPS.");
      return;
    }
    onVideosChange([...videos, { ...parsed, title: videoTitle.trim(), thumbnailUrl: videoPoster.trim(), sortOrder: videos.length }]);
    setVideoUrl("");
    setVideoTitle("");
    setVideoPoster("");
    setError("");
  };

  const move = <T,>(items: T[], index: number, direction: -1 | 1, update: (items: T[]) => void) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const result = [...items];
    [result[index], result[target]] = [result[target], result[index]];
    update(result);
  };

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4" aria-label="Media gallery">
      <div>
        <h2 className="text-sm font-black text-slate-800">الصور والفيديوهات</h2>
        <p className="mt-1 text-xs text-slate-500">الصور حتى 10MB؛ الفيديو MP4/WebM (الحد حسب إعداد الخادم).</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="cursor-pointer rounded-xl bg-amber-100 px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-200">
          رفع الصور
          <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => { void uploadFiles(event.target.files, "image"); event.target.value = ""; }} />
        </label>
        <label className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700">
          رفع الفيديوهات
          <input className="sr-only" type="file" accept="video/mp4,video/webm" multiple onChange={(event) => { void uploadFiles(event.target.files, "video"); event.target.value = ""; }} />
        </label>
      </div>
      {progress && <p role="status" className="text-xs font-bold text-amber-700">{progress}</p>}
      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-700">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        {images.map((image, index) => (
          <div key={`${image.publicId || image.url}-${index}`} className="flex items-center gap-3 rounded-xl border border-slate-200 p-2">
            <Image src={image.url} alt={image.alt || `صورة ${index + 1}`} width={80} height={64} unoptimized={!isOptimizableImageUrl(image.url)} className="h-16 w-20 rounded-lg bg-slate-100 object-cover" />
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-slate-700">{image.url === coverImage ? "صورة الغلاف" : `صورة ${index + 1}`}</span>
              <label className="mt-1 block text-[10px] text-slate-600">
              <input type="radio" name="cover-image" checked={image.url === coverImage} onChange={() => onCoverImageChange(image.url)} />
                <span className="mr-1">صورة الغلاف</span>
              </label>
              <label className="mt-1 block">
                <span className="sr-only">النص البديل</span>
                <input value={image.alt || ""} onChange={(event) => onImagesChange(images.map((item, itemIndex) => itemIndex === index ? { ...item, alt: event.target.value } : item))} placeholder="وصف الصورة" className="w-full rounded border border-slate-200 px-2 py-1 text-[10px]" />
              </label>
            </div>
            <div className="flex flex-col gap-1">
              <button type="button" aria-label={`تحريك الصورة ${index + 1} للأعلى`} onClick={() => move(images, index, -1, onImagesChange)} className="rounded bg-slate-100 px-2 py-1 text-xs">↑</button>
              <button type="button" aria-label={`تحريك الصورة ${index + 1} للأسفل`} onClick={() => move(images, index, 1, onImagesChange)} className="rounded bg-slate-100 px-2 py-1 text-xs">↓</button>
              <button type="button" aria-label={`حذف الصورة ${index + 1}`} onClick={() => onImagesChange(images.filter((_, itemIndex) => itemIndex !== index))} className="rounded bg-rose-50 px-2 py-1 text-xs text-rose-700">×</button>
            </div>
          </div>
        ))}
      </div>
      {!images.length && <p className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500">لم تتم إضافة صور بعد.</p>}

      <div className="flex flex-col gap-2 sm:flex-row">
        <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="رابط صورة HTTPS (اختياري)" className="min-w-0 flex-1 rounded-xl border border-slate-200 p-2 text-xs" />
        <button type="button" onClick={addImageUrl} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold">إضافة صورة برابط</button>
      </div>

      <div className="space-y-3">
        {videos.map((video, index) => {
          const embed = video.provider === "cloudinary" ? "" : embedUrl(video);
          return (
            <div key={`${video.publicId || video.url}-${index}`} className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[180px_1fr_auto]">
              {video.provider === "cloudinary" ? <video src={video.url} controls preload="metadata" poster={video.thumbnailUrl || undefined} className="aspect-video w-full rounded-lg bg-black" /> : <iframe src={embed} title={video.title || `Video ${index + 1}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="aspect-video w-full rounded-lg bg-black" />}
              <div className="space-y-2">
                <input value={video.title || ""} onChange={(event) => onVideosChange(videos.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} placeholder="عنوان الفيديو (اختياري)" className="w-full rounded-lg border border-slate-200 p-2 text-xs" />
                <input value={video.thumbnailUrl || ""} onChange={(event) => onVideosChange(videos.map((item, itemIndex) => itemIndex === index ? { ...item, thumbnailUrl: event.target.value } : item))} placeholder="رابط صورة الملصق (اختياري)" className="w-full rounded-lg border border-slate-200 p-2 text-xs" />
                <p className="truncate text-[10px] text-slate-500">{video.provider === "cloudinary" ? "فيديو مخزن" : video.provider}</p>
              </div>
              <div className="flex gap-1 sm:flex-col">
                <button type="button" aria-label={`تحريك الفيديو ${index + 1} للأعلى`} onClick={() => move(videos, index, -1, onVideosChange)} className="rounded bg-slate-100 px-2 py-1 text-xs">↑</button>
                <button type="button" aria-label={`تحريك الفيديو ${index + 1} للأسفل`} onClick={() => move(videos, index, 1, onVideosChange)} className="rounded bg-slate-100 px-2 py-1 text-xs">↓</button>
                <button type="button" aria-label={`حذف الفيديو ${index + 1}`} onClick={() => onVideosChange(videos.filter((_, itemIndex) => itemIndex !== index))} className="rounded bg-rose-50 px-2 py-1 text-xs text-rose-700">×</button>
              </div>
            </div>
          );
        })}
        {!videos.length && <p className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500">لم تتم إضافة فيديوهات بعد.</p>}
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <input value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="رابط YouTube أو Vimeo" className="rounded-xl border border-slate-200 p-2 text-xs sm:col-span-3" />
        <input value={videoTitle} onChange={(event) => setVideoTitle(event.target.value)} placeholder="عنوان الفيديو (اختياري)" className="rounded-xl border border-slate-200 p-2 text-xs" />
        <input value={videoPoster} onChange={(event) => setVideoPoster(event.target.value)} placeholder="رابط صورة الملصق (اختياري)" className="rounded-xl border border-slate-200 p-2 text-xs" />
        <button type="button" onClick={addVideoUrl} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold">إضافة فيديو بالرابط</button>
      </div>
    </section>
  );
}
