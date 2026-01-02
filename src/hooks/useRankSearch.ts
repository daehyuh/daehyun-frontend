import {useCallback, useEffect, useState} from "react";

interface UseRankSearchOptions<T> {
  fetcher: () => Promise<T[]>;
  filterKey: keyof T;
  placeholder?: string;
}

export function useRankSearch<T>({fetcher, filterKey}: UseRankSearchOptions<T>) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T[]>([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<T[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      const safeResult = result ?? [];
      setData(safeResult);
      setFiltered(safeResult);
    } catch (e) {
      console.error(e);
      setData([]);
      setFiltered([]);
      setError("랭킹을 불러오는 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (search.length === 0) {
      setFiltered(data);
    } else {
      setFiltered(
        data.filter((item) => {
          const value = String(item[filterKey] ?? "").toLowerCase();
          return value.includes(search.toLowerCase());
        })
      );
    }
  }, [search, data, filterKey]);

  const handleInputChange = (value: string) => {
    setSearch(value);
  };

  return {
    loading,
    error,
    data,
    search,
    filtered,
    handleInputChange,
    refresh,
    setData,
    setSearch,
    setFiltered,
  };
}
