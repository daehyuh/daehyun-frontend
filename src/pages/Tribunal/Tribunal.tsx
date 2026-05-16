import React, {useCallback, useDeferredValue, useEffect, useMemo, useState} from "react";
import {useSearchParams} from "react-router-dom";
import styled, {css} from "styled-components";
import {CategoryTitle, ContentLayout, Input, Layout} from "@/components";
import Spinner from "@/components/base/Spinner";
import {startGoogleLogin} from "@/utils/googleLogin";
import {
    createTribunalCase,
    createTribunalComment,
    deleteTribunalComment,
    getTribunalCaseDetail,
    listTribunalCases,
    toggleTribunalCommentLike,
    updateTribunalComment,
    voteTribunalCase
} from "@/apis/tribunal";
import type {
    TribunalCaseDetail,
    TribunalCaseSummary,
    TribunalComment,
    TribunalVoteChoice
} from "@/apis/tribunalTypes";

type StatusTone = 'info' | 'success' | 'danger';

type StatusMessage = {
    tone: StatusTone;
    message: string;
};

type CaseFormState = {
    replayUrl: string;
    nickname: string;
    pick: string;
    description: string;
    cafeLinks: string[];
};

const defaultCaseForm = (): CaseFormState => ({
    replayUrl: '',
    nickname: '',
    pick: '',
    description: '',
    cafeLinks: [''],
});

const readAccessToken = (): string | null => {
    if (typeof document === 'undefined') return null;
    return document.cookie
        .split(';')
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith('accessToken='))
        ?.split('=')[1] ?? null;
};

const formatDateTime = (value: string | null): string => {
    if (!value) return '시간 정보 없음';

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(parsed);
};

const replayUrlPattern = /^https?:\/\/mafia42\.com\/history\/kr\/[A-Za-z0-9]+/i;

const PageStack = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing.xl};
    width: 100%;
`;

const HeroCard = styled.section`
    position: relative;
    overflow: hidden;
    border-radius: ${({theme}) => theme.radii.lg};
    border: 1px solid ${({theme}) => theme.colors.border};
    background:
        radial-gradient(circle at top right, rgba(255, 195, 113, 0.18), transparent 34%),
        radial-gradient(circle at left top, rgba(255, 95, 109, 0.2), transparent 30%),
        ${({theme}) => theme.colors.surfaceElevated};
    padding: clamp(24px, 3vw, 36px);
    box-shadow: ${({theme}) => theme.shadows.soft};
    display: grid;
    gap: ${({theme}) => theme.spacing.lg};
`;

const HeroEyebrow = styled.span`
    display: inline-flex;
    width: fit-content;
    align-items: center;
    padding: ${({theme}) => `${theme.spacing.xs} ${theme.spacing.sm}`};
    border-radius: ${({theme}) => theme.radii.pill};
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.04);
    color: ${({theme}) => theme.colors.textSecondary};
    font-size: ${({theme}) => theme.typography.sizes.xs};
    letter-spacing: 0.08em;
    text-transform: uppercase;
`;

const HeroTitle = styled.h3`
    margin: 0;
    font-size: clamp(1.6rem, 3vw, 2.4rem);
    line-height: ${({theme}) => theme.typography.lineHeights.tight};
    color: ${({theme}) => theme.colors.textPrimary};
`;

const HeroDescription = styled.p`
    margin: 0;
    max-width: 860px;
    color: ${({theme}) => theme.colors.textSecondary};
    line-height: ${({theme}) => theme.typography.lineHeights.relaxed};
`;

const HeroStats = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: ${({theme}) => theme.spacing.md};
`;

const StatCard = styled.div`
    display: grid;
    gap: ${({theme}) => theme.spacing.xs};
    padding: ${({theme}) => theme.spacing.md};
    border-radius: ${({theme}) => theme.radii.md};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: rgba(255, 255, 255, 0.03);
`;

const StatLabel = styled.span`
    color: ${({theme}) => theme.colors.textSecondary};
    font-size: ${({theme}) => theme.typography.sizes.sm};
`;

const StatValue = styled.strong`
    color: ${({theme}) => theme.colors.textPrimary};
    font-size: clamp(1.2rem, 2vw, 1.8rem);
`;

const ActionRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({theme}) => theme.spacing.sm};
`;

const buttonBase = css`
    border: 1px solid ${({theme}) => theme.colors.border};
    border-radius: ${({theme}) => theme.radii.pill};
    padding: ${({theme}) => `${theme.spacing.sm} ${theme.spacing.lg}`};
    font-size: ${({theme}) => theme.typography.sizes.sm};
    font-weight: ${({theme}) => theme.typography.weights.semibold};
    cursor: pointer;
    transition: transform ${({theme}) => theme.transitions.snappy}, opacity ${({theme}) => theme.transitions.default},
    background ${({theme}) => theme.transitions.default}, border-color ${({theme}) => theme.transitions.default};

    &:hover {
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        transform: none;
    }
`;

const PrimaryButton = styled.button.attrs({type: 'button'})`
    ${buttonBase};
    background: linear-gradient(135deg, ${({theme}) => theme.colors.accent}, ${({theme}) => theme.colors.accentAlt});
    color: #091019;
    border-color: transparent;
`;

const SecondaryButton = styled.button.attrs({type: 'button'})`
    ${buttonBase};
    background: ${({theme}) => theme.colors.surfaceMuted};
    color: ${({theme}) => theme.colors.textPrimary};
`;

const GhostButton = styled.button.attrs({type: 'button'})`
    ${buttonBase};
    background: transparent;
    color: ${({theme}) => theme.colors.textSecondary};
