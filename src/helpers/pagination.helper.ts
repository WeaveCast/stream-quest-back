export interface PaginationOptions {
  limit?: number;
  cursor?: string;
  direction?: 'forward' | 'backward';
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  previousCursor: string | null;
  count: number;
  hasMore: boolean;
  hasPrevious: boolean;
}

export function paginate<T extends { id: string }>(
  items: T[],
  options: PaginationOptions,
): PaginatedResult<T> {
  const limit = options.limit || 10;
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;

  return {
    data,
    nextCursor: hasMore ? data[data.length - 1].id : null,
    previousCursor: data.length > 0 ? data[0].id : null,
    count: data.length,
    hasMore,
    hasPrevious: !!options.cursor,
  };
}
