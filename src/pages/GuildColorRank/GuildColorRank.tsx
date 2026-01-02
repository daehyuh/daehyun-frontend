import React, {useCallback} from "react";
import styled from "styled-components";
import {CategoryTitle, Container, ContentLayout, Input, Layout, Text} from "@/components";
import Spinner from "@components/base/Spinner";
import Table from "@components/base/Table";
import CommonTableRow from "@/pages/ColorRank/components/ColorRankTableRow";
import {useRankSearch} from "@/hooks/useRankSearch";
import type {RankGuild} from "@/constant/RankGuild";

const Card = styled(Container)`
    width: 100%;
    background: ${({theme}) => theme.colors.surface};
    border: 1px solid ${({theme}) => theme.colors.border};
    border-radius: ${({theme}) => theme.radii.lg};
    padding: ${({theme}) => theme.spacing.lg};
    box-shadow: ${({theme}) => theme.shadows.soft};
    gap: ${({theme}) => theme.spacing.md};
`;

const ControlBar = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({theme}) => theme.spacing.sm};
`;

const NoteText = styled(Text)`
    color: ${({theme}) => theme.colors.textSecondary};
    font-size: ${({theme}) => theme.typography.sizes.sm};
`;

const MessageBox = styled(Container)<{ $tone?: "error" | "empty" }>`
    width: 100%;
    padding: ${({theme}) => theme.spacing.md};
    border-radius: ${({theme}) => theme.radii.md};
    border: 1px solid ${({theme, $tone}) => $tone === "error" ? theme.colors.danger : theme.colors.border};
    background: ${({theme, $tone}) => $tone === "error" ? "rgba(255,107,107,0.08)" : theme.colors.surfaceMuted};
`;

const EmptyStateText = styled(Text)`
    color: ${({theme}) => theme.colors.textSecondary};
    text-align: center;
    width: 100%;
`;

function GuildColorRank() {
    const fetcher = useCallback(() => import('@/apis/fetchGuildRank').then(m => m.default()), []);

    const {
        loading,
        error,
        search,
        filtered,
        handleInputChange,
    } = useRankSearch<RankGuild>({
        fetcher,
        filterKey: "guild_name",
    });

    const hasResult = filtered.length > 0;

    return (
        <Layout>
            <ContentLayout gap={'20px'}>
                <CategoryTitle
                    title="길드 검닉 랭킹"
                    description="길드 배경 색상 점수를 백엔드 API에서 실시간으로 불러옵니다."
                />

                <Card>
                    <ControlBar>
                        <Input
                            value={search}
                            placeholder="길드명 검색"
                            onChange={handleInputChange}
                            width="320px"
                        />
                    </ControlBar>

                    <NoteText>길드 배경 색상과 GP를 함께 확인해 보세요.</NoteText>
                    {error && (
                        <MessageBox $tone="error" role="alert">
                            <Text>{error}</Text>
                        </MessageBox>
                    )}

                    {loading ? (
                        <Spinner isLoading={loading}/>
                    ) : hasResult ? (
                        <Table
                            fullWidth
                            headers={["랭킹", "길드명", "배경 색상(HEX)", "점수"]}
                            columnWidths={["15%", "35%", "25%", "25%"]}
                            headerBackgroundColor="#1E202B"
                            headerBorderBottom="2px solid #aa0000"
                            headerColor="#F5F7FF"
                            oddBackgroundColor="#11121A"
                            evenBackgroundColor="#0B0D14"
                            border="1px solid #2E313E"
                            useRankColor
                        >
                            <tbody>
                            {filtered.map((item, index) => (
                                <CommonTableRow key={`${item.guild_name}-${index}`} type="guild" data={item}/>
                            ))}
                            </tbody>
                        </Table>
                    ) : (
                        <MessageBox $tone="empty">
                            <EmptyStateText>검색 결과가 없어요. 다른 길드를 입력해 보세요.</EmptyStateText>
                        </MessageBox>
                    )}
                </Card>
            </ContentLayout>
        </Layout>
    );
}

export default GuildColorRank;