`;

const StatusBox = styled.div<{ $tone: StatusTone }>`
    border-radius: ${({theme}) => theme.radii.md};
    padding: ${({theme}) => `${theme.spacing.sm} ${theme.spacing.md}`};
    border: 1px solid ${({theme, $tone}) => $tone === 'danger'
            ? 'rgba(255, 107, 107, 0.42)'
            : $tone === 'success'
                ? 'rgba(91, 228, 155, 0.42)'
                : theme.colors.border};
    background: ${({theme, $tone}) => $tone === 'danger'
            ? 'rgba(255, 107, 107, 0.08)'
            : $tone === 'success'
                ? 'rgba(91, 228, 155, 0.08)'
                : theme.colors.surfaceMuted};
    color: ${({theme}) => theme.colors.textPrimary};
`;

const TwoColumnGrid = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 420px) minmax(0, 1fr);
    gap: ${({theme}) => theme.spacing.xl};
    align-items: start;

    @media (max-width: ${({theme}) => theme.breakpoints.lg}px) {
        grid-template-columns: 1fr;
    }
`;

const Panel = styled.section`
    display: grid;
    gap: ${({theme}) => theme.spacing.md};
    border-radius: ${({theme}) => theme.radii.lg};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surface};
    padding: clamp(20px, 2.5vw, 28px);
    box-shadow: ${({theme}) => theme.shadows.soft};
`;

const PanelTitle = styled.h4`
    margin: 0;
    color: ${({theme}) => theme.colors.textPrimary};
    font-size: ${({theme}) => theme.typography.sizes.xl};
`;

const PanelDescription = styled.p`
    margin: 0;
    color: ${({theme}) => theme.colors.textSecondary};
    line-height: ${({theme}) => theme.typography.lineHeights.relaxed};
`;

const FieldGroup = styled.div`
    display: grid;
    gap: ${({theme}) => theme.spacing.xs};
`;

const Label = styled.label`
    color: ${({theme}) => theme.colors.textSecondary};
    font-size: ${({theme}) => theme.typography.sizes.sm};
`;

const HelperText = styled.p`
    margin: 0;
    color: ${({theme}) => theme.colors.textSubtle};
    font-size: ${({theme}) => theme.typography.sizes.xs};
    line-height: ${({theme}) => theme.typography.lineHeights.relaxed};
`;

const StyledTextarea = styled.textarea`
    width: 100%;
    min-height: 140px;
    resize: vertical;
    border-radius: ${({theme}) => theme.radii.md};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surfaceMuted};
    color: ${({theme}) => theme.colors.textPrimary};
    padding: ${({theme}) => theme.spacing.md};
    font: inherit;
    box-sizing: border-box;

    &::placeholder {
        color: ${({theme}) => theme.colors.textSubtle};
    }

    &:focus {
        outline: none;
        border-color: ${({theme}) => theme.colors.accent};
    }
`;

const LinkFieldRow = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: ${({theme}) => theme.spacing.sm};
    align-items: center;
`;

const MainGrid = styled.div`
    display: grid;
    grid-template-columns: minmax(300px, 360px) minmax(0, 1fr);
    gap: ${({theme}) => theme.spacing.xl};
    align-items: start;

    @media (max-width: ${({theme}) => theme.breakpoints.lg}px) {
        grid-template-columns: 1fr;
    }
`;

const StickyPanel = styled(Panel)`
    position: sticky;
    top: calc(${({theme}) => theme.layout.headerHeight} + ${({theme}) => theme.spacing.lg});

    @media (max-width: ${({theme}) => theme.breakpoints.lg}px) {
        position: static;
    }
`;

const CaseList = styled.div`
    display: grid;
    gap: ${({theme}) => theme.spacing.sm};
`;

const CaseCardButton = styled.button<{ $active: boolean }>`
    text-align: left;
    border-radius: ${({theme}) => theme.radii.md};
    border: 1px solid ${({theme, $active}) => $active ? theme.colors.accent : theme.colors.border};
    background: ${({theme, $active}) => $active ? theme.gradients.panel : theme.colors.surfaceMuted};
    padding: ${({theme}) => theme.spacing.md};
    color: ${({theme}) => theme.colors.textPrimary};
    cursor: pointer;
    display: grid;
    gap: ${({theme}) => theme.spacing.xs};
    transition: transform ${({theme}) => theme.transitions.snappy}, border-color ${({theme}) => theme.transitions.default};

    &:hover {
        transform: translateY(-1px);
    }
`;

const CaseMetaRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({theme}) => theme.spacing.xs};
`;

const Pill = styled.span<{ $tone?: 'default' | 'accent' | 'info' | 'warning' }>`
    display: inline-flex;
    width: fit-content;
    align-items: center;
    gap: ${({theme}) => theme.spacing.xs};
    padding: ${({theme}) => `${theme.spacing.xs} ${theme.spacing.sm}`};
    border-radius: ${({theme}) => theme.radii.pill};
    font-size: ${({theme}) => theme.typography.sizes.xs};
    border: 1px solid ${({theme, $tone}) => $tone === 'accent'
            ? 'rgba(255, 95, 109, 0.35)'
            : $tone === 'info'
                ? 'rgba(91, 192, 248, 0.35)'
                : $tone === 'warning'
                    ? 'rgba(255, 199, 95, 0.35)'
                    : theme.colors.border};
    background: ${({theme, $tone}) => $tone === 'accent'
            ? 'rgba(255, 95, 109, 0.12)'
            : $tone === 'info'
                ? 'rgba(91, 192, 248, 0.12)'
                : $tone === 'warning'
                    ? 'rgba(255, 199, 95, 0.12)'
                    : theme.colors.surfaceMuted};
    color: ${({theme}) => theme.colors.textPrimary};
`;

const CaseTitle = styled.strong`
    color: ${({theme}) => theme.colors.textPrimary};
    font-size: ${({theme}) => theme.typography.sizes.base};
`;

const CaseExcerpt = styled.p`
    margin: 0;
    color: ${({theme}) => theme.colors.textSecondary};
    font-size: ${({theme}) => theme.typography.sizes.sm};
    line-height: ${({theme}) => theme.typography.lineHeights.relaxed};
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const DetailHeader = styled.div`
    display: grid;
    gap: ${({theme}) => theme.spacing.sm};
