import {useCallback, useEffect, useMemo, useState} from "react";
import styled from "styled-components";
import Input from "./base/Input";

type StatusTone = 'info' | 'success' | 'danger';

type UserProfile = {
    name?: string;
    email?: string;
    avatarUrl?: string;
    role?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE ?? 'https://api.xn--vk1b177d.com';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '609416675991-2g5jqg562hursv4v09upi96q1fvrvius.apps.googleusercontent.com';
const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
const GOOGLE_REDIRECT_URI = `${API_BASE_URL}/login/oauth2/code/google`;

const PageStack = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing.lg};
    width: 100%;
    max-width: 880px;
    margin: 0 auto;
`;

const Card = styled.section`
    width: 100%;
    border-radius: ${({theme}) => theme.radii.lg};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surfaceElevated};
    padding: clamp(20px, 3vw, 32px);
    box-shadow: ${({theme}) => theme.shadows.soft};
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing.md};
`;

const Pill = styled.span`
    display: inline-flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing.xs};
    padding: ${({theme}) => `${theme.spacing.xs} ${theme.spacing.sm}`};
    border-radius: ${({theme}) => theme.radii.pill};
    background: ${({theme}) => theme.colors.surfaceMuted};
    border: 1px solid ${({theme}) => theme.colors.border};
    font-size: ${({theme}) => theme.typography.sizes.xs};
    letter-spacing: 0.08em;
    text-transform: uppercase;
`;

const Headline = styled.h2`
    margin: 0;
    font-size: clamp(1.3rem, 2.4vw, 1.6rem);
    letter-spacing: -0.01em;
    color: ${({theme}) => theme.colors.textPrimary};
`;

const Subtext = styled.p`
    margin: 0;
    color: ${({theme}) => theme.colors.textSecondary};
`;

const ButtonRow = styled.div`
    display: flex;
    gap: ${({theme}) => theme.spacing.sm};
    flex-wrap: wrap;
`;

const ActionButton = styled.button.attrs({type: 'button'})<{ $variant?: 'primary' | 'ghost' }>`
    border-radius: ${({theme}) => theme.radii.pill};
    padding: ${({theme}) => `${theme.spacing.sm} ${theme.spacing.lg}`};
    border: 1px solid ${({theme, $variant}) => $variant === 'ghost' ? theme.colors.border : theme.colors.borderMuted};
    background: ${({theme, $variant}) => $variant === 'ghost' ? theme.colors.surfaceMuted : theme.gradients.hero};
    color: ${({theme}) => theme.colors.textPrimary};
    font-weight: ${({theme}) => theme.typography.weights.semibold};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${({theme}) => theme.spacing.xs};
    transition: transform ${({theme}) => theme.transitions.snappy}, box-shadow ${({theme}) => theme.transitions.default},
    opacity ${({theme}) => theme.transitions.default};
    min-width: 180px;

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${({theme}) => theme.shadows.soft};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;

const Status = styled.div<{ $tone: StatusTone }>`
    border-radius: ${({theme}) => theme.radii.md};
    padding: ${({theme}) => `${theme.spacing.sm} ${theme.spacing.md}`};
    border: 1px solid ${({theme, $tone}) => $tone === 'danger'
            ? 'rgba(255, 107, 107, 0.4)'
            : $tone === 'success'
                ? 'rgba(91, 228, 155, 0.4)'
                : theme.colors.border};
    background: ${({theme, $tone}) => $tone === 'danger'
            ? 'rgba(255, 107, 107, 0.08)'
            : $tone === 'success'
                ? 'rgba(91, 228, 155, 0.08)'
                : theme.colors.surfaceMuted};
    color: ${({theme}) => theme.colors.textPrimary};
    font-size: ${({theme}) => theme.typography.sizes.sm};
`;

const Field = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing.xs};
`;

const Label = styled.label`
    font-size: ${({theme}) => theme.typography.sizes.sm};
    color: ${({theme}) => theme.colors.textSecondary};
`;

const Helper = styled.p`
    margin: 0;
    font-size: ${({theme}) => theme.typography.sizes.xs};
    color: ${({theme}) => theme.colors.textSubtle};
`;

const TwoColumn = styled.div`
    display: grid;
    gap: ${({theme}) => theme.spacing.md};
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
`;

const UserBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing.sm};
    padding: ${({theme}) => `${theme.spacing.xs} ${theme.spacing.sm}`};
    border-radius: ${({theme}) => theme.radii.pill};
    background: ${({theme}) => theme.colors.surfaceMuted};
    border: 1px solid ${({theme}) => theme.colors.border};
`;

