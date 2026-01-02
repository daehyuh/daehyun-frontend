const API_BASE_URL = import.meta.env.VITE_API_BASE ?? 'https://api.xn--vk1b177d.com';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '609416675991-2g5jqg562hursv4v09upi96q1fvrvius.apps.googleusercontent.com';
const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
const GOOGLE_REDIRECT_URI = `${API_BASE_URL}/login/oauth2/code/google`;

export const startGoogleLogin = () => {
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