`;

const DetailTitle = styled.h3`
    margin: 0;
    color: ${({theme}) => theme.colors.textPrimary};
    font-size: clamp(1.3rem, 2vw, 1.8rem);
`;

const DetailDescription = styled.p`
    margin: 0;
    color: ${({theme}) => theme.colors.textSecondary};
    white-space: pre-line;
    line-height: ${({theme}) => theme.typography.lineHeights.relaxed};
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: ${({theme}) => theme.spacing.md};
`;

const InfoCard = styled.div`
    display: grid;
    gap: ${({theme}) => theme.spacing.xs};
    padding: ${({theme}) => theme.spacing.md};
    border-radius: ${({theme}) => theme.radii.md};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surfaceMuted};
`;

const InfoLabel = styled.span`
    color: ${({theme}) => theme.colors.textSecondary};
    font-size: ${({theme}) => theme.typography.sizes.sm};
`;

const InfoValue = styled.strong`
    color: ${({theme}) => theme.colors.textPrimary};
`;

const Divider = styled.hr`
    border: none;
    border-top: 1px solid ${({theme}) => theme.colors.border};
    margin: ${({theme}) => `${theme.spacing.sm} 0`};
`;

const VoteGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: ${({theme}) => theme.spacing.md};
`;

const VoteCard = styled.div`
    display: grid;
    gap: ${({theme}) => theme.spacing.sm};
    padding: ${({theme}) => theme.spacing.md};
    border-radius: ${({theme}) => theme.radii.md};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surfaceMuted};
`;

const VoteCount = styled.strong`
    font-size: clamp(1.25rem, 2vw, 1.8rem);
    color: ${({theme}) => theme.colors.textPrimary};
`;

const VoteButtonRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({theme}) => theme.spacing.sm};
`;

const VoteButton = styled.button.attrs({type: 'button'})<{ $choice: TribunalVoteChoice; $active: boolean }>`
    ${buttonBase};
    background: ${({theme, $choice, $active}) => {
        if ($active && $choice === 'GUILTY') return 'rgba(255, 107, 107, 0.18)';
        if ($active && $choice === 'NOT_GUILTY') return 'rgba(91, 228, 155, 0.18)';
        return theme.colors.surfaceMuted;
    }};
    border-color: ${({theme, $choice, $active}) => {
        if ($active && $choice === 'GUILTY') return theme.colors.danger;
        if ($active && $choice === 'NOT_GUILTY') return theme.colors.success;
        return theme.colors.border;
    }};
    color: ${({theme}) => theme.colors.textPrimary};
`;

const Toolbar = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({theme}) => theme.spacing.sm};
    align-items: center;
`;

const FilterChip = styled.button.attrs({type: 'button'})<{ $active: boolean }>`
    ${buttonBase};
    padding: ${({theme}) => `${theme.spacing.xs} ${theme.spacing.md}`};
    background: ${({theme, $active}) => $active ? theme.gradients.panel : theme.colors.surfaceMuted};
    color: ${({theme}) => theme.colors.textPrimary};
    border-color: ${({theme, $active}) => $active ? theme.colors.accent : theme.colors.border};
`;

const MessageList = styled.div`
    display: grid;
    gap: ${({theme}) => theme.spacing.sm};
    max-height: 540px;
    overflow-y: auto;
    padding-right: ${({theme}) => theme.spacing.xs};
`;

const MessageCard = styled.div`
    display: grid;
    gap: ${({theme}) => theme.spacing.xs};
    padding: ${({theme}) => theme.spacing.md};
    border-radius: ${({theme}) => theme.radii.md};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surfaceMuted};
`;

const MessageHeader = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({theme}) => theme.spacing.xs};
    align-items: center;
`;

const MessageContent = styled.p`
    margin: 0;
    color: ${({theme}) => theme.colors.textPrimary};
    line-height: ${({theme}) => theme.typography.lineHeights.relaxed};
    white-space: pre-line;
    word-break: break-word;
`;

const CommentComposer = styled.div`
    display: grid;
    gap: ${({theme}) => theme.spacing.sm};
`;

const CommentList = styled.div`
    display: grid;
    gap: ${({theme}) => theme.spacing.md};
`;

const CommentCard = styled.div<{ $isReply: boolean }>`
    display: grid;
    gap: ${({theme}) => theme.spacing.sm};
    padding: ${({theme}) => theme.spacing.md};
    border-radius: ${({theme}) => theme.radii.md};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme, $isReply}) => $isReply ? theme.colors.surfaceMuted : theme.colors.surfaceElevated};
    margin-left: ${({$isReply, theme}) => $isReply ? theme.spacing.lg : '0'};
`;

const CommentHeader = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: ${({theme}) => theme.spacing.sm};
`;

const CommentAuthor = styled.strong`
    color: ${({theme}) => theme.colors.textPrimary};
`;

const CommentTime = styled.span`
    color: ${({theme}) => theme.colors.textSubtle};
    font-size: ${({theme}) => theme.typography.sizes.xs};
`;

const CommentBody = styled.p`
    margin: 0;
    color: ${({theme}) => theme.colors.textSecondary};
    line-height: ${({theme}) => theme.typography.lineHeights.relaxed};
    white-space: pre-line;
    word-break: break-word;
`;

const CommentActions = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({theme}) => theme.spacing.xs};
`;

const TinyButton = styled.button.attrs({type: 'button'})`
    ${buttonBase};
    padding: ${({theme}) => `${theme.spacing.xs} ${theme.spacing.sm}`};
    background: transparent;
    color: ${({theme}) => theme.colors.textSecondary};
`;

const EmptyState = styled.div`
    border-radius: ${({theme}) => theme.radii.md};
    border: 1px dashed ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surfaceMuted};
    padding: ${({theme}) => theme.spacing.lg};
    color: ${({theme}) => theme.colors.textSecondary};
