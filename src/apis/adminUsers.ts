const API_BASE_URL = import.meta.env.VITE_API_BASE ?? 'https://api.xn--vk1b177d.com';

export type AdminAccount = {
    id: number;
    accountId: number;
    nickname: string | null;
    rankPoint: number | null;
    latestRecordDate: string | null;
    lastSyncedAt: string | null;
    syncStatus: string | null;
    recordCount: number;
    snapshotCount: number;
    dailyBaselineCount: number;
    hasSyncState: boolean;
};

export type AdminUser = {
    id: number;
    email: string | null;
    name: string | null;
    provider: string | null;
    providerId: string | null;
    role: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    accounts: AdminAccount[];
};

export type AdminUserPage = {
    content: AdminUser[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
};

export type AdminAccountAction = {
    userId: number;
    accountId: number;
    dataDeleted: boolean;
    deletedRecords: number;
    deletedSnapshots: number;
    deletedDailyBaselines: number;
    deletedGuestMappings: number;
};

export class AdminApiError extends Error {
    readonly status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'AdminApiError';
        this.status = status;
    }
}

const readAccessToken = (): string | null => {
    if (typeof document === 'undefined') return null;
    return document.cookie
        .split(';')
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith('accessToken='))
        ?.split('=')[1] ?? null;
};

const readMessage = (body: unknown): string | null => {
    if (typeof body !== 'object' || body === null) return null;
    const value = body as { message?: unknown; error?: unknown; detail?: unknown };
    return [value.message, value.error, value.detail]
        .find((candidate): candidate is string => typeof candidate === 'string' && candidate.trim().length > 0)
        ?? null;
};

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
    const headers = new Headers(init.headers);
    headers.set('Accept', 'application/json');
    const accessToken = readAccessToken();
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers,
        credentials: 'include',
    });
    const text = await response.text();
    let body: unknown = null;
    if (text) {
        try {
            body = JSON.parse(text);
        } catch {
            body = null;
        }
    }

    if (!response.ok) {
        throw new AdminApiError(
            readMessage(body) ?? `Request failed with status ${response.status}`,
            response.status
        );
    }

    if (typeof body === 'object' && body !== null && 'data' in body) {
        return (body as { data: T }).data;
    }
    return body as T;
};

export const fetchAdminUsers = (params: { page: number; size: number; query: string }) => {
    const searchParams = new URLSearchParams({
        page: String(params.page),
        size: String(params.size),
    });
    if (params.query.trim()) searchParams.set('query', params.query.trim());
    return request<AdminUserPage>(`/admin/users?${searchParams.toString()}`);
};

export const unlinkAdminAccount = (userId: number, accountRecordId: number) =>
    request<AdminAccountAction>(`/admin/users/${userId}/accounts/${accountRecordId}`, {
        method: 'DELETE',
    });

export const deleteAdminAccountData = (userId: number, accountRecordId: number) =>
    request<AdminAccountAction>(`/admin/users/${userId}/accounts/${accountRecordId}/data`, {
        method: 'DELETE',
    });
