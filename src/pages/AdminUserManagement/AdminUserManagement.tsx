import {FormEvent, useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';
import {
    AdminApiError,
    AdminAccount,
    AdminUser,
    deleteAdminAccountData,
    fetchAdminUsers,
    unlinkAdminAccount,
} from '@/apis/adminUsers';

const Page = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing.lg};
`;

const Header = styled.header`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: ${({theme}) => theme.spacing.md};
    flex-wrap: wrap;
`;

const Eyebrow = styled.span`
    color: ${({theme}) => theme.colors.accentSoft};
    font-size: ${({theme}) => theme.typography.sizes.xs};
    font-weight: ${({theme}) => theme.typography.weights.bold};
    letter-spacing: 0.1em;
    text-transform: uppercase;
`;

const Title = styled.h1`
    margin: ${({theme}) => `${theme.spacing.xs} 0 0`};
    color: ${({theme}) => theme.colors.textPrimary};
    font-size: ${({theme}) => theme.typography.sizes.title};
`;

const Count = styled.span`
    color: ${({theme}) => theme.colors.textSecondary};
    font-size: ${({theme}) => theme.typography.sizes.sm};
`;

const Toolbar = styled.form`
    display: flex;
    gap: ${({theme}) => theme.spacing.sm};
    align-items: center;
    flex-wrap: wrap;
`;

const SearchInput = styled.input`
    flex: 1 1 280px;
    min-width: 0;
    padding: 12px 14px;
    border: 1px solid ${({theme}) => theme.colors.border};
    border-radius: ${({theme}) => theme.radii.sm};
    background: ${({theme}) => theme.colors.surfaceMuted};
    color: ${({theme}) => theme.colors.textPrimary};
    font: inherit;

    &:focus {
        outline: 2px solid ${({theme}) => theme.colors.accent};
        outline-offset: 1px;
    }
`;

const ActionButton = styled.button<{ $danger?: boolean; $muted?: boolean }>`
    border: 1px solid ${({theme, $danger}) => $danger ? 'rgba(255, 107, 107, 0.45)' : theme.colors.border};
    border-radius: ${({theme}) => theme.radii.sm};
    padding: 10px 14px;
    background: ${({theme, $danger, $muted}) => $danger
        ? 'rgba(255, 107, 107, 0.12)'
        : $muted ? theme.colors.surfaceMuted : theme.colors.accent};
    color: ${({theme, $danger}) => $danger ? theme.colors.danger : theme.colors.textPrimary};
    font: inherit;
    font-size: ${({theme}) => theme.typography.sizes.sm};
    font-weight: ${({theme}) => theme.typography.weights.semibold};
    cursor: pointer;

    &:hover:not(:disabled) {
        filter: brightness(1.12);
    }

    &:disabled {
        cursor: wait;
        opacity: 0.55;
    }
`;

const Status = styled.div<{ $danger?: boolean }>`
    padding: ${({theme}) => theme.spacing.md};
    border: 1px solid ${({theme, $danger}) => $danger ? 'rgba(255, 107, 107, 0.35)' : theme.colors.border};
    border-radius: ${({theme}) => theme.radii.sm};
    background: ${({theme, $danger}) => $danger ? 'rgba(255, 107, 107, 0.08)' : theme.colors.surfaceMuted};
    color: ${({theme, $danger}) => $danger ? theme.colors.danger : theme.colors.textSecondary};
`;

const UserList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing.md};
`;

const UserSection = styled.section`
    border: 1px solid ${({theme}) => theme.colors.border};
    border-radius: ${({theme}) => theme.radii.md};
    background: ${({theme}) => theme.colors.surfaceMuted};
    overflow: hidden;
`;

const UserHeader = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: ${({theme}) => theme.spacing.md};
    padding: ${({theme}) => theme.spacing.md};
    border-bottom: 1px solid ${({theme}) => theme.colors.borderMuted};
`;

const UserIdentity = styled.div`
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const UserName = styled.strong`
    color: ${({theme}) => theme.colors.textPrimary};
    overflow-wrap: anywhere;
`;

const UserMeta = styled.span`
    color: ${({theme}) => theme.colors.textSecondary};
    font-size: ${({theme}) => theme.typography.sizes.sm};
    overflow-wrap: anywhere;
`;

const RoleBadge = styled.span`
    align-self: start;
    padding: 5px 9px;
    border: 1px solid rgba(255, 195, 113, 0.35);
    border-radius: ${({theme}) => theme.radii.pill};
    color: ${({theme}) => theme.colors.accentAlt};
    font-size: ${({theme}) => theme.typography.sizes.xs};
    font-weight: ${({theme}) => theme.typography.weights.bold};
`;

