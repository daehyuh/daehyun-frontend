import React from "react";
import styled from "styled-components";
import {CategoryTitle, Container, ContentLayout, Input, Layout, Text} from "@/components";
import Spinner from "@components/base/Spinner";
import Table from "@components/base/Table";
import CommonTableRow from "@/pages/ColorRank/components/ColorRankTableRow";
import {useRankSearch} from "@/hooks/useRankSearch";
import RankUser from "@/constant/RankUser";
import fetchRank from "@/apis/fetchRank";

const Card = styled(Container)`
    width: 100%;
    background: ${({theme}) => theme.colors.surface};
    border: 1px solid ${({theme}) => theme.colors.border};
    border-radius: ${({theme}) => theme.radii.lg};
    padding: ${({theme}) => theme.spacing.lg};
    box-shadow: ${({theme}) => theme.shadows.soft};
    gap: ${({theme}) => theme.spacing.md};
`;

const ControlBar = styled.form`
    display: flex;
    flex-wrap: wrap;
    gap: ${({theme}) => theme.spacing.sm};
    align-items: center;
`;

const NoteText = styled(Text)`
    color: ${({theme}) => theme.colors.textSecondary};
    font-size: ${({theme}) => theme.typography.sizes.sm};
`;

const ActionButton = styled.button<{ $secondary?: boolean }>`
    border: 1px solid ${({theme, $secondary}) => $secondary ? theme.colors.border : theme.colors.accent};
    background: ${({theme, $secondary}) => $secondary ? theme.colors.surfaceMuted : theme.colors.accent};
    color: ${({theme, $secondary}) => $secondary ? theme.colors.textPrimary : '#081018'};
    border-radius: ${({theme}) => theme.radii.md};
    padding: ${({theme}) => `${theme.spacing.sm} ${theme.spacing.md}`};
    min-height: 44px;
    font-size: ${({theme}) => theme.typography.sizes.sm};
    font-weight: ${({theme}) => theme.typography.weights.semibold};
    cursor: pointer;

    &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }
`;

const PaginationBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: ${({theme}) => theme.spacing.sm};
`;

const PaginationActions = styled.div`
    display: flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing.sm};
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

function ColorRank() {
    const {
        loading,
        error,
        data,
        searchInput,
        query,
        pagination,
        handleInputChange,
        applySearch,
        clearSearch,
        goToPreviousPage,
        goToNextPage,
    } = useRankSearch<RankUser>({
        fetcher: fetchRank,
        filterKey: "nickname",
    });

    const hasResult = data.length > 0;
    const pageStart = pagination.totalElements === 0 ? 0 : pagination.page * pagination.size + 1;
    const pageEnd = pagination.page * pagination.size + data.length;

    return (
        <Layout>
            <ContentLayout gap={'20px'}>
                <CategoryTitle
                    title="검닉 랭킹"
                    description="대현닷컴 연동 유저의 최신 검닉 점수를 스냅샷 기준으로 보여줘요."
                />

                <Card>
                    <ControlBar onSubmit={(e) => {
                        e.preventDefault();
                        applySearch();
                    }}>
                        <Input
                            value={searchInput}
                            placeholder="닉네임 검색"
                            onChange={handleInputChange}
                            width="320px"
                        />
                        <ActionButton type="submit">검색</ActionButton>
                        <ActionButton type="button" $secondary onClick={clearSearch}>
                            초기화
                        </ActionButton>
                    </ControlBar>

                    <NoteText>검닉으로 인정되면 점수 앞에 ✅가 붙어요.</NoteText>
                    <NoteText>랭킹은 50명 단위로 조회하고, 검색은 백엔드 스냅샷에서 처리합니다.</NoteText>
                    {error && (
                        <MessageBox $tone="error" role="alert">
                            <Text>{error}</Text>
                        </MessageBox>
                    )}

                    {loading ? (
                        <Spinner isLoading={loading}/>
                    ) : (
                        <>
                            <PaginationBar>
                                <NoteText>
                                    {query.length > 0 ? `'${query}' 검색 결과` : '전체 랭킹'} {pagination.totalElements.toLocaleString()}건
                                    {pageEnd > 0 ? ` · ${pageStart}-${pageEnd}번째 항목` : ''}
                                </NoteText>
                                <PaginationActions>
                                    <ActionButton
                                        type="button"
                                        $secondary
                                        onClick={goToPreviousPage}
                                        disabled={!pagination.hasPrevious}
                                    >
                                        이전
                                    </ActionButton>
                                    <NoteText>
                                        페이지 {pagination.totalPages === 0 ? 0 : pagination.page + 1} / {pagination.totalPages}
                                    </NoteText>
                                    <ActionButton
                                        type="button"
                                        $secondary
                                        onClick={goToNextPage}
                                        disabled={!pagination.hasNext}
                                    >
                                        다음
                                    </ActionButton>
                                </PaginationActions>
                            </PaginationBar>

                            {hasResult ? (
                                <Table
                                    fullWidth
                                    headers={["랭킹", "닉네임", "배경 색상(HEX)", "점수"]}
                                    columnWidths={["15%", "35%", "25%", "25%"]}
                                    headerBackgroundColor="#1E202B"
                                    headerBorderBottom="2px solid #aa0000"
                                    headerColor="#F5F7FF"
                                    oddBackgroundColor="#11121A"
                                    evenBackgroundColor="#0B0D14"
                                    border="1px solid #2E313E"
                                >
                                    <tbody>
                                    {data.map((item) => (
                                        <CommonTableRow key={`${item.nickname}-${item.rank ?? 0}`} type="user" data={item}/>
                                    ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <MessageBox $tone="empty">
                                    <EmptyStateText>검색 결과가 없어요. 다른 닉네임을 입력해 보세요.</EmptyStateText>
                                </MessageBox>
                            )}
                        </>
                    )}
                </Card>
            </ContentLayout>
        </Layout>
    );
}

export default ColorRank;
