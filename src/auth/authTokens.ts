import {Capacitor} from '@capacitor/core';
import {TokenVault} from 'capacitor-token-vault';

const API_BASE_URL = import.meta.env.VITE_API_BASE ?? 'https://api.xn--vk1b177d.com';
const AUTH_CHANGED_EVENT = 'daehyun:auth-changed';

let accessToken: string | null = null;
let hydrated = false;
let hydrationPromise: Promise<void> | null = null;

export type AuthTokens = {
    accessToken: string;
    refreshToken: string;
};

export const isNativeApp = () => Capacitor.isNativePlatform();

const readCookieAccessToken = (): string | null => {
    if (typeof document === 'undefined') return null;
    return document.cookie
        .split(';')
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith('accessToken='))
        ?.split('=').slice(1).join('=') ?? null;
};

const notifyAuthChanged = () => {
    if (typeof window !== 'undefined') window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};

export const getAccessToken = (): string | null =>
    accessToken ?? (isNativeApp() ? null : readCookieAccessToken());

export const setAuthTokens = async (tokens: AuthTokens): Promise<void> => {
    accessToken = tokens.accessToken;
    hydrated = true;
    if (isNativeApp()) await TokenVault.setToken({value: tokens.refreshToken});
    notifyAuthChanged();
};

export const clearAuthTokens = async (): Promise<void> => {
    accessToken = null;
    hydrated = false;
    hydrationPromise = null;
    if (isNativeApp()) await TokenVault.clear();
    notifyAuthChanged();
};

const parseTokens = (value: unknown): AuthTokens | null => {
    if (typeof value !== 'object' || value === null) return null;
    const source = value as {accessToken?: unknown; refreshToken?: unknown; data?: unknown};
    if (typeof source.accessToken === 'string' && typeof source.refreshToken === 'string') {
        return {accessToken: source.accessToken, refreshToken: source.refreshToken};
    }
    return parseTokens(source.data);
};

const refreshNativeTokens = async (refreshToken: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/mobile/refresh`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Accept: 'application/json'},
        body: JSON.stringify({refreshToken}),
    });
    if (!response.ok) throw new Error(`Mobile token refresh failed: ${response.status}`);
    const tokens = parseTokens(await response.json());
    if (!tokens) throw new Error('Mobile token refresh response is invalid');
    await setAuthTokens(tokens);
};

export const hydrateAuthTokens = async (): Promise<void> => {
    if (hydrated) return;
    if (hydrationPromise) return hydrationPromise;

    hydrationPromise = (async () => {
        if (!isNativeApp()) {
            accessToken = readCookieAccessToken();
            hydrated = true;
            return;
        }

        const stored = await TokenVault.getToken();
        if (!stored.value) {
            hydrated = true;
            return;
        }

        try {
            await refreshNativeTokens(stored.value);
        } catch (error) {
            console.warn('Stored mobile session could not be restored.', error);
            await TokenVault.clear();
            accessToken = null;
            hydrated = true;
        }
    })().finally(() => {
        hydrationPromise = null;
    });

    return hydrationPromise;
};

export const authChangedEventName = AUTH_CHANGED_EVENT;