const AccountList = styled.div`
    display: flex;
    flex-direction: column;
`;

const AccountRow = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: ${({theme}) => theme.spacing.md};
    align-items: center;
    padding: ${({theme}) => theme.spacing.md};
    border-bottom: 1px solid ${({theme}) => theme.colors.borderMuted};

    &:last-child {
        border-bottom: none;
    }

    @media (max-width: ${({theme}) => theme.breakpoints.md}px) {
        grid-template-columns: 1fr;
    }
`;

const AccountInfo = styled.div`
    min-width: 0;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: ${({theme}) => theme.spacing.sm};

    @media (max-width: ${({theme}) => theme.breakpoints.md}px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
`;

const DataPoint = styled.div`
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
`;

const DataLabel = styled.span`
    color: ${({theme}) => theme.colors.textSubtle};
    font-size: ${({theme}) => theme.typography.sizes.xs};
`;

const DataValue = styled.span`
    color: ${({theme}) => theme.colors.textPrimary};
    font-size: ${({theme}) => theme.typography.sizes.sm};
    overflow-wrap: anywhere;
`;

const AccountActions = styled.div`
    display: flex;
    gap: ${({theme}) => theme.spacing.xs};
    justify-content: flex-end;
    flex-wrap: wrap;
`;

const EmptyAccounts = styled.div`
    padding: ${({theme}) => theme.spacing.md};
    color: ${({theme}) => theme.colors.textSubtle};
    font-size: ${({theme}) => theme.typography.sizes.sm};
`;

const Pagination = styled.nav`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({theme}) => theme.spacing.md};
`;

const PageIndicator = styled.span`
    color: ${({theme}) => theme.colors.textSecondary};
    font-size: ${({theme}) => theme.typography.sizes.sm};
