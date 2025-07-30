import { useEffect, useState } from "react";

interface UseRankSearchOptions<T> {
  fetcher: () => Promise<T[]>;
  filterKey: keyof T;
  placeholder?: string;
}

export function useRankSearch<T>({ fetcher, filterKey }: UseRankSearchOptions<T>) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<T[]>([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<T[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetcher();
        setData(result);
        setFiltered(result);
      } catch (e) {
        // TODO: 에러 핸들링
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [fetcher]);

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
    data,
    search,
    filtered,
    handleInputChange,
    setData,
    setSearch,
    setFiltered,
  };
} 