const Avatar = styled.div`
    width: 36px;
    height: 36px;
    border-radius: ${({theme}) => theme.radii.pill};
    background: ${({theme}) => theme.colors.surface};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: ${({theme}) => theme.typography.weights.semibold};
    color: ${({theme}) => theme.colors.accent};
`;

const SectionTitle = styled.h3`
    margin: 0;
    font-size: ${({theme}) => theme.typography.sizes.lg};
    color: ${({theme}) => theme.colors.textPrimary};
`;

const Divider = styled.hr`
    border: none;
    border-top: 1px solid ${({theme}) => theme.colors.border};
    margin: ${({theme}) => `${theme.spacing.sm} 0`};
`;

const getAccessToken = (): string | null => {
    if (typeof document === 'undefined') return null;
    return document.cookie
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith('accessToken='))
        ?.split('=')[1] ?? null;
};

const clearAuthParams = () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.delete('code');
    url.searchParams.delete('state');
    window.history.replaceState({}, '', url.toString());
};

function AuthSection() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [status, setStatus] = useState<{ tone: StatusTone, message: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [nickname, setNickname] = useState('');
    const [userCode, setUserCode] = useState('');
    const [guestNickname, setGuestNickname] = useState('');
    const [hasToken, setHasToken] = useState<boolean>(() => Boolean(getAccessToken()));

    const isLoggedIn = useMemo(() => Boolean(profile) || hasToken, [profile, hasToken]);

    const loadProfile = useCallback(async () => {
        const accessToken = getAccessToken();
        setHasToken(Boolean(accessToken));
        if (!accessToken) {
            setProfile(null);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/User/profile/me`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Accept": "*/*",
                },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json() as UserProfile;
            setProfile(data);
            setStatus({tone: 'success', message: `${data.name ?? '로그인한'} 사용자로 연결되었습니다.`});
        } catch (error) {
            console.error("Error fetching user data:", error);
            setProfile(null);
            setStatus({tone: 'danger', message: '로그인이 만료되었어요. 다시 로그인해주세요.'});
        } finally {
            setIsLoading(false);
        }
    }, []);

    const exchangeCode = useCallback(async (code: string, incomingState?: string | null) => {
        const storedState = typeof sessionStorage !== 'undefined'
            ? sessionStorage.getItem('google_oauth_state')
            : null;

        if (storedState && incomingState && storedState !== incomingState) {
            setStatus({tone: 'danger', message: '로그인 요청이 만료되었습니다. 다시 시도해주세요.'});
            clearAuthParams();
            return;
        }

        setIsLoading(true);
        setStatus({tone: 'info', message: '구글 로그인 완료 중입니다...'});
        try {
            const response = await fetch(`${API_BASE_URL}/login/oauth2/code/google?code=${encodeURIComponent(code)}`, {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.removeItem('google_oauth_state');
            }

            clearAuthParams();
            await loadProfile();
            setHasToken(Boolean(getAccessToken()));
            setStatus({tone: 'success', message: '로그인이 완료되었습니다.'});
        } catch (error) {
            console.error("Error exchanging code:", error);
            setStatus({tone: 'danger', message: '로그인을 완료하지 못했습니다. 다시 시도해주세요.'});
        } finally {
            setIsLoading(false);
        }
    }, [loadProfile]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");

        if (code) {
            exchangeCode(code, state);
        } else {
            loadProfile();
        }
    }, [exchangeCode, loadProfile]);

    const handleLogin = () => {
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

    const handleLogout = () => {
        window.location.href = `${API_BASE_URL}/core/logout`;
    };

    const handleSync = async () => {
        const accessToken = getAccessToken();

        if (!accessToken) {
            setStatus({tone: 'danger', message: '로그인이 필요합니다.'});
            return;
        }

        if (!nickname || !userCode) {
            setStatus({tone: 'danger', message: '닉네임과 인증 코드를 모두 입력해주세요.'});
            return;
        }

        setIsSyncing(true);
        try {
            const url = `${API_BASE_URL}/User/Account/sync?nickname=${encodeURIComponent(nickname)}&code=${encodeURIComponent(userCode)}`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Accept": "*/*",
                },
                credentials: "include",
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || `요청 실패: ${response.status}`);
            }

            await response.json();
            setStatus({tone: 'success', message: '계정을 동기화했어요.'});
        } catch (error) {
            console.error("Error syncing account:", error);
            setStatus({
                tone: 'danger',
                message: '동기화에 실패했습니다. 이미 등록된 유저이거나 1계정 1회만 등록 가능합니다.'
            });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleGuestRegister = async () => {
        const accessToken = getAccessToken();

        if (!accessToken) {
            setStatus({tone: 'danger', message: '로그인이 필요합니다.'});
            return;
        }

        if (!guestNickname) {
            setStatus({tone: 'danger', message: '게스트 닉네임을 입력해주세요.'});
            return;
        }

        setIsSyncing(true);
        try {
            const url = `${API_BASE_URL}/User/Account/addGuest?nickname=${encodeURIComponent(guestNickname)}`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Accept": "*/*",
                },
                credentials: "include",
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || `요청 실패: ${response.status}`);
            }

            const data = await response.json();
            setStatus({
                tone: 'success',
                message: `"${data?.data ?? '인증번호'}"를 최후의 반론 Team42 공지 댓글로 남겨주세요.`
            });
        } catch (error) {
            console.error("Error adding guest:", error);
            setStatus({
                tone: 'danger',
                message: '이미 등록된 유저이거나 1계정 1회만 등록 가능합니다. 필요 시 문의해주세요.'
            });
        } finally {
            setIsSyncing(false);
        }
    };

    const userInitial = profile?.name?.[0] ?? 'G';

    return (
        <PageStack>
            <Card>
                <Pill>Google Login</Pill>
                <Headline>구글로 로그인하고 대현닷컴 멤버 기능을 사용하세요.</Headline>
                <Subtext>
                    로그인 시 전적 동기화와 게스트 등록 등 멤버 전용 기능을 바로 이용할 수 있어요.
                </Subtext>

                <ButtonRow>
                    {!isLoggedIn && (
                        <ActionButton onClick={handleLogin} disabled={isLoading}>
                            {isLoading ? '로그인 중...' : 'Google로 계속하기'}
                        </ActionButton>
                    )}
                    {isLoggedIn && (
                        <>
                            <ActionButton $variant="ghost" onClick={loadProfile} disabled={isLoading}>
                                상태 새로고침
                            </ActionButton>
                            <ActionButton onClick={handleLogout} $variant="primary" disabled={isLoading}>
                                로그아웃
                            </ActionButton>
                        </>
                    )}
                    <UserBadge>
                        <Avatar aria-hidden>{userInitial}</Avatar>
                        <div>
                            <strong>{profile?.name ?? '로그아웃 상태'}</strong>
                            <Helper>{profile?.email ?? 'Google 로그인 후 계정 정보를 확인하세요.'}</Helper>
                        </div>
                    </UserBadge>
                </ButtonRow>

                {status && (
                    <Status $tone={status.tone}>
                        {status.message}
                    </Status>
                )}
            </Card>

            <Card>
                <SectionTitle>계정 동기화</SectionTitle>
                <Helper>로그인 후 닉네임과 인증 코드를 입력해 계정을 연결하세요.</Helper>
                <TwoColumn>
                    <Field>
                        <Label htmlFor="nickname">닉네임</Label>
                        <Input
                            id="nickname"
                            value={nickname}
                            onChange={setNickname}
                            placeholder="닉네임을 입력하세요"
                            width="100%"
                        />
                    </Field>
                    <Field>
                        <Label htmlFor="userCode">스파이의 비밀문서 코드</Label>
                        <Input
                            id="userCode"
                            value={userCode}
                            onChange={setUserCode}
                            placeholder="코드를 입력하세요"
                            width="100%"
                        />
                    </Field>
                </TwoColumn>
                <ActionButton onClick={handleSync} disabled={!isLoggedIn || isSyncing}>
                    {isSyncing ? '동기화 중...' : '코드로 계정 동기화'}
                </ActionButton>
                <Helper>계정당 1회만 등록할 수 있습니다. 오류 시 문의해주세요.</Helper>

                <Divider />

                <SectionTitle>게스트 등록</SectionTitle>
                <Helper>Team42 공지 댓글로 인증번호를 남겨 게스트를 동기화합니다.</Helper>
                <Field>
                    <Label htmlFor="guestNickname">게스트 닉네임</Label>
                    <Input
                        id="guestNickname"
                        value={guestNickname}
                        onChange={setGuestNickname}
                        placeholder="예: 최후의 반론"
                        width="100%"
                    />
                </Field>
                <ActionButton onClick={handleGuestRegister} disabled={!isLoggedIn || isSyncing}>
                    {isSyncing ? '요청 중...' : '게스트 인증번호 받기'}
                </ActionButton>
            </Card>
        </PageStack>
    );
}

export default AuthSection;