`;

function Tribunal() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [cases, setCases] = useState<TribunalCaseSummary[]>([]);
    const [selectedCase, setSelectedCase] = useState<TribunalCaseDetail | null>(null);
    const [selectedCaseId, setSelectedCaseId] = useState<number | null>(() => {
        const fromQuery = Number(searchParams.get('case'));
        return Number.isFinite(fromQuery) && fromQuery > 0 ? fromQuery : null;
    });
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => Boolean(readAccessToken()));
    const [listLoading, setListLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [caseSubmitting, setCaseSubmitting] = useState(false);
    const [busyKey, setBusyKey] = useState<string | null>(null);
    const [listError, setListError] = useState<string | null>(null);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [status, setStatus] = useState<StatusMessage | null>(null);
    const [caseForm, setCaseForm] = useState<CaseFormState>(defaultCaseForm);
    const [messageFilter, setMessageFilter] = useState<'ALL' | 'PLAYER' | 'SYSTEM'>('ALL');
    const [messageSearch, setMessageSearch] = useState('');
    const [newComment, setNewComment] = useState('');
    const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
    const [replyTargetId, setReplyTargetId] = useState<number | null>(null);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const deferredMessageSearch = useDeferredValue(messageSearch.trim().toLowerCase());

    useEffect(() => {
        const sync = () => setIsLoggedIn(Boolean(readAccessToken()));
        sync();
        const interval = window.setInterval(sync, 2000);
        window.addEventListener('focus', sync);
        return () => {
            window.clearInterval(interval);
            window.removeEventListener('focus', sync);
        };
    }, []);

    useEffect(() => {
        const fromQuery = Number(searchParams.get('case'));
        if (Number.isFinite(fromQuery) && fromQuery > 0 && fromQuery !== selectedCaseId) {
            setSelectedCaseId(fromQuery);
        }
    }, [searchParams, selectedCaseId]);

    const applySelectedCaseToUrl = useCallback((caseId: number | null) => {
        const next = new URLSearchParams(searchParams);
        if (caseId) {
            next.set('case', String(caseId));
        } else {
            next.delete('case');
        }
        setSearchParams(next, {replace: true});
    }, [searchParams, setSearchParams]);

    const loadCases = useCallback(async (silent = false) => {
        if (!silent) {
            setListLoading(true);
        }

        try {
            const items = await listTribunalCases();
            setCases(items);
            setListError(null);
            return items;
        } catch (error) {
            console.error(error);
            setListError(error instanceof Error ? error.message : '사건 목록을 불러오지 못했습니다.');
            return [];
        } finally {
            if (!silent) {
                setListLoading(false);
            }
        }
    }, []);

    const loadCaseDetail = useCallback(async (caseId: number, silent = false) => {
        if (!silent) {
            setDetailLoading(true);
        }

        try {
            const detail = await getTribunalCaseDetail(caseId);
            setSelectedCase(detail);
            setDetailError(null);
            return detail;
        } catch (error) {
            console.error(error);
            setDetailError(error instanceof Error ? error.message : '사건 상세를 불러오지 못했습니다.');
            setSelectedCase(null);
            return null;
        } finally {
            if (!silent) {
                setDetailLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        void loadCases();
    }, [loadCases]);

    useEffect(() => {
        if (cases.length === 0) return;

        if (selectedCaseId && cases.some((item) => item.id === selectedCaseId)) {
            return;
        }

        const nextId = cases[0]?.id ?? null;
        setSelectedCaseId(nextId);
        applySelectedCaseToUrl(nextId);
    }, [applySelectedCaseToUrl, cases, selectedCaseId]);

    useEffect(() => {
        if (!selectedCaseId) {
            setSelectedCase(null);
            return;
        }

        void loadCaseDetail(selectedCaseId);
    }, [loadCaseDetail, selectedCaseId]);

    const selectedSummary = useMemo(
        () => cases.find((item) => item.id === selectedCaseId) ?? null,
        [cases, selectedCaseId]
    );

    const totalMessages = useMemo(
        () => cases.reduce((total, item) => total + item.messageCount, 0),
        [cases]
    );

    const filteredMessages = useMemo(() => {
        if (!selectedCase) return [];

        return selectedCase.messages.filter((message) => {
            const matchesFilter = messageFilter === 'ALL' || message.kind === messageFilter;
            const searchTarget = `${message.speaker} ${message.content} ${message.round ?? ''}`.toLowerCase();
            const matchesSearch = deferredMessageSearch.length === 0 || searchTarget.includes(deferredMessageSearch);
            return matchesFilter && matchesSearch;
        });
    }, [deferredMessageSearch, messageFilter, selectedCase]);

    const selectCase = (caseId: number) => {
        setSelectedCaseId(caseId);
        applySelectedCaseToUrl(caseId);
    };

    const updateCaseFormField = <K extends keyof CaseFormState>(key: K, value: CaseFormState[K]) => {
        setCaseForm((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const updateCafeLink = (index: number, value: string) => {
        setCaseForm((current) => ({
            ...current,
            cafeLinks: current.cafeLinks.map((item, itemIndex) => itemIndex === index ? value : item),
        }));
    };

    const addCafeLink = () => {
        setCaseForm((current) => ({
            ...current,
            cafeLinks: [...current.cafeLinks, ''],
        }));
    };

    const removeCafeLink = (index: number) => {
        setCaseForm((current) => {
            if (current.cafeLinks.length === 1) {
                return {
                    ...current,
                    cafeLinks: [''],
                };
            }

            return {
                ...current,
                cafeLinks: current.cafeLinks.filter((_, itemIndex) => itemIndex !== index),
            };
        });
    };

    const ensureLoggedIn = (actionLabel: string): boolean => {
        if (isLoggedIn) return true;
        setStatus({tone: 'info', message: `${actionLabel} 기능은 로그인 후 사용할 수 있습니다.`});
        return false;
    };

    const handleCreateCase = async () => {
        const replayUrl = caseForm.replayUrl.trim();
        const nickname = caseForm.nickname.trim();
        const pick = caseForm.pick.trim();
        const description = caseForm.description.trim();
        const cafeLinks = caseForm.cafeLinks.map((item) => item.trim()).filter((item) => item.length > 0);

        if (!ensureLoggedIn('사건 등록')) return;

        if (!replayUrlPattern.test(replayUrl)) {
            setStatus({tone: 'danger', message: '마피아42 리플레이 링크를 정확히 입력해주세요.'});
            return;
        }

        if (!nickname || !pick || !description) {
            setStatus({tone: 'danger', message: '닉네임, 픽, 인게임 설명은 모두 입력해주세요.'});
            return;
        }

        setCaseSubmitting(true);
        try {
            const created = await createTribunalCase({
                replayUrl,
                nickname,
                pick,
                description,
                cafeLinks,
            });

            setStatus({tone: 'success', message: '사건이 등록되었습니다. 리플레이 로그를 확인해보세요.'});
            setCaseForm(defaultCaseForm());

            const nextCases = await loadCases(true);
            const nextId = created.id || (nextCases[0]?.id ?? null);
            if (nextId) {
                selectCase(nextId);
                await loadCaseDetail(nextId, true);
            }
        } catch (error) {
            console.error(error);
            setStatus({tone: 'danger', message: error instanceof Error ? error.message : '사건 등록에 실패했습니다.'});
        } finally {
            setCaseSubmitting(false);
        }
    };

    const refreshSelectedCase = async (caseId: number) => {
        await Promise.all([
            loadCases(true),
            loadCaseDetail(caseId, true),
        ]);
    };

    const handleVote = async (choice: TribunalVoteChoice) => {
        if (!selectedCaseId) return;
        if (!ensureLoggedIn('투표')) return;

        setBusyKey(`vote-${choice}`);
        try {
            await voteTribunalCase(selectedCaseId, choice);
            setStatus({
                tone: 'success',
                message: choice === 'GUILTY' ? '유죄 표를 반영했습니다.' : '무죄 표를 반영했습니다.'
            });
            await refreshSelectedCase(selectedCaseId);
        } catch (error) {
            console.error(error);
            setStatus({tone: 'danger', message: error instanceof Error ? error.message : '투표 처리에 실패했습니다.'});
        } finally {
            setBusyKey(null);
        }
    };

    const handleCommentSubmit = async (parentId?: number | null) => {
        if (!selectedCaseId) return;
        if (!ensureLoggedIn('댓글 작성')) return;

        const content = (parentId ? replyDrafts[parentId] : newComment)?.trim() ?? '';
        if (!content) {
            setStatus({tone: 'danger', message: '댓글 내용을 입력해주세요.'});
            return;
        }

        setBusyKey(parentId ? `reply-${parentId}` : 'comment-create');
        try {
            await createTribunalComment(selectedCaseId, content, parentId);
            setStatus({tone: 'success', message: parentId ? '대댓글이 등록되었습니다.' : '댓글이 등록되었습니다.'});
            if (parentId) {
                setReplyDrafts((current) => ({...current, [parentId]: ''}));
                setReplyTargetId(null);
            } else {
                setNewComment('');
            }
            await refreshSelectedCase(selectedCaseId);
        } catch (error) {
            console.error(error);
            setStatus({tone: 'danger', message: error instanceof Error ? error.message : '댓글 저장에 실패했습니다.'});
        } finally {
            setBusyKey(null);
        }
    };

    const startEditingComment = (comment: TribunalComment) => {
        setEditingCommentId(comment.id);
        setEditingContent(comment.content);
    };

    const handleCommentUpdate = async (commentId: number) => {
        if (!selectedCaseId) return;
        const content = editingContent.trim();
        if (!content) {
            setStatus({tone: 'danger', message: '수정할 내용을 입력해주세요.'});
            return;
        }

        setBusyKey(`edit-${commentId}`);
        try {
            await updateTribunalComment(commentId, content);
            setStatus({tone: 'success', message: '댓글을 수정했습니다.'});
            setEditingCommentId(null);
            setEditingContent('');
            await refreshSelectedCase(selectedCaseId);
        } catch (error) {
            console.error(error);
            setStatus({tone: 'danger', message: error instanceof Error ? error.message : '댓글 수정에 실패했습니다.'});
        } finally {
            setBusyKey(null);
        }
    };

    const handleCommentDelete = async (commentId: number) => {
        if (!selectedCaseId) return;
        if (!window.confirm('이 댓글을 삭제할까요?')) return;

        setBusyKey(`delete-${commentId}`);
        try {
            await deleteTribunalComment(commentId);
            setStatus({tone: 'success', message: '댓글을 삭제했습니다.'});
            await refreshSelectedCase(selectedCaseId);
        } catch (error) {
            console.error(error);
            setStatus({tone: 'danger', message: error instanceof Error ? error.message : '댓글 삭제에 실패했습니다.'});
        } finally {
            setBusyKey(null);
        }
    };

    const handleToggleLike = async (commentId: number) => {
        if (!selectedCaseId) return;
        if (!ensureLoggedIn('인정')) return;

        setBusyKey(`like-${commentId}`);
        try {
            await toggleTribunalCommentLike(commentId);
            await refreshSelectedCase(selectedCaseId);
        } catch (error) {
            console.error(error);
            setStatus({tone: 'danger', message: error instanceof Error ? error.message : '인정 처리에 실패했습니다.'});
        } finally {
            setBusyKey(null);
        }
    };

    const renderComment = (comment: TribunalComment, isReply = false) => {
        const isEditing = editingCommentId === comment.id;
        const replyDraft = replyDrafts[comment.id] ?? '';
        const canReply = comment.parentId === null;

        return (
            <React.Fragment key={comment.id}>
                <CommentCard $isReply={isReply}>
                    <CommentHeader>
                        <div>
                            <CommentAuthor>{comment.author}</CommentAuthor>
                            <CommentTime> · {formatDateTime(comment.updatedAt ?? comment.createdAt)}</CommentTime>
                        </div>
                        <CommentActions>
                            <TinyButton onClick={() => handleToggleLike(comment.id)} disabled={busyKey === `like-${comment.id}`}>
                                인정 {comment.likeCount}
                            </TinyButton>
                            {canReply && (
                                <TinyButton onClick={() => {
                                    setReplyTargetId((current) => current === comment.id ? null : comment.id);
                                    setEditingCommentId(null);
                                }}>
                                    답글
                                </TinyButton>
                            )}
                            {comment.canEdit && (
                                <TinyButton onClick={() => startEditingComment(comment)}>
                                    수정
                                </TinyButton>
                            )}
                            {comment.canDelete && (
                                <TinyButton onClick={() => handleCommentDelete(comment.id)} disabled={busyKey === `delete-${comment.id}`}>
                                    삭제
                                </TinyButton>
                            )}
                        </CommentActions>
                    </CommentHeader>

                    {isEditing ? (
                        <CommentComposer>
                            <StyledTextarea
                                value={editingContent}
                                onChange={(event) => setEditingContent(event.target.value)}
                                placeholder="댓글을 수정하세요."
                            />
                            <ActionRow>
                                <PrimaryButton onClick={() => handleCommentUpdate(comment.id)} disabled={busyKey === `edit-${comment.id}`}>
                                    저장
                                </PrimaryButton>
                                <GhostButton onClick={() => {
                                    setEditingCommentId(null);
                                    setEditingContent('');
                                }}>
                                    취소
                                </GhostButton>
                            </ActionRow>
                        </CommentComposer>
                    ) : (
                        <CommentBody>{comment.content}</CommentBody>
                    )}

                    {replyTargetId === comment.id && (
                        <CommentComposer>
                            <StyledTextarea
                                value={replyDraft}
                                onChange={(event) => setReplyDrafts((current) => ({...current, [comment.id]: event.target.value}))}
                                placeholder="판결에 도움이 되는 근거를 남겨주세요."
                            />
                            <ActionRow>
                                <PrimaryButton onClick={() => handleCommentSubmit(comment.id)} disabled={busyKey === `reply-${comment.id}`}>
                                    대댓글 등록
                                </PrimaryButton>
                                <GhostButton onClick={() => setReplyTargetId(null)}>
                                    닫기
                                </GhostButton>
                            </ActionRow>
                        </CommentComposer>
                    )}
                </CommentCard>

                {comment.children.map((child) => renderComment(child, true))}
            </React.Fragment>
        );
    };

    return (
        <Layout>
            <ContentLayout gap={'24px'}>
                <CategoryTitle
                    title="재판소"
                    description="마피아42 리플레이를 사건으로 등록하고, 다른 유저들과 함께 채팅 로그를 근거로 평결을 모아보세요."
                />

                <PageStack>
                    <HeroCard>
                        <HeroEyebrow>Mafia42 Tribunal</HeroEyebrow>
                        <HeroTitle>유저 참관 재판소</HeroTitle>
                        <HeroDescription>
                            리플레이 링크 하나로 사건을 만들고, 대화 로그와 시스템 메시지를 함께 보며 유죄/무죄를 토론하는 공간입니다.
                            운영용 사건 보관함과 커뮤니티 여론 수집 화면을 한 번에 묶어두었습니다.
                        </HeroDescription>

                        <HeroStats>
                            <StatCard>
                                <StatLabel>등록된 사건</StatLabel>
                                <StatValue>{cases.length.toLocaleString()}</StatValue>
                            </StatCard>
                            <StatCard>
                                <StatLabel>누적 로그</StatLabel>
                                <StatValue>{totalMessages.toLocaleString()}</StatValue>
                            </StatCard>
                            <StatCard>
                                <StatLabel>현재 선택 사건</StatLabel>
                                <StatValue>{selectedSummary ? `#${selectedSummary.id}` : '-'}</StatValue>
                            </StatCard>
                        </HeroStats>

                        <ActionRow>
                            {!isLoggedIn && (
                                <PrimaryButton onClick={startGoogleLogin}>
                                    Google 로그인 후 배심원 참여
                                </PrimaryButton>
                            )}
                            <SecondaryButton onClick={() => void loadCases()}>
                                사건 목록 새로고침
                            </SecondaryButton>
                        </ActionRow>

                        {!isLoggedIn && (
                            <StatusBox $tone="info">
                                열람은 누구나 가능하지만, 사건 등록과 투표, 댓글, 인정 기능은 로그인 후 활성화됩니다.
                            </StatusBox>
                        )}
                        {status && (
                            <StatusBox $tone={status.tone}>
                                {status.message}
                            </StatusBox>
                        )}
                    </HeroCard>

                    <TwoColumnGrid>
                        <Panel>
                            <PanelTitle>사건 등록</PanelTitle>
                            <PanelDescription>
                                운영진이나 제보자가 리플레이 링크와 설명을 남기면, 백엔드가 채팅 로그를 파싱해 사건으로 적재합니다.
                            </PanelDescription>

                            <FieldGroup>
                                <Label htmlFor="tribunal-replay-url">리플레이 링크</Label>
                                <Input
                                    value={caseForm.replayUrl}
                                    onChange={(value) => updateCaseFormField('replayUrl', value)}
                                    placeholder="https://mafia42.com/history/kr/..."
                                    width="100%"
                                />
                                <HelperText>마피아42 리플레이 상세 링크를 그대로 넣어주세요.</HelperText>
                            </FieldGroup>

                            <FieldGroup>
                                <Label htmlFor="tribunal-nickname">닉네임</Label>
                                <Input
                                    value={caseForm.nickname}
                                    onChange={(value) => updateCaseFormField('nickname', value)}
                                    placeholder="피고 혹은 핵심 플레이어 닉네임"
                                    width="100%"
                                />
                            </FieldGroup>

                            <FieldGroup>
                                <Label htmlFor="tribunal-pick">픽</Label>
                                <Input
                                    value={caseForm.pick}
                                    onChange={(value) => updateCaseFormField('pick', value)}
                                    placeholder="예: 시민, 마피아, 판사"
                                    width="100%"
                                />
                            </FieldGroup>

                            <FieldGroup>
                                <Label htmlFor="tribunal-description">인게임 설명</Label>
                                <StyledTextarea
                                    id="tribunal-description"
                                    value={caseForm.description}
                                    onChange={(event) => updateCaseFormField('description', event.target.value)}
                                    placeholder="왜 이 사건이 논쟁거리인지, 어떤 장면을 봐야 하는지 적어주세요."
                                />
                            </FieldGroup>

                            <FieldGroup>
                                <Label>네이버카페 링크</Label>
                                {caseForm.cafeLinks.map((link, index) => (
                                    <LinkFieldRow key={`cafe-link-${index}`}>
                                        <Input
                                            value={link}
                                            onChange={(value) => updateCafeLink(index, value)}
                                            placeholder="https://cafe.naver.com/..."
                                            width="100%"
                                        />
                                        <GhostButton onClick={() => removeCafeLink(index)}>
                                            삭제
                                        </GhostButton>
                                    </LinkFieldRow>
                                ))}
                                <ActionRow>
                                    <SecondaryButton onClick={addCafeLink}>
                                        카페 링크 추가
                                    </SecondaryButton>
                                </ActionRow>
                            </FieldGroup>

                            <ActionRow>
                                <PrimaryButton onClick={handleCreateCase} disabled={caseSubmitting}>
                                    {caseSubmitting ? '사건 저장 중...' : '사건 등록'}
                                </PrimaryButton>
                            </ActionRow>
                        </Panel>

                        <Panel>
                            <PanelTitle>운영 포인트</PanelTitle>
                            <PanelDescription>
                                링크 하나로 사건이 열리고, 토론과 평결, 댓글 흐름이 같은 화면에서 이어지도록 구성했습니다.
                                행사 현장에서는 운영진이 사건을 등록하고, 참가자들은 각자 근거를 들며 표를 바꾸는 경험을 바로 만들 수 있습니다.
                            </PanelDescription>
                            <InfoGrid>
                                <InfoCard>
                                    <InfoLabel>배심원 투표</InfoLabel>
                                    <InfoValue>유죄 / 무죄 변경 가능</InfoValue>
                                </InfoCard>
                                <InfoCard>
                                    <InfoLabel>토론 구조</InfoLabel>
                                    <InfoValue>댓글 + 1단계 대댓글</InfoValue>
                                </InfoCard>
                                <InfoCard>
                                    <InfoLabel>근거 자료</InfoLabel>
                                    <InfoValue>채팅 로그 + 시스템 메시지</InfoValue>
                                </InfoCard>
                                <InfoCard>
                                    <InfoLabel>외부 링크</InfoLabel>
                                    <InfoValue>네이버카페 링크 다중 등록</InfoValue>
                                </InfoCard>
                            </InfoGrid>
                        </Panel>
                    </TwoColumnGrid>

                    <MainGrid>
                        <StickyPanel>
                            <PanelTitle>사건 목록</PanelTitle>
                            <PanelDescription>최신 사건부터 선택해서 바로 열람할 수 있습니다.</PanelDescription>

                            {listError && (
                                <StatusBox $tone="danger">
                                    {listError}
                                </StatusBox>
                            )}

                            {listLoading ? (
                                <Spinner isLoading={true}/>
                            ) : cases.length > 0 ? (
                                <CaseList>
                                    {cases.map((item) => (
                                        <CaseCardButton
                                            key={item.id}
                                            $active={item.id === selectedCaseId}
                                            onClick={() => selectCase(item.id)}
                                        >
                                            <CaseMetaRow>
                                                <Pill $tone="accent">사건 #{item.id}</Pill>
                                                <Pill>{formatDateTime(item.createdAt)}</Pill>
                                            </CaseMetaRow>
                                            <CaseTitle>{item.nickname} · {item.pick}</CaseTitle>
                                            <CaseExcerpt>{item.description || '사건 설명이 아직 비어 있습니다.'}</CaseExcerpt>
                                            <CaseMetaRow>
                                                <Pill $tone="warning">유죄 {item.guiltyCount}</Pill>
                                                <Pill $tone="info">무죄 {item.notGuiltyCount}</Pill>
                                                <Pill>댓글 {item.commentCount}</Pill>
                                            </CaseMetaRow>
                                        </CaseCardButton>
                                    ))}
                                </CaseList>
                            ) : (
                                <EmptyState>아직 등록된 사건이 없습니다. 첫 사건을 만들어보세요.</EmptyState>
                            )}
                        </StickyPanel>

                        <Panel>
                            {detailLoading ? (
                                <Spinner isLoading={true}/>
                            ) : detailError ? (
                                <StatusBox $tone="danger">{detailError}</StatusBox>
                            ) : selectedCase ? (
                                <>
                                    <DetailHeader>
                                        <CaseMetaRow>
                                            <Pill $tone="accent">사건 #{selectedCase.id}</Pill>
                                            <Pill>{selectedCase.statusLabel}</Pill>
                                            <Pill>{formatDateTime(selectedCase.createdAt)}</Pill>
                                        </CaseMetaRow>
                                        <DetailTitle>{selectedCase.nickname} · {selectedCase.pick}</DetailTitle>
                                        <DetailDescription>
                                            {selectedCase.description || '사건 설명이 아직 등록되지 않았습니다.'}
                                        </DetailDescription>
                                        <ActionRow>
                                            <PrimaryButton as="a" href={selectedCase.replayUrl} target="_blank" rel="noreferrer">
                                                원본 리플레이 열기
                                            </PrimaryButton>
                                            <SecondaryButton onClick={() => void refreshSelectedCase(selectedCase.id)}>
                                                상세 새로고침
                                            </SecondaryButton>
                                        </ActionRow>
                                    </DetailHeader>

                                    <InfoGrid>
                                        <InfoCard>
                                            <InfoLabel>메시지 수</InfoLabel>
                                            <InfoValue>{selectedCase.messageCount.toLocaleString()}</InfoValue>
                                        </InfoCard>
                                        <InfoCard>
                                            <InfoLabel>댓글 수</InfoLabel>
                                            <InfoValue>{selectedCase.commentCount.toLocaleString()}</InfoValue>
                                        </InfoCard>
                                        <InfoCard>
                                            <InfoLabel>내 투표</InfoLabel>
                                            <InfoValue>
                                                {selectedCase.myVote === 'GUILTY' ? '유죄' : selectedCase.myVote === 'NOT_GUILTY' ? '무죄' : '미참여'}
                                            </InfoValue>
                                        </InfoCard>
                                        <InfoCard>
                                            <InfoLabel>카페 링크</InfoLabel>
                                            <InfoValue>{selectedCase.cafeLinks.length.toLocaleString()}개</InfoValue>
                                        </InfoCard>
                                    </InfoGrid>

                                    {selectedCase.cafeLinks.length > 0 && (
                                        <ActionRow>
                                            {selectedCase.cafeLinks.map((link) => (
                                                <SecondaryButton
                                                    key={link}
                                                    as="a"
                                                    href={link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    카페 글 열기
                                                </SecondaryButton>
                                            ))}
                                        </ActionRow>
                                    )}

                                    <Divider />

                                    <PanelTitle>배심원 평결</PanelTitle>
                                    <VoteGrid>
                                        <VoteCard>
                                            <InfoLabel>유죄</InfoLabel>
                                            <VoteCount>{selectedCase.guiltyCount.toLocaleString()}</VoteCount>
                                        </VoteCard>
                                        <VoteCard>
                                            <InfoLabel>무죄</InfoLabel>
                                            <VoteCount>{selectedCase.notGuiltyCount.toLocaleString()}</VoteCount>
                                        </VoteCard>
                                    </VoteGrid>

                                    <VoteButtonRow>
                                        <VoteButton
                                            $choice="GUILTY"
                                            $active={selectedCase.myVote === 'GUILTY'}
                                            onClick={() => handleVote('GUILTY')}
                                            disabled={busyKey === 'vote-GUILTY'}
                                        >
                                            유죄 투표
                                        </VoteButton>
                                        <VoteButton
                                            $choice="NOT_GUILTY"
                                            $active={selectedCase.myVote === 'NOT_GUILTY'}
                                            onClick={() => handleVote('NOT_GUILTY')}
                                            disabled={busyKey === 'vote-NOT_GUILTY'}
                                        >
                                            무죄 투표
                                        </VoteButton>
                                    </VoteButtonRow>

                                    <Divider />

                                    <PanelTitle>리플레이 로그</PanelTitle>
                                    <Toolbar>
                                        <FilterChip $active={messageFilter === 'ALL'} onClick={() => setMessageFilter('ALL')}>
                                            전체
                                        </FilterChip>
                                        <FilterChip $active={messageFilter === 'PLAYER'} onClick={() => setMessageFilter('PLAYER')}>
                                            플레이어
                                        </FilterChip>
                                        <FilterChip $active={messageFilter === 'SYSTEM'} onClick={() => setMessageFilter('SYSTEM')}>
                                            시스템
                                        </FilterChip>
                                        <Input
                                            value={messageSearch}
                                            onChange={setMessageSearch}
                                            placeholder="닉네임이나 키워드 검색"
                                            width="260px"
                                        />
                                    </Toolbar>

                                    {filteredMessages.length > 0 ? (
                                        <MessageList>
                                            {filteredMessages.map((message) => (
                                                <MessageCard key={message.id}>
                                                    <MessageHeader>
                                                        <Pill $tone={message.kind === 'SYSTEM' ? 'warning' : 'default'}>
                                                            {message.kind === 'SYSTEM' ? 'SYSTEM' : message.speaker}
                                                        </Pill>
                                                        {message.round && <Pill>{message.round}</Pill>}
                                                        {message.timestamp && <Pill>{formatDateTime(message.timestamp)}</Pill>}
                                                    </MessageHeader>
                                                    <MessageContent>{message.content}</MessageContent>
                                                </MessageCard>
                                            ))}
                                        </MessageList>
                                    ) : (
                                        <EmptyState>현재 조건에 맞는 로그가 없습니다.</EmptyState>
                                    )}

                                    <Divider />

                                    <PanelTitle>배심원 코멘트</PanelTitle>
                                    <CommentComposer>
                                        <StyledTextarea
                                            value={newComment}
                                            onChange={(event) => setNewComment(event.target.value)}
                                            placeholder="왜 유죄 혹은 무죄라고 보는지 근거를 남겨주세요."
                                        />
                                        <ActionRow>
                                            <PrimaryButton onClick={() => handleCommentSubmit()} disabled={busyKey === 'comment-create'}>
                                                댓글 등록
                                            </PrimaryButton>
                                        </ActionRow>
                                    </CommentComposer>

                                    {selectedCase.comments.length > 0 ? (
                                        <CommentList>
                                            {selectedCase.comments.map((comment) => renderComment(comment))}
                                        </CommentList>
                                    ) : (
                                        <EmptyState>아직 댓글이 없습니다. 첫 의견을 남겨보세요.</EmptyState>
                                    )}
                                </>
                            ) : (
                                <EmptyState>좌측에서 사건을 선택하면 상세 로그와 평결 보드가 열립니다.</EmptyState>
                            )}
                        </Panel>
                    </MainGrid>
                </PageStack>
            </ContentLayout>
        </Layout>
    );
}

export default Tribunal;
