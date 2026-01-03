import {useCallback, useEffect, useMemo, useState} from "react";
import styled from "styled-components";
import Input from "./base/Input";
import {startGoogleLogin} from "@/utils/googleLogin";
import fetchStatsSummary, {StatsSummaryResponse} from "@/apis/fetchStatsSummary";

type StatusTone = 'info' | 'success' | 'danger';

type UserProfile = {
    name?: string;
    email?: string;
    avatarUrl?: string;
    role?: string;
};

type UserProfileResponse = {
    user: UserProfile;
    record?: {
        NICKNAME?: string;
        nickname?: string;
    };
    nicknameColor?: string | null;
    nicknameRank?: number | null;
    guildBackgroundColor?: string | null;
    guildBackgroundRank?: number | null;
    todayWinCount?: number | null;
    todayLoseCount?: number | null;
    todayTotalCount?: number | null;
    todayLimitExceeded?: boolean | null;
};

type UserInsight = {
    nickname: string;
    nicknameColor?: string;
    nicknameRank?: number;
    guildBackgroundColor?: string;
    guildBackgroundRank?: number;
    todayGames?: number;
    todayWinDelta?: number;
    todayLoseDelta?: number;
    isTodayLimit?: boolean;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE ?? 'https://api.xn--vk1b177d.com';

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

const GoogleButton = styled.button.attrs({type: 'button'})`
    display: inline-flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing.sm};
    padding: ${({theme}) => `${theme.spacing.xs} ${theme.spacing.md}`};
    border-radius: ${({theme}) => theme.radii.pill};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: #fff;
    color: #202124;
    font-weight: ${({theme}) => theme.typography.weights.semibold};
    text-decoration: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    min-width: 180px;
    justify-content: center;

    svg {
        width: 18px;
        height: 18px;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const GoogleLogo = () => (
    <svg viewBox="0 0 488 512" aria-hidden="true" focusable="false">
        <path fill="#EA4335"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.3 0 122 24.4 164.7 64.6l-66.8 64.2C310 104.5 281.3 92.7 248 92.7c-85.8 0-155.4 69.2-155.4 155.3 0 86 69.6 155.3 155.4 155.3 79.1 0 130-45.3 136-108.6H248v-87.4h240c2.2 12.7 4 24.9 4 43.5z"/>
    </svg>
);

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

const InsightCard = styled.div`
    display: grid;
    gap: ${({theme}) => theme.spacing.sm};
    padding: ${({theme}) => theme.spacing.lg};
    border-radius: ${({theme}) => theme.radii.lg};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surface};
    box-shadow: ${({theme}) => theme.shadows.soft};
`;

const InsightHeadline = styled.div`
    display: flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing.sm};
    font-size: ${({theme}) => theme.typography.sizes.lg};
    font-weight: ${({theme}) => theme.typography.weights.bold};
    color: ${({theme}) => theme.colors.textPrimary};
`;

const InsightGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: ${({theme}) => theme.spacing.md};
`;

const InsightItem = styled.div`
    display: grid;
    gap: ${({theme}) => theme.spacing.xs};
    padding: ${({theme}) => theme.spacing.md};
    border: 1px solid ${({theme}) => theme.colors.border};
    border-radius: ${({theme}) => theme.radii.md};
    background: ${({theme}) => theme.colors.surfaceMuted};
    box-shadow: ${({theme}) => theme.shadows.soft};
`;

const InsightLabel = styled.span`
    color: ${({theme}) => theme.colors.textSecondary};
    font-size: ${({theme}) => theme.typography.sizes.sm};
    font-weight: ${({theme}) => theme.typography.weights.semibold};
`;

const InsightValue = styled.span`
    color: ${({theme}) => theme.colors.textPrimary};
    font-weight: ${({theme}) => theme.typography.weights.semibold};
    font-size: ${({theme}) => theme.typography.sizes.lg};
`;

const ColorSwatch = styled.div<{ $color: string }>`
    display: inline-flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing.xs};
    padding: ${({theme}) => `${theme.spacing.xs} ${theme.spacing.sm}`};
    border-radius: ${({theme}) => theme.radii.md};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surfaceMuted};
`;

const Square = styled.span<{ $color: string }>`
    width: 20px;
    height: 20px;
    border-radius: ${({theme}) => theme.radii.xs};
    background: ${({$color}) => $color};
    border: 1px solid rgba(0,0,0,0.4);
`;

const StatBannerRow = styled.div`
    display: flex;
    justify-content: center;
`;

const StatBanner = styled.div`
    display: inline-flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing.sm};
    padding: ${({theme}) => `${theme.spacing.sm} ${theme.spacing.md}`};
    border-radius: ${({theme}) => theme.radii.pill};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surfaceMuted};
    color: ${({theme}) => theme.colors.textPrimary};
    font-weight: ${({theme}) => theme.typography.weights.semibold};
`;

