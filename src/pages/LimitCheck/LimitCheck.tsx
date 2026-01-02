import React, {useMemo, useState} from "react";
import styled from "styled-components";
import {CategoryTitle, Container, ContentLayout, Input, Layout, Text} from "@/components";
import Spinner from "@/components/base/Spinner";
import {fetchUserGameData} from "@/apis";

const Card = styled(Container)`
    width: 100%;
    background: ${({theme}) => theme.colors.surface};
    border: 1px solid ${({theme}) => theme.colors.border};
    border-radius: ${({theme}) => theme.radii.lg};
    padding: ${({theme}) => theme.spacing.lg};
    box-shadow: ${({theme}) => theme.shadows.soft};
    gap: ${({theme}) => theme.spacing.md};
`;

const SearchRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({theme}) => theme.spacing.sm};
    align-items: center;
`;

const ActionButton = styled.button`
    min-width: 140px;
    height: 48px;
    padding: 0 ${({theme}) => theme.spacing.lg};
    border-radius: ${({theme}) => theme.radii.md};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: linear-gradient(135deg, ${({theme}) => theme.colors.accent}, ${({theme}) => theme.colors.accentAlt});
    color: #fff;
    font-weight: ${({theme}) => theme.typography.weights.bold};
    font-size: ${({theme}) => theme.typography.sizes.base};
    cursor: pointer;
    transition: transform ${({theme}) => theme.transitions.default}, box-shadow ${({theme}) => theme.transitions.default}, opacity ${({theme}) => theme.transitions.default};
    box-shadow: ${({theme}) => theme.shadows.soft};

    &:hover {
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;

const HelperText = styled(Text)`
    color: ${({theme}) => theme.colors.textSecondary};
    font-size: ${({theme}) => theme.typography.sizes.sm};
`;

const MessageBox = styled(Container)<{ $tone?: "error" | "info" }>`
    width: 100%;
    padding: ${({theme}) => theme.spacing.md};
    border-radius: ${({theme}) => theme.radii.md};
    border: 1px solid ${({theme, $tone}) => $tone === "error" ? theme.colors.danger : theme.colors.border};
    background: ${({theme, $tone}) => $tone === "error" ? "rgba(255,107,107,0.08)" : theme.colors.surfaceMuted};
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${({theme}) => theme.spacing.md};
    width: 100%;

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
`;

const StatCard = styled(Container)`
    background: ${({theme}) => theme.colors.surfaceMuted};
    border: 1px solid ${({theme}) => theme.colors.border};
    border-radius: ${({theme}) => theme.radii.md};
    padding: ${({theme}) => theme.spacing.md};
    gap: ${({theme}) => theme.spacing.xs};
    align-items: flex-start;
`;

const StatLabel = styled(Text)`
    color: ${({theme}) => theme.colors.textSecondary};
    font-size: ${({theme}) => theme.typography.sizes.sm};
    font-weight: ${({theme}) => theme.typography.weights.semibold};
`;

const StatValue = styled(Text)`
    font-size: ${({theme}) => theme.typography.sizes.lg};
    font-weight: ${({theme}) => theme.typography.weights.bold};
    color: ${({theme}) => theme.colors.textPrimary};
`;

const SubValue = styled(Text)`
    color: ${({theme}) => theme.colors.textSecondary};
    font-size: ${({theme}) => theme.typography.sizes.sm};
`;

const StatusPill = styled.span<{ $positive: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing.xs};
    padding: 10px 14px;
    border-radius: ${({theme}) => theme.radii.pill};
    font-weight: ${({theme}) => theme.typography.weights.semibold};
    background: ${({$positive}) => $positive ? "rgba(91, 228, 155, 0.12)" : "rgba(255, 107, 107, 0.12)"};
    color: ${({theme, $positive}) => $positive ? theme.colors.success : theme.colors.danger};
    border: 1px solid ${({theme, $positive}) => $positive ? "rgba(91, 228, 155, 0.3)" : "rgba(255, 107, 107, 0.3)"};
`;

function LimitCheck() {
    const [nickname, setNickname] = useState<string>("");
    const [gameData, setGameData] = useState<UserGameData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const todayGames = useMemo(() => {
        if (!gameData) return 0;
        const numeric = gameData.today_games ?? Number(gameData.todaygames ?? 0);
        return Number.isFinite(numeric) ? Number(numeric) : 0;
    }, [gameData]);

    const todayWinDelta = useMemo(
        () => (gameData?.current_win_count ?? 0) - (gameData?.past_win_count ?? 0),
        [gameData]
    );
    const todayLoseDelta = useMemo(
        () => (gameData?.current_lose_count ?? 0) - (gameData?.past_lose_count ?? 0),
        [gameData]
    );

    const isLimit = gameData ? (gameData.isTodayLimit ?? todayGames >= 31) : false;

    const handleCheck = async () => {
        const trimmed = nickname.trim();
        if (trimmed.length === 0) {
            setError("닉네임을 입력해 주세요.");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const result = await fetchUserGameData(trimmed);
            setGameData(result);
        } catch (e) {
            console.error(e);
            setError("데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    const currentRecord = `${gameData?.current_win_count ?? 0}승 ${gameData?.current_lose_count ?? 0}패`;
    const pastRecord = `${gameData?.past_win_count ?? 0}승 ${gameData?.past_lose_count ?? 0}패`;
    const todayRecord = `${todayWinDelta}승 ${todayLoseDelta}패`;

    return (
        <Layout>
            <ContentLayout gap={'20px'}>
                <CategoryTitle
                    title={"획초 체크"}
                    description="오늘 플레이 기록을 백엔드에서 바로 확인해요."
                />

                <Card>
                    <SearchRow>
                        <Input
                            value={nickname}
                            onChange={(value) => setNickname(value)}
                            placeholder={"닉네임을 입력해 주세요"}
                            width="300px"
                        />
                        <ActionButton type="button" onClick={handleCheck} disabled={isLoading}>
                            {isLoading ? "조회 중..." : "획초 체크"}
                        </ActionButton>
                    </SearchRow>
                    <HelperText>31판 이상 플레이하면 획초로 표시됩니다.</HelperText>

                    {error && (
                        <MessageBox $tone="error" role="alert">
                            <Text>{error}</Text>
                        </MessageBox>
                    )}

                    {isLoading && <Spinner isLoading={isLoading}/>}

                    {!isLoading && (
                        <StatsGrid>
                            <StatCard>
                                <StatLabel>오늘 플레이</StatLabel>
                                <StatValue>{todayGames.toLocaleString()}판</StatValue>
                                <SubValue>오늘 전적: {todayRecord}</SubValue>
                            </StatCard>

                            <StatCard>
                                <StatLabel>현재 전적</StatLabel>
                                <StatValue>{currentRecord}</StatValue>
                                <SubValue>총 {(gameData?.current_win_count ?? 0) + (gameData?.current_lose_count ?? 0)}판</SubValue>
                            </StatCard>

                            <StatCard>
                                <StatLabel>어제 전적</StatLabel>
                                <StatValue>{pastRecord}</StatValue>
                                <SubValue>총 {(gameData?.past_win_count ?? 0) + (gameData?.past_lose_count ?? 0)}판</SubValue>
                            </StatCard>

                            <StatCard>
                                <StatLabel>획초 여부</StatLabel>
                                <StatusPill $positive={!isLimit}>
                                    {isLimit ? "획초" : "미획초"}
                                </StatusPill>
                                <SubValue>기준: 오늘 게임수 31판 이상</SubValue>
                            </StatCard>
                        </StatsGrid>
                    )}
                </Card>
            </ContentLayout>
        </Layout>
    );
}

export default LimitCheck;
