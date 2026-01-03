type ApiResponse<T> = {
    success: boolean;
    data: T;
    message?: string;
};

export type StatsSummaryResponse = {
    todayUserCount: number;
    todayAccountCount: number;
    totalUserCount: number;
    totalAccountCount: number;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE ?? 'https://api.xn--vk1b177d.com';

const fetchStatsSummary = async (): Promise<StatsSummaryResponse> => {
    const response = await fetch(`${API_BASE_URL}/stats/summary`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch stats summary: ${response.status}`);
    }

    const payload = await response.json() as ApiResponse<StatsSummaryResponse>;

    if (!payload.success || !payload.data) {
        throw new Error(payload.message || 'Stats summary request was not successful.');
    }

    return payload.data;
};

export default fetchStatsSummary;
