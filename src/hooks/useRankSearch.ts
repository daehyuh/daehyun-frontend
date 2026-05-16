import {useCallback, useEffect, useState} from "react";
import type {RankApiResult, RankPagination} from "@/constant/PaginatedResponse";

interface UseRankSearchOptions<T extends { rank?: number }> {
  fetcher: (params: { page: number; size: number; query: string }) => Promise<RankApiResult<T>>;
  filterKey: Extract<keyof T, string>;
  pageSize?: number;
}

const createDefaultPagination = (size: number): RankPagination => ({
  page: 0,
  size,
  totalPages: 0,
  totalElements: 0,
  hasPrevious: false,
  hasNext: false,
});

const ensureRank = <T extends { rank?: number }>(items: T[], rankFromIndex: (index: number) => number): T[] => {
  return items.map((item, index) => (
    item.rank === undefined || item.rank === null
      ? {
          ...item,
          rank: rankFromIndex(index),
        }
      : item
  ));
};

const normalizeArrayResponse = <T extends { rank?: number }>(
  response: T[],
  filterKey: Extract<keyof T, string>,
  query: string,
  page: number,
  size: number
) => {
  const ranked = ensureRank(response, (index) => index + 1);
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery.length === 0
    ? ranked
    : ranked.filter((item) => String(item[filterKey] ?? "").toLowerCase().includes(normalizedQuery));
  const totalElements = filtered.length;
  const totalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / size);
  const start = page * size;

  return {
    items: filtered.slice(start, start + size),
    pagination: {
      page,
      size,
      totalPages,
      totalElements,
      hasPrevious: page > 0,
      hasNext: page + 1 < totalPages,
    },
  };
};

const normalizePageResponse = <T extends { rank?: number }>(
  response: Exclude<RankApiResult<T>, T[]>,
  page: number,
  size: number
) => {
  const responseItems = Array.isArray(response.content)
    ? response.content
    : Array.isArray(response.items)
      ? response.items
      : [];
  const currentPage = response.number ?? response.page ?? page;
  const currentSize = response.size ?? size;
  const totalElements = response.totalElements ?? responseItems.length;
  const totalPages = response.totalPages ?? (totalElements === 0 ? 0 : Math.ceil(totalElements / currentSize));

  return {
    items: ensureRank(responseItems, (index) => currentPage * currentSize + index + 1),
    pagination: {
      page: currentPage,
      size: currentSize,
      totalPages,
      totalElements,
      hasPrevious: response.first !== undefined ? !response.first : currentPage > 0,
      hasNext: response.last !== undefined ? !response.last : currentPage + 1 < totalPages,
    },
  };
};

export function useRankSearch<T extends { rank?: number }>({fetcher, filterKey, pageSize = 50}: UseRankSearchOptions<T>) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [pagination, setPagination] = useState<RankPagination>(createDefaultPagination(pageSize));

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher({page, size: pageSize, query});
      const normalized = Array.isArray(result)
        ? normalizeArrayResponse(result, filterKey, query, page, pageSize)
        : normalizePageResponse(result, page, pageSize);
      setData(normalized.items);
      setPagination(normalized.pagination);
    } catch (e) {
      console.error(e);
      setData([]);
      setPagination({
        ...createDefaultPagination(pageSize),
        page,
      });
      setError("랭킹을 불러오는 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [fetcher, filterKey, page, pageSize, query]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleInputChange = (value: string) => {
    setSearchInput(value);
  };

  const applySearch = () => {
    setPage(0);
    setQuery(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput("");
    setPage(0);
    setQuery("");
  };

  const goToPreviousPage = () => {
    setPage((prev) => Math.max(0, prev - 1));
  };

  const goToNextPage = () => {
    setPage((prev) => pagination.hasNext ? prev + 1 : prev);
  };

  return {
    loading,
    error,
    data,
    searchInput,
    query,
    page,
    pagination,
    handleInputChange,
    applySearch,
    clearSearch,
    goToPreviousPage,
    goToNextPage,
    refresh,
  };
}