const StatNumber = styled.span`
    color: ${({theme}) => theme.colors.accent};
    font-size: ${({theme}) => theme.typography.sizes.lg};
    font-weight: ${({theme}) => theme.typography.weights.bold};
`;

const StatsSection = styled.section`
    display: grid;
    gap: ${({theme}) => theme.spacing.sm};
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: ${({theme}) => theme.spacing.sm};
`;

const StatCard = styled.div`
    border-radius: ${({theme}) => theme.radii.md};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surface};
    padding: ${({theme}) => theme.spacing.md};
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing.xs};
    box-shadow: ${({theme}) => theme.shadows.soft};
`;

const StatLabel = styled.span`
    color: ${({theme}) => theme.colors.textSecondary};
    font-size: ${({theme}) => theme.typography.sizes.xs};
    letter-spacing: 0.04em;
    text-transform: uppercase;
`;

const StatValue = styled.span`
    color: ${({theme}) => theme.colors.textPrimary};
    font-size: ${({theme}) => theme.typography.sizes.xl};
    font-weight: ${({theme}) => theme.typography.weights.bold};
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
    const [guestInstruction, setGuestInstruction] = useState<string | null>(null);
    const [stats, setStats] = useState<StatsSummaryResponse | null>(null);
    const [isStatsLoading, setIsStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState<string | null>(null);
    const [hasToken, setHasToken] = useState<boolean>(() => Boolean(getAccessToken()));
    const [insight, setInsight] = useState<UserInsight | null>(null);
    const [insightLoading, setInsightLoading] = useState(false);
    const [insightError, setInsightError] = useState<string | null>(null);

    const isLoggedIn = useMemo(() => Boolean(profile) || hasToken, [profile, hasToken]);

    const loadStatsSummary = useCallback(async () => {
        setIsStatsLoading(true);
        setStatsError(null);
        try {
            const summary = await fetchStatsSummary();
            setStats(summary);
        } catch (error) {
            console.error("Error fetching stats summary:", error);
            setStats(null);
            setStatsError('총 이용자 수를 불러오지 못했습니다.');
        } finally {
            setIsStatsLoading(false);
        }
    }, []);

    const loadProfile = useCallback(async () => {
        const accessToken = getAccessToken();
        setHasToken(Boolean(accessToken));
        if (!accessToken) {
            setProfile(null);
            setInsight(null);
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

            const data = await response.json() as UserProfileResponse;
            setProfile(data.user);
            setStatus({tone: 'success', message: `${data.user?.name ?? '로그인한'} 사용자로 연결되었습니다.`});

            setInsightLoading(true);
            setInsightError(null);
            const nicknameVal = data.record?.NICKNAME ?? data.record?.nickname ?? data.user?.name ?? "";
            setInsight({
                nickname: nicknameVal,
                nicknameColor: data.nicknameColor ? `#${data.nicknameColor}` : undefined,
                nicknameRank: data.nicknameRank ?? undefined,
                guildBackgroundColor: data.guildBackgroundColor ? `#${data.guildBackgroundColor}` : undefined,
                guildBackgroundRank: data.guildBackgroundRank ?? undefined,
                todayGames: data.todayTotalCount ?? undefined,
                todayWinDelta: data.todayWinCount ?? undefined,
                todayLoseDelta: data.todayLoseCount ?? undefined,
                isTodayLimit: data.todayLimitExceeded ?? undefined,
            });
        } catch (error) {
            console.error("Error fetching user data:", error);
            setProfile(null);
            setInsight(null);
            setStatus({tone: 'danger', message: '로그인이 만료되었어요. 다시 로그인해주세요.'});
            setInsightError("내 정보 요약을 불러오지 못했습니다.");
        } finally {
            setIsLoading(false);
            setInsightLoading(false);
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
        loadStatsSummary();
    }, [exchangeCode, loadProfile, loadStatsSummary]);

    const handleLogin = () => startGoogleLogin();

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

        setGuestInstruction(null);
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
            const verificationCode = data?.data ?? 'data 안의 인증번호 4글자';
            setStatus({
                tone: 'success',
                message: `인게임 최후의반론 Team42 공지글 댓글에 "${verificationCode}" 를 입력해주세요.`
            });
            setGuestInstruction(`인게임 최후의반론 Team42 공지글 댓글에 "${verificationCode}" 를 입력해주세요.`);
        } catch (error) {
            console.error("Error adding guest:", error);
            setStatus({
                tone: 'danger',
                message: '이미 등록된 유저이거나 1계정 1회만 등록 가능합니다. 필요 시 문의해주세요.'
            });
            setGuestInstruction(null);
        } finally {
            setIsSyncing(false);
        }
    };

    const totalUserCount = typeof stats?.totalUserCount === 'number'
        ? stats.totalUserCount.toLocaleString('ko-KR')
        : null;
    const bannerFallback = isStatsLoading
        ? '대현닷컴 이용자 수를 불러오는 중...'
        : statsError
            ? '대현닷컴을 이용해주셔서 감사합니다.'
            : null;
    const formatCount = (value?: number | null) => typeof value === 'number'
        ? value.toLocaleString('ko-KR')
        : '-';

    return (
        <PageStack>
            {(totalUserCount || bannerFallback) && (
                <StatBannerRow>
                    <StatBanner aria-live="polite">
                        {totalUserCount ? (
                            <>
                                <StatNumber>{totalUserCount}</StatNumber>
                                <span>명이 선택한 마피아 서드파티 서비스 - 대현.com</span>
                            </>
                        ) : (
                            <span>{bannerFallback}</span>
                        )}
                    </StatBanner>
                </StatBannerRow>
            )}
            {(stats || isStatsLoading || statsError) && (
                <StatsSection aria-live="polite">
                    <StatsGrid>
                        <StatCard>
                            <StatLabel>오늘 가입</StatLabel>
                            <StatValue>{formatCount(stats?.todayUserCount)}명</StatValue>
                        </StatCard>
                        <StatCard>
                            <StatLabel>오늘 추가된 계정</StatLabel>
                            <StatValue>{formatCount(stats?.todayAccountCount)}개</StatValue>
                        </StatCard>
                        <StatCard>
                            <StatLabel>전체 사용자</StatLabel>
                            <StatValue>{formatCount(stats?.totalUserCount)}명</StatValue>
                        </StatCard>
                    </StatsGrid>
                    {statsError && <Helper>{statsError}</Helper>}
                </StatsSection>
            )}
            <Card>
                <Headline>대현닷컴 로그인</Headline>
                <Subtext>
                    로그인하면 검닉/길드 배경 랭킹, 획초 체크, 실시간 동접 등 멤버 기능이 활성화됩니다.
                </Subtext>

                {!isLoggedIn && (
                    <ButtonRow>
                        <GoogleButton onClick={handleLogin} disabled={isLoading}>
                            <GoogleLogo/>
                            {isLoading ? '로그인 중...' : 'Google로 계속하기'}
                        </GoogleButton>
                    </ButtonRow>
                )}

                {status && (
                    <Status $tone={status.tone}>
                        {status.message}
                    </Status>
                )}
            </Card>

            {isLoggedIn && (
                <InsightCard>
                    <InsightHeadline>
                        내 닉네임: {insight?.nickname ?? ''}
                    </InsightHeadline>
                    <SectionTitle>내 정보 요약</SectionTitle>
                    <Helper>검닉/길드 랭킹과 오늘 경기 기록을 한눈에 확인하세요.</Helper>
                    {insightLoading && <Helper>불러오는 중...</Helper>}
                    {insightError && <Status $tone="danger">{insightError}</Status>}
                    {insight ? (
                        <InsightGrid>
                            <InsightItem>
                                <InsightLabel>닉네임 랭킹</InsightLabel>
                                <InsightValue>{insight.nicknameRank ? `${insight.nicknameRank}위` : '정보 없음'}</InsightValue>
                                {insight.nicknameColor && (
                                    <ColorSwatch $color={insight.nicknameColor}>
                                        <Square $color={insight.nicknameColor} aria-hidden />
                                        <span>닉네임 색상: {insight.nicknameColor}</span>
                                    </ColorSwatch>
                                )}
                            </InsightItem>
                            <InsightItem>
                                <InsightLabel>길드 배경 랭킹</InsightLabel>
                                <InsightValue>{insight.guildBackgroundRank ? `${insight.guildBackgroundRank}위` : '정보 없음'}</InsightValue>
                                {insight.guildBackgroundColor && (
                                    <ColorSwatch $color={insight.guildBackgroundColor}>
                                        <Square $color={insight.guildBackgroundColor} aria-hidden />
                                        <span>배경 색상: {insight.guildBackgroundColor}</span>
                                    </ColorSwatch>
                                )}
                            </InsightItem>
                            <InsightItem>
                                <InsightLabel>오늘 게임 횟수</InsightLabel>
                                <InsightValue>{insight.todayGames ?? '정보 없음'}</InsightValue>
                                <Helper>
                                    승 {insight.todayWinDelta ?? 0}회
                                    <br/>
                                    패 {insight.todayLoseDelta ?? 0}회
                                </Helper>
                            </InsightItem>
                            <InsightItem>
                                <InsightLabel>획초 여부</InsightLabel>
                                <InsightValue>{insight.isTodayLimit ? '획초' : '미획초'}</InsightValue>
                            </InsightItem>
                        </InsightGrid>
                    ) : (
                        <Helper>내 정보 데이터를 불러올 수 없습니다. 상태 새로고침을 눌러주세요.</Helper>
                    )}
                </InsightCard>
            )}

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
                {guestInstruction && (
                    <Status $tone="success">
                        {guestInstruction}
                    </Status>
                )}
            </Card>
        </PageStack>
    );
}

export default AuthSection;