`;

const formatDate = (value: string | null) => value
    ? new Date(value).toLocaleString('ko-KR', {dateStyle: 'medium', timeStyle: 'short'})
    : '-';

const formatNumber = (value: number | null) => value === null ? '-' : value.toLocaleString('ko-KR');

function AccountDetails({account}: { account: AdminAccount }) {
    return (
        <AccountInfo>
            <DataPoint>
                <DataLabel>게임 계정 ID</DataLabel>
                <DataValue>{account.accountId}</DataValue>
            </DataPoint>
            <DataPoint>
                <DataLabel>최근 닉네임</DataLabel>
                <DataValue>{account.nickname ?? '-'}</DataValue>
            </DataPoint>
            <DataPoint>
                <DataLabel>랭크포인트</DataLabel>
                <DataValue>{formatNumber(account.rankPoint)}</DataValue>
            </DataPoint>
            <DataPoint>
                <DataLabel>데이터 / 동기화</DataLabel>
                <DataValue>{account.recordCount.toLocaleString('ko-KR')}건 · {account.syncStatus ?? '상태 없음'}</DataValue>
            </DataPoint>
            <DataPoint>
                <DataLabel>최근 전적</DataLabel>
                <DataValue>{account.latestRecordDate ?? '-'}</DataValue>
            </DataPoint>
            <DataPoint>
                <DataLabel>스냅샷 / 기준값</DataLabel>
                <DataValue>{account.snapshotCount} / {account.dailyBaselineCount}</DataValue>
            </DataPoint>
            <DataPoint>
                <DataLabel>최근 동기화</DataLabel>
                <DataValue>{formatDate(account.lastSyncedAt)}</DataValue>
            </DataPoint>
        </AccountInfo>
    );
}

function AdminUserManagement() {
    const [query, setQuery] = useState('');
    const [submittedQuery, setSubmittedQuery] = useState('');
    const [page, setPage] = useState(0);
    const [result, setResult] = useState<{ content: AdminUser[]; totalElements: number; totalPages: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busyKey, setBusyKey] = useState<string | null>(null);
    const size = 20;

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAdminUsers({page, size, query: submittedQuery});
            setResult(data);
        } catch (caught) {
            if (caught instanceof AdminApiError && caught.status === 403) {
                setError('관리자 권한이 있는 계정만 접근할 수 있습니다.');
            } else if (caught instanceof AdminApiError && caught.status === 401) {
                setError('로그인이 필요합니다.');
            } else {
                setError(caught instanceof Error ? caught.message : '유저 목록을 불러오지 못했습니다.');
            }
        } finally {
            setLoading(false);
        }
    }, [page, submittedQuery]);

    useEffect(() => {
        void loadUsers();
    }, [loadUsers]);

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPage(0);
        setSubmittedQuery(query.trim());
    };

    const handleUnlink = async (user: AdminUser, account: AdminAccount) => {
        if (!window.confirm(`${account.nickname ?? account.accountId} 계정의 연동만 해제할까요? 기존 전적 데이터는 보존됩니다.`)) return;
        const key = `${user.id}-${account.id}-unlink`;
        setBusyKey(key);
        try {
            await unlinkAdminAccount(user.id, account.id);
            await loadUsers();
        } catch (caught) {
            window.alert(caught instanceof Error ? caught.message : '연동 해제에 실패했습니다.');
        } finally {
            setBusyKey(null);
        }
    };

    const handleDeleteData = async (user: AdminUser, account: AdminAccount) => {
        if (!window.confirm(`${account.nickname ?? account.accountId} 계정의 연동과 전적·스냅샷·일일 기준값을 모두 삭제할까요? 이 작업은 되돌릴 수 없습니다.`)) return;
        const key = `${user.id}-${account.id}-delete`;
        setBusyKey(key);
        try {
            const action = await deleteAdminAccountData(user.id, account.id);
            window.alert(`삭제 완료: 전적 ${action.deletedRecords}건, 스냅샷 ${action.deletedSnapshots}건, 기준값 ${action.deletedDailyBaselines}건`);
            await loadUsers();
        } catch (caught) {
            window.alert(caught instanceof Error ? caught.message : '계정 데이터 삭제에 실패했습니다.');
        } finally {
            setBusyKey(null);
        }
    };

    return (
        <Page>
            <Header>
                <div>
                    <Eyebrow>Admin Console</Eyebrow>
                    <Title>유저 관리</Title>
                    <Count>{result?.totalElements.toLocaleString('ko-KR') ?? '-'}명</Count>
                </div>
                <ActionButton type="button" $muted onClick={() => void loadUsers()} disabled={loading}>새로고침</ActionButton>
            </Header>

            <Toolbar onSubmit={handleSearch}>
                <SearchInput
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="이메일, 이름, 게임 닉네임, provider ID 검색"
                    aria-label="유저 검색"
                />
                <ActionButton type="submit">검색</ActionButton>
            </Toolbar>

            {loading && <Status>유저 목록을 불러오는 중입니다.</Status>}
            {error && <Status $danger>{error}</Status>}

            {!loading && !error && result && (
                <>
                    {result.content.length === 0 ? <Status>검색 결과가 없습니다.</Status> : (
                        <UserList>
                            {result.content.map((user) => (
                                <UserSection key={user.id}>
                                    <UserHeader>
                                        <UserIdentity>
                                            <UserName>{user.name || '(이름 없음)'}</UserName>
                                            <UserMeta>{user.email || '(이메일 없음)'} · user id {user.id}</UserMeta>
                                            <UserMeta>{user.provider || '-'} · 가입 {formatDate(user.createdAt)}</UserMeta>
                                        </UserIdentity>
                                        <RoleBadge>{user.role || 'ROLE_UNKNOWN'}</RoleBadge>
                                    </UserHeader>
                                    {user.accounts.length === 0 ? <EmptyAccounts>연동된 게임 계정이 없습니다.</EmptyAccounts> : (
                                        <AccountList>
                                            {user.accounts.map((account) => (
                                                <AccountRow key={account.id}>
                                                    <AccountDetails account={account}/>
                                                    <AccountActions>
                                                        <ActionButton type="button" $muted onClick={() => void handleUnlink(user, account)} disabled={busyKey !== null}>
                                                            {busyKey === `${user.id}-${account.id}-unlink` ? '처리 중' : '연동 해제'}
                                                        </ActionButton>
                                                        <ActionButton type="button" $danger onClick={() => void handleDeleteData(user, account)} disabled={busyKey !== null}>
                                                            {busyKey === `${user.id}-${account.id}-delete` ? '삭제 중' : '데이터 삭제'}
                                                        </ActionButton>
                                                    </AccountActions>
                                                </AccountRow>
                                            ))}
                                        </AccountList>
                                    )}
                                </UserSection>
                            ))}
                        </UserList>
                    )}
                    {result.totalPages > 1 && (
                        <Pagination aria-label="유저 목록 페이지 이동">
                            <ActionButton type="button" $muted onClick={() => setPage((current) => current - 1)} disabled={page === 0 || loading}>이전</ActionButton>
                            <PageIndicator>{page + 1} / {result.totalPages}</PageIndicator>
                            <ActionButton type="button" $muted onClick={() => setPage((current) => current + 1)} disabled={page + 1 >= result.totalPages || loading}>다음</ActionButton>
                        </Pagination>
                    )}
                </>
            )}
        </Page>
    );
}

export default AdminUserManagement;
