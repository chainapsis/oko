export type WithTime<T> = T & { created_at: Date; updated_at: Date };

export type WithPagination<T> = { rows: T; has_next: boolean };
