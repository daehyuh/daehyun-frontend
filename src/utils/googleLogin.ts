import {Browser} from '@capacitor/browser';
import {isNativeApp, setAuthTokens} from '@/auth/authTokens';

const API_BASE_URL = import.meta.env.VITE_API_BASE ?? 'https://api.xn--vk1b177d.com';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '609416675991-2g5jqg562hursv4v09upi96q1fvrvius.apps.googleusercontent.com';
const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
const GOOGLE_REDIRECT_URI = `${API_BASE_URL}/login/oauth2/code/google`;

export const startGoogleLogin = () => {
    if (isNativeApp()) {
        void Browser.open({url: `${API_BASE_URL}/auth/mobile/start`});
        return;
    }

    const state = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : String(Date.now());

    if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('google_oauth_state', state);
    }

    const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_REDIRECT_URI,
        response_type: 'code',
        scope: GOOGLE_SCOPE,
        access_type: 'offline',
        prompt: 'consent',
        state
    });

    window.location.href = `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;
};

const parseTokens = (value: unknown): {accessToken: string; refreshToken: string} | null => {
    if (typeof value !== 'object' || value === null) return null;
    const source = value as {accessToken?: unknown; refreshToken?: unknown; data?: unknown};
    if (typeof source.accessToken === 'string' && typeof source.refreshToken === 'string') {
        return {accessToken: source.accessToken, refreshToken: source.refreshToken};
    }
    return parseTokens(source.data);
};

export const handleMobileAuthUrl = async (url: string): Promise<boolean> => {
    if (!isNativeApp() || !url.startsWith('com.daehyun.app://oauth/callback')) return false;

    const callbackUrl = new URL(url);
    const ticket = callbackUrl.searchParams.get('ticket');
    if (!ticket) throw new Error('Mobile OAuth callback did not contain a ticket.');

    const response = await fetch(`${API_BASE_URL}/auth/mobile/exchange`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Accept: 'application/json'},
        body: JSON.stringify({ticket}),
    });
    if (!response.ok) throw new Error(`Mobile OAuth ticket exchange failed: ${response.status}`);

    const tokens = parseTokens(await response.json());
    if (!tokens) throw new Error('Mobile OAuth response is invalid.');
    await setAuthTokens(tokens);
    await Browser.close().catch(() => undefined);
    return true;
};
