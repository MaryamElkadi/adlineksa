export function serializeDocument<T extends { _id: { toString(): string }; toObject(): T }>(document: T) {
  const value = document.toObject() as T & { _id: { toString(): string }; createdAt?: Date; updatedAt?: Date };
  return { ...value, id: value._id.toString(), _id: undefined, createdAt: value.createdAt?.toISOString(), updatedAt: value.updatedAt?.toISOString() };
}
