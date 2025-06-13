import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useProblems(userOnly: boolean = true) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/problems?userOnly=${userOnly}`,
    fetcher
  );

  return {
    problems: data?.data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
