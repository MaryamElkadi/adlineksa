export function serializeDocument<T extends { _id?: any; toObject?: () => any }>(document: T) {
  if (!document) return document;
  const raw = typeof (document as any).toObject === "function" ? (document as any).toObject() : document;
  const id = raw._id ? raw._id.toString() : raw.id;
  return {
    ...raw,
    id,
    _id: undefined,
    createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : raw.createdAt,
    updatedAt: raw.updatedAt instanceof Date ? raw.updatedAt.toISOString() : raw.updatedAt,
  };
}
