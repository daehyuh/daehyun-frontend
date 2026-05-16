import React, {Fragment, startTransition, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import styled, {css} from "styled-components";
import {CategoryTitle, ContentLayout, Input, Layout} from "@/components";
import Spinner from "@/components/base/Spinner";
import ToastNotice from "@/components/base/ToastNotice";
import {startGoogleLogin} from "@/utils/googleLogin";
import {
    createTribunalCase,
    createTribunalComment,
    deleteTribunalCase,
    deleteTribunalComment,
    getTribunalCaseDetail,
    listTribunalCases,
    previewTribunalReplay,
    toggleTribunalCommentLike,
    updateTribunalComment,
    voteTribunalCase
} from "@/apis/tribunal";
import type {
    TribunalAuthor,
    TribunalCaseDetail,
    TribunalCaseSummary,
    TribunalComment,
    TribunalReplayPreview,
    TribunalReplayPreviewPlayer,
    TribunalReplayMessage,
    TribunalVoteChoice
} from "@/apis/tribunalTypes";

type StatusTone = 'info' | 'success' | 'danger';

type StatusMessage = {
    tone: StatusTone;
    message: string;
};

type CaseFormState = {
    replayUrl: string;
    description: string;
    cafeLinks: string[];
};

type ReplayBubbleTone =
    | 'CHAT'
    | 'MAFIACHAT'
    | 'MEGAPHONE'
    | 'GHOSTCHAT'
    | 'WITCHCHAT'
    | 'MAGICIANCHAT'
    | 'LOVERCHAT'
    | 'CULT_LEADER'
    | 'SYSTEM';

type ReplayMessageGroup = {
    key: string;
    kind: 'PLAYER' | 'SYSTEM';
    speaker: string;
    pick: string | null;
    round: string | null;
    timestamp: string | null;
    chatType: ReplayBubbleTone;
    frameImageUrl: string | null;
    jobIconUrl: string | null;
    lines: TribunalReplayMessage[];
};

type ReplayParticipant = {
    speaker: string;
    pick: string | null;
    frameImageUrl: string | null;
    jobIconUrl: string | null;
    isDefendant: boolean;
};

type RankTier =
    | 'UNRANKED'
    | 'WOOD'
    | 'BRONZE'
    | 'SILVER'
    | 'GOLD'
    | 'PLATINUM'
    | 'MASTER'
    | 'GRAND_MASTER';

type RankPlateTheme = {
    label: string;
    background: string;
    border: string;
    accent: string;
    text: string;
    shadow: string;
};

const RANK_PLATE_THEMES: Record<RankTier, RankPlateTheme> = {
    UNRANKED: {
        label: '기록없음',
        background: 'linear-gradient(180deg, #586172 0%, #3b4350 48%, #252b35 100%)',
        border: '#8f99ad',
        accent: '#e3e7ef',
        text: '#f5f7fb',
        shadow: 'rgba(20, 24, 31, 0.38)',
    },
    WOOD: {
        label: '우드',
        background: 'linear-gradient(180deg, #8a6544 0%, #5f3e27 48%, #4b301f 100%)',
        border: '#a9825f',
        accent: '#efd9bb',
        text: '#fff2df',
        shadow: 'rgba(37, 22, 12, 0.42)',
    },
    BRONZE: {
        label: '브론즈',
        background: 'linear-gradient(180deg, #b48b79 0%, #98715e 48%, #7f594b 100%)',
        border: '#d8b4a1',
        accent: '#fff0e5',
        text: '#fff5ee',
        shadow: 'rgba(74, 43, 33, 0.34)',
    },
    SILVER: {
        label: '실버',
        background: 'linear-gradient(180deg, #dbe1ea 0%, #b8c0cd 48%, #95a0b3 100%)',
        border: '#edf3ff',
        accent: '#ffffff',
        text: '#1d2533',
        shadow: 'rgba(64, 74, 89, 0.28)',
    },
    GOLD: {
        label: '골드',
        background: 'linear-gradient(180deg, #f5df7d 0%, #d1af3b 48%, #a88318 100%)',
        border: '#ffeaa3',
        accent: '#fff5c9',
        text: '#2f2300',
        shadow: 'rgba(107, 78, 0, 0.3)',
    },
    PLATINUM: {
        label: '플래티넘',
        background: 'linear-gradient(180deg, #d7edf2 0%, #a9c8cb 48%, #7ba6a7 100%)',
        border: '#f0ffff',
        accent: '#ffffff',
        text: '#11282f',
        shadow: 'rgba(29, 74, 77, 0.28)',
    },
    MASTER: {
        label: '마스터',
        background: 'linear-gradient(180deg, #3c46d8 0%, #181b65 50%, #090b2d 100%)',
        border: '#6674ff',
        accent: '#cad0ff',
        text: '#eef0ff',
        shadow: 'rgba(8, 10, 45, 0.42)',
    },
    GRAND_MASTER: {
        label: '그랜드마스터',
        background: 'linear-gradient(180deg, #8b3df0 0%, #4b1f8d 48%, #251044 100%)',
        border: '#d59dff',
        accent: '#f4d8ff',
        text: '#faf0ff',
        shadow: 'rgba(41, 11, 68, 0.44)',
    },
};

const formatReplayParticipantPick = (participant: ReplayParticipant): string =>
    participant.isDefendant
        ? `피고인 / ${participant.pick ?? '직업 미상'}`
        : participant.pick ?? '직업 미상';

const defaultCaseForm = (): CaseFormState => ({
    replayUrl: '',
    description: '',
    cafeLinks: [''],
});

const replayUrlPattern = /^https?:\/\/mafia42\.com\/history\/kr\/[A-Za-z0-9]+/i;
const CASE_PAGE_SIZE = 20;
const CASE_LIST_STACK_BREAKPOINT = 1100;

const JOB_LABELS: Record<string, string> = {
    mafia: '마피아',
    police: '경찰',
    doctor: '의사',
    mentalist: '심리학자',
    fortuneteller: '예언자',
    fortune_teller: '예언자',
    hitman: '청부업자',
    judge: '판사',
    citizen: '시민',
    spy: '스파이',
    soldier: '군인',
    witch: '마녀',
    magician: '마술사',
    lover: '연인',
    cult_leader: '교주',
    cultleader: '교주',
    priest: '사제',
    reporter: '기자',
    hacker: '해커',
    politician: '정치인',
    detective: '탐정',
    thug: '건달',
    mercenary: '용병',
    vigilante: '자경단원',
    beastman: '짐승인간',
    madam: '마담',
    shaman: '무당',
    prophet: '예언자',
    nurse: '간호사',
    pharmacist: '약사',
    mason: '비밀결사',
    gambler: '도박사',
    arsonist: '방화범',
    terrorist: '테러리스트',
    blackmailer: '협박범',
    ghoul: '구울',
    medium: '영매',
};

const normalizeJobKey = (value: string | null | undefined): string | null => {
    if (!value) return null;

    const normalized = value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .replace(/_+/g, '_');

    return normalized.length > 0 ? normalized : null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const readAccessToken = (): string | null => {
    if (typeof document === 'undefined') return null;
    return document.cookie
        .split(';')
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith('accessToken='))
        ?.split('=')[1] ?? null;
};

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    try {
        const normalized = parts[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/')
            .padEnd(Math.ceil(parts[1].length / 4) * 4, '=');
        const json = atob(normalized);
        return JSON.parse(json) as Record<string, unknown>;
    } catch {
        return null;
    }
};

const ROLE_VALUE_PATTERN = /^ROLE_[A-Z0-9_]+$/i;

const collectRoleCandidates = (value: unknown, roles: Set<string>, depth = 0) => {
    if (depth > 6 || value === null || value === undefined) return;

    if (typeof value === 'string') {
        const normalized = value.trim().toUpperCase();
        if (ROLE_VALUE_PATTERN.test(normalized) || normalized === 'ADMIN') {
            roles.add(normalized === 'ADMIN' ? 'ROLE_ADMIN' : normalized);
        }
        return;
    }

    if (Array.isArray(value)) {
        value.forEach((item) => collectRoleCandidates(item, roles, depth + 1));
        return;
    }

    if (!isRecord(value)) return;

    Object.entries(value).forEach(([key, nestedValue]) => {
        const normalizedKey = key.trim().toLowerCase();

        if (normalizedKey === 'role' || normalizedKey === 'roles' || normalizedKey === 'authority' || normalizedKey === 'authorities') {
            collectRoleCandidates(nestedValue, roles, depth + 1);
            return;
        }

        if (normalizedKey.includes('role') || normalizedKey.includes('authorit')) {
            collectRoleCandidates(nestedValue, roles, depth + 1);
            return;
        }

        if (depth < 3) {
            collectRoleCandidates(nestedValue, roles, depth + 1);
        }
    });
};

const extractRoleFromToken = (token: string | null): string | null => {
    if (!token) return null;

    const payload = decodeJwtPayload(token);
    if (!payload) return null;

    const roles = new Set<string>();
    collectRoleCandidates(payload, roles);

    if (roles.has('ROLE_ADMIN')) {
        return 'ROLE_ADMIN';
    }

    return roles.values().next().value ?? null;
};

const formatDateTime = (value: string | null): string | null => {
    if (!value) return null;

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

const getVoteBreakdown = (guiltyCount: number, notGuiltyCount: number) => {
    const total = guiltyCount + notGuiltyCount;

    if (total <= 0) {
        return {
            total: 0,
            guiltyPercent: 0,
            notGuiltyPercent: 0,
        };
    }

    const guiltyPercent = Math.round((guiltyCount / total) * 100);
    return {
        total,
        guiltyPercent,
        notGuiltyPercent: Math.max(0, 100 - guiltyPercent),
    };
};

const countAllComments = (comments: TribunalComment[]): number =>
    comments.reduce((total, comment) => total + 1 + countAllComments(comment.children), 0);

const deriveJobSlug = (jobIconUrl: string | null): string | null => {
    if (!jobIconUrl) return null;

    const matched = jobIconUrl.match(/jobthumb_([^./?]+)\.png/i);
    if (!matched) return null;
    return matched[1]?.toLowerCase() ?? null;
};

const translatePickLabel = (value: string | null): string | null => {
    const normalized = normalizeJobKey(value);
    if (!normalized) return value;
    return JOB_LABELS[normalized] ?? value;
};

const getDisplayPickLabel = (pick: string | null, pickName?: string | null): string | null =>
    pickName ?? translatePickLabel(pick) ?? pick;

const slugToReadableLabel = (slug: string): string =>
    slug
        .split(/[_-]+/)
        .filter(Boolean)
        .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
        .join(' ');

const resolvePickLabel = (message: TribunalReplayMessage, selectedCase?: TribunalCaseDetail | null): string | null => {
    const directPick = translatePickLabel(message.pick);
    if (directPick) return directPick;
    if (selectedCase && message.speaker === selectedCase.nickname) {
        return getDisplayPickLabel(selectedCase.pick, selectedCase.pickName) ?? selectedCase.pick;
    }

    const slug = normalizeJobKey(message.jobCode) ?? deriveJobSlug(message.jobIconUrl);
    if (!slug) return null;
    return JOB_LABELS[slug] ?? slugToReadableLabel(slug);
};

const getRankTier = (rankPoint: number | null): RankTier => {
    if (rankPoint === null || !Number.isFinite(rankPoint) || rankPoint < 0) {
        return 'UNRANKED';
    }

    if (rankPoint >= 9500) return 'GRAND_MASTER';
    if (rankPoint >= 9000) return 'MASTER';
    if (rankPoint >= 7500) return 'PLATINUM';
    if (rankPoint >= 6000) return 'GOLD';
    if (rankPoint >= 4500) return 'SILVER';
    if (rankPoint >= 3000) return 'BRONZE';
    return 'WOOD';
};

const getTribunalAuthorLabel = (author: TribunalAuthor): string => {
    if (author.anonymous) {
        return author.nickname || author.name || (author.mine ? '익명(나)' : '익명');
    }

    return author.nickname || author.name;
};

const getCommentVerdictCopy = (verdict: TribunalVoteChoice | null): string | null => {
    if (verdict === 'GUILTY') return '유죄';
    if (verdict === 'NOT_GUILTY') return '무죄';
    return null;
};

const escapeRegExp = (value: string): string =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeChatType = (message: TribunalReplayMessage): ReplayBubbleTone => {
    if (message.kind === 'SYSTEM') return 'SYSTEM';

    const upper = (message.chatType ?? 'CHAT').toUpperCase();

    if (upper.includes('MEGAPHONE')) return 'MEGAPHONE';
    if (upper.includes('MAFIACHAT')) return 'MAFIACHAT';
    if (upper.includes('GHOSTCHAT')) return 'GHOSTCHAT';
    if (upper.includes('WITCHCHAT')) return 'WITCHCHAT';
    if (upper.includes('MAGICIANCHAT')) return 'MAGICIANCHAT';
    if (upper.includes('LOVERCHAT')) return 'LOVERCHAT';
    if (upper.includes('CULT_LEADER')) return 'CULT_LEADER';
    return 'CHAT';
};

const buttonBase = css`
    min-height: 42px;
    padding: ${({theme}) => `${theme.spacing.sm} ${theme.spacing.lg}`};
    border-radius: ${({theme}) => theme.radii.pill};
    border: 1px solid ${({theme}) => theme.colors.border};
    font-size: ${({theme}) => theme.typography.sizes.sm};
    font-weight: ${({theme}) => theme.typography.weights.semibold};
    cursor: pointer;
    transition: transform ${({theme}) => theme.transitions.snappy},
    background ${({theme}) => theme.transitions.default},
    border-color ${({theme}) => theme.transitions.default},
    opacity ${({theme}) => theme.transitions.default};

    &:hover {
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        transform: none;
    }
`;

const PageStack = styled.div`
    display: grid;
    gap: ${({theme}) => theme.spacing.lg};
    width: 100%;
`;

const BoardCard = styled.section`
    display: grid;
    gap: ${({theme}) => theme.spacing.lg};
    border-radius: ${({theme}) => theme.radii.lg};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surface};
    padding: clamp(20px, 2.5vw, 30px);
    box-shadow: ${({theme}) => theme.shadows.soft};
`;

const BoardHeader = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: ${({theme}) => theme.spacing.md};
    align-items: center;
`;

const TitleRow = styled.div`
    display: grid;
    gap: ${({theme}) => theme.spacing.xs};
`;

const Title = styled.h3`
    margin: 0;
    color: ${({theme}) => theme.colors.textPrimary};
    font-size: clamp(1.15rem, 2vw, 1.5rem);
`;

const MetaText = styled.p`
    margin: 0;
    color: ${({theme}) => theme.colors.textSubtle};
    font-size: ${({theme}) => theme.typography.sizes.xs};
`;

const ButtonRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({theme}) => theme.spacing.sm};
`;

const PrimaryButton = styled.button.attrs({type: 'button'})`
    ${buttonBase};
    background: linear-gradient(135deg, ${({theme}) => theme.colors.accent}, ${({theme}) => theme.colors.accentAlt});
    border-color: transparent;
    color: #081018;
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

const DangerButton = styled.button.attrs({type: 'button'})`
    ${buttonBase};
    background: rgba(226, 82, 82, 0.14);
    border-color: rgba(226, 82, 82, 0.36);
    color: #ffb3b3;
`;

const TinyButton = styled.button.attrs({type: 'button'})`
    ${buttonBase};
    min-height: auto;
    padding: ${({theme}) => `${theme.spacing.xs} ${theme.spacing.sm}`};
    background: transparent;
    color: ${({theme}) => theme.colors.textSecondary};
`;

const StatusBox = styled.div<{ $tone: StatusTone }>`
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
`;

const Toolbar = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: ${({theme}) => theme.spacing.md};
    align-items: center;

    @media (max-width: ${({theme}) => theme.breakpoints.md}px) {
        grid-template-columns: 1fr;
    }
`;

const SearchRow = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 320px) auto;
    gap: ${({theme}) => theme.spacing.sm};
    align-items: center;

    @media (max-width: ${({theme}) => theme.breakpoints.md}px) {
        grid-template-columns: 1fr;
    }
`;

const CountText = styled.span`
    color: ${({theme}) => theme.colors.textSubtle};
    font-size: ${({theme}) => theme.typography.sizes.xs};
`;

const PaginationRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: ${({theme}) => theme.spacing.sm};
`;

const TableWrap = styled.div`
    border-radius: ${({theme}) => theme.radii.md};
    border: 1px solid ${({theme}) => theme.colors.border};
    overflow: hidden;
    background: ${({theme}) => theme.colors.surfaceMuted};

    @media (max-width: ${CASE_LIST_STACK_BREAKPOINT}px) {
        display: none;
    }
`;

const BoardTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;

    th {
        text-align: left;
        padding: ${({theme}) => `${theme.spacing.sm} ${theme.spacing.md}`};
        color: ${({theme}) => theme.colors.textSecondary};
        font-size: ${({theme}) => theme.typography.sizes.xs};
        letter-spacing: 0.04em;
        text-transform: uppercase;
        background: rgba(255, 255, 255, 0.03);
        border-bottom: 1px solid ${({theme}) => theme.colors.border};
        white-space: nowrap;
    }

    td {
        padding: ${({theme}) => `${theme.spacing.md} ${theme.spacing.md}`};
        color: ${({theme}) => theme.colors.textPrimary};
        border-bottom: 1px solid ${({theme}) => theme.colors.borderMuted};
        vertical-align: top;
    }

    tbody tr:last-child td {
        border-bottom: none;
    }
`;

const CaseRow = styled.tr<{ $active: boolean }>`
    background: ${({$active}) => $active ? 'rgba(255, 95, 109, 0.08)' : 'transparent'};
    cursor: pointer;
    transition: background ${({theme}) => theme.transitions.default};

    &:hover {
        background: rgba(255, 255, 255, 0.04);
    }
`;

const CasePlayer = styled.div`
    display: grid;
    gap: ${({theme}) => theme.spacing.xs};
`;

const CaseNickname = styled.strong`
    color: ${({theme}) => theme.colors.textPrimary};
`;

const CaseAuthor = styled.span`
    color: ${({theme}) => theme.colors.textSubtle};
    font-size: ${({theme}) => theme.typography.sizes.xs};
`;

const Badge = styled.span<{ $tone?: 'default' | 'danger' | 'success' | 'warning' }>`
    display: inline-flex;
    width: fit-content;
    align-items: center;
    gap: ${({theme}) => theme.spacing.xs};
    padding: ${({theme}) => `${theme.spacing.xs} ${theme.spacing.sm}`};
    border-radius: ${({theme}) => theme.radii.pill};
    border: 1px solid ${({theme, $tone}) => $tone === 'danger'
            ? 'rgba(255, 107, 107, 0.35)'
            : $tone === 'success'
                ? 'rgba(91, 228, 155, 0.35)'
                : $tone === 'warning'
                    ? 'rgba(255, 199, 95, 0.35)'
                    : theme.colors.border};
    background: ${({theme, $tone}) => $tone === 'danger'
            ? 'rgba(255, 107, 107, 0.1)'
            : $tone === 'success'
                ? 'rgba(91, 228, 155, 0.1)'
                : $tone === 'warning'
                    ? 'rgba(255, 199, 95, 0.1)'
                    : theme.colors.surface};
    color: ${({theme}) => theme.colors.textPrimary};
    font-size: ${({theme}) => theme.typography.sizes.xs};
    white-space: nowrap;
`;

const VoteStatusCell = styled.div<{ $compact?: boolean }>`
    display: grid;
    gap: ${({$compact}) => $compact ? '6px' : '8px'};
    min-width: 0;
`;

const VoteStatusTrack = styled.div<{ $compact?: boolean }>`
    width: 100%;
    height: ${({$compact}) => $compact ? '8px' : '10px'};
    display: flex;
    overflow: hidden;
    border-radius: ${({theme}) => theme.radii.pill};
    background: ${({theme}) => theme.colors.surfaceMuted};
    border: 1px solid ${({theme}) => theme.colors.border};
`;

const VoteStatusSegment = styled.div<{ $tone: 'danger' | 'success'; $width: number }>`
    width: ${({$width}) => `${$width}%`};
    min-width: ${({$width}) => ($width > 0 ? '6px' : '0')};
    background: ${({$tone}) => $tone === 'danger' ? '#e25252' : '#46b96b'};
`;

const VoteStatusLegend = styled.div<{ $compact?: boolean }>`
    display: flex;
    justify-content: ${({$compact}) => $compact ? 'flex-start' : 'space-between'};
    flex-wrap: wrap;
    gap: ${({theme}) => theme.spacing.sm};
    font-size: ${({theme, $compact}) => $compact ? theme.typography.sizes.xs : theme.typography.sizes.xs};
    color: ${({theme}) => theme.colors.textSecondary};
`;

const VoteStatusItem = styled.span<{ $tone: 'danger' | 'success'; $compact?: boolean }>`
    color: ${({$tone}) => $tone === 'danger' ? '#ff8b8b' : '#8fe3aa'};
    white-space: ${({$compact}) => $compact ? 'normal' : 'nowrap'};
`;

const VoteStatusEmpty = styled.span<{ $compact?: boolean }>`
    color: ${({theme}) => theme.colors.textSubtle};
    font-size: ${({theme}) => theme.typography.sizes.xs};
`;

const MobileCaseList = styled.div`
    display: none;

    @media (max-width: ${CASE_LIST_STACK_BREAKPOINT}px) {
        display: grid;
        gap: ${({theme}) => theme.spacing.sm};
    }
`;

const MobileCaseCard = styled.button.attrs({type: 'button'})`
    width: 100%;
    display: grid;
    gap: ${({theme}) => theme.spacing.sm};
    padding: ${({theme}) => theme.spacing.md};
    border-radius: ${({theme}) => theme.radii.md};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surfaceMuted};
    color: ${({theme}) => theme.colors.textPrimary};
    text-align: left;
    cursor: pointer;
`;

const MobileCaseTopRow = styled.div`
    display: flex;
    justify-content: space-between;
    gap: ${({theme}) => theme.spacing.sm};
    align-items: flex-start;
`;

const MobileCaseId = styled.span`
    color: ${({theme}) => theme.colors.textSubtle};
    font-size: ${({theme}) => theme.typography.sizes.xs};
`;

const MobileCaseMetaGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${({theme}) => theme.spacing.sm};
`;

const MobileCaseMetaItem = styled.div`
    display: grid;
    gap: 2px;
`;

const MobileCaseMetaLabel = styled.span`
    color: ${({theme}) => theme.colors.textSubtle};
    font-size: ${({theme}) => theme.typography.sizes.xs};
`;

const MobileCaseMetaValue = styled.span`
    color: ${({theme}) => theme.colors.textPrimary};
    font-size: ${({theme}) => theme.typography.sizes.sm};
    font-weight: ${({theme}) => theme.typography.weights.semibold};
`;

const EmptyState = styled.div`
    padding: ${({theme}) => theme.spacing.xl};
    border-radius: ${({theme}) => theme.radii.md};
    border: 1px dashed ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surfaceMuted};
    color: ${({theme}) => theme.colors.textSecondary};
    line-height: ${({theme}) => theme.typography.lineHeights.relaxed};
`;

const ArticleCard = styled.section`
    display: grid;
    gap: ${({theme}) => theme.spacing.lg};
    border-radius: ${({theme}) => theme.radii.lg};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surface};
    padding: clamp(22px, 2.5vw, 32px);
    box-shadow: ${({theme}) => theme.shadows.soft};
`;

const ArticleHeader = styled.div`
    display: grid;
    gap: ${({theme}) => theme.spacing.sm};
`;

const ArticleMetaRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({theme}) => theme.spacing.xs};
`;

const ArticleTitle = styled.h3`
    margin: 0;
    color: ${({theme}) => theme.colors.textPrimary};
    font-size: clamp(1.4rem, 2vw, 1.9rem);
`;

const ArticleSubtitle = styled.p`
    margin: 0;
    color: ${({theme}) => theme.colors.textSecondary};
    font-size: ${({theme}) => theme.typography.sizes.sm};
`;

const ArticleBody = styled.div`
    color: ${({theme}) => theme.colors.textSecondary};
    line-height: ${({theme}) => theme.typography.lineHeights.relaxed};
    white-space: pre-line;
`;

const LinkGrid = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({theme}) => theme.spacing.sm};
`;

const ExternalLink = styled.a`
    ${buttonBase};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    background: ${({theme}) => theme.colors.surfaceMuted};
    color: ${({theme}) => theme.colors.textPrimary};
`;

const Divider = styled.hr`
    width: 100%;
    border: none;
    border-top: 1px solid ${({theme}) => theme.colors.border};
    margin: 0;
`;

const SectionCard = styled.section`
    display: grid;
    gap: ${({theme}) => theme.spacing.md};
    padding: ${({theme}) => theme.spacing.lg};
    border-radius: ${({theme}) => theme.radii.md};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surfaceMuted};
`;

const SectionHeader = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: ${({theme}) => theme.spacing.md};
    align-items: center;
`;

const SectionTitle = styled.h4`
    margin: 0;
    color: ${({theme}) => theme.colors.textPrimary};
    font-size: ${({theme}) => theme.typography.sizes.lg};
`;

const SectionHint = styled.p`
    margin: 0;
    color: ${({theme}) => theme.colors.textSubtle};
    font-size: ${({theme}) => theme.typography.sizes.xs};
`;

const VoteGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${({theme}) => theme.spacing.md};

    @media (max-width: ${({theme}) => theme.breakpoints.sm}px) {
        grid-template-columns: 1fr;
    }
`;

const VoteCard = styled.button.attrs({type: 'button'})<{ $tone: 'danger' | 'success'; $active: boolean }>`
    display: grid;
    gap: ${({theme}) => theme.spacing.xs};
    padding: ${({theme}) => theme.spacing.md};
    border-radius: ${({theme}) => theme.radii.md};
    border: 1px solid ${({theme, $tone, $active}) => {
        if ($active) {
            return $tone === 'danger' ? theme.colors.danger : theme.colors.success;
        }
        return $tone === 'danger'
            ? 'rgba(255, 107, 107, 0.28)'
            : 'rgba(91, 228, 155, 0.28)';
    }};
    background: ${({theme, $tone, $active}) => {
        if ($active) {
            return $tone === 'danger' ? 'rgba(255, 107, 107, 0.16)' : 'rgba(91, 228, 155, 0.16)';
        }
        return theme.colors.surface;
    }};
    color: ${({theme}) => theme.colors.textPrimary};
    text-align: left;
    cursor: pointer;
    transition: transform ${({theme}) => theme.transitions.snappy},
    border-color ${({theme}) => theme.transitions.default},
    background ${({theme}) => theme.transitions.default};

    &:hover {
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;

const VoteNumber = styled.strong`
    color: ${({theme}) => theme.colors.textPrimary};
    font-size: clamp(1.4rem, 2.3vw, 2rem);
`;

const VoteHint = styled.p`
    margin: 0;
    color: ${({theme}) => theme.colors.textSubtle};
    font-size: ${({theme}) => theme.typography.sizes.xs};
`;

const FilterRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({theme}) => theme.spacing.sm};
    align-items: center;
`;

const FilterChip = styled.button.attrs({type: 'button'})<{ $active: boolean }>`
    ${buttonBase};
    min-height: auto;
    padding: ${({theme}) => `${theme.spacing.xs} ${theme.spacing.md}`};
    background: ${({theme, $active}) => $active ? theme.colors.surface : 'transparent'};
    border-color: ${({theme, $active}) => $active ? theme.colors.accent : theme.colors.border};
    color: ${({theme}) => theme.colors.textPrimary};
`;

const ReplayStage = styled.div`
    display: grid;
    gap: ${({theme}) => theme.spacing.md};
    padding: ${({theme}) => theme.spacing.lg};
    border-radius: ${({theme}) => theme.radii.md};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: #15181d;
`;

const ReplayStream = styled.div`
    display: grid;
    gap: ${({theme}) => theme.spacing.md};
    max-height: 640px;
    overflow-y: auto;
    padding-right: ${({theme}) => theme.spacing.xs};
`;

const ReplaySystemMessage = styled.div<{ $highlighted: boolean }>`
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 6px 10px;
    border-radius: ${({theme}) => theme.radii.md};
    background: ${({$highlighted}) => $highlighted ? 'rgba(255, 214, 102, 0.22)' : 'rgba(0, 0, 0, 0.42)'};
    color: #db2929;
    font-size: ${({theme}) => theme.typography.sizes.sm};
    font-weight: ${({theme}) => theme.typography.weights.semibold};
    text-align: center;
    box-shadow: ${({$highlighted}) => $highlighted ? '0 0 0 1px rgba(255, 214, 102, 0.55)' : 'none'};
`;

const ReplayRow = styled.div<{ $highlighted: boolean }>`
    display: flex;
    gap: ${({theme}) => theme.spacing.md};
    align-items: flex-start;
    padding: 6px 8px;
    border-radius: ${({theme}) => theme.radii.md};
    background: ${({$highlighted}) => $highlighted ? 'rgba(255, 214, 102, 0.12)' : 'transparent'};
    box-shadow: ${({$highlighted}) => $highlighted ? '0 0 0 1px rgba(255, 214, 102, 0.45)' : 'none'};
`;

const ReplayProfileColumn = styled.div`
    width: 56px;
    min-width: 56px;
    display: flex;
    justify-content: center;
`;

const ReplayProfileFrame = styled.div`
    width: 56px;
    height: 56px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 14px;
`;

const ReplayJobIcon = styled.img`
    position: absolute;
    inset: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 14px;
`;

const ReplayProfileFallback = styled.div`
    width: 56px;
    height: 56px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.08);
    color: ${({theme}) => theme.colors.textPrimary};
    font-weight: ${({theme}) => theme.typography.weights.bold};
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.32);
`;

const ReplayContentColumn = styled.div`
    display: grid;
    gap: ${({theme}) => theme.spacing.xs};
    min-width: 0;
`;

const ReplaySpeakerName = styled.div`
    color: #ffffff;
    font-size: ${({theme}) => theme.typography.sizes.sm};
    font-weight: ${({theme}) => theme.typography.weights.semibold};
`;

const ReplayBubbleStack = styled.div`
    display: grid;
    gap: 8px;
    justify-items: start;
`;

const ReplayBubble = styled.div<{ $tone: ReplayBubbleTone; $isFirst: boolean }>`
    position: relative;
    max-width: min(100%, 360px);
    padding: ${({theme}) => `${theme.spacing.sm} ${theme.spacing.md}`};
    border-radius: 10px;
    font-size: ${({theme}) => theme.typography.sizes.sm};
    line-height: ${({theme}) => theme.typography.lineHeights.relaxed};
    word-break: break-word;
    white-space: pre-line;

    ${({$tone}) => {
        if ($tone === 'MAFIACHAT') {
            return css`
                background: #141517;
                border: 1px solid #901a1a;
                color: #db2929;
            `;
        }
        if ($tone === 'GHOSTCHAT') {
            return css`
                background: rgba(209, 209, 209, 0.5);
                border: 1px solid rgba(209, 209, 209, 0.3);
                color: #ffffff;
            `;
        }
        if ($tone === 'WITCHCHAT') {
            return css`
                background: #141517;
                border: 1px solid #c187e0;
                color: #dbacf5;
            `;
        }
        if ($tone === 'MAGICIANCHAT') {
            return css`
                background: #e2d9f8;
                border: 1px solid #6f7cde;
                color: #000000;
            `;
        }
        if ($tone === 'LOVERCHAT') {
            return css`
                background: #f6f8fb;
                border: 1px solid #f279aa;
                color: #000000;
            `;
        }
        if ($tone === 'CULT_LEADER') {
            return css`
                background: #141517;
                border: 1px solid #ad931c;
                color: #dec254;
            `;
        }
        if ($tone === 'MEGAPHONE') {
            return css`
                min-width: 180px;
                padding: 8px 12px 10px 12px;
                border-style: solid;
                border-width: 16px 18px 20px 25px;
                border-image-source: url('https://mafia42.com/chat/chats/room_balloon_megaphone.svg');
                border-image-slice: 25 18 20 25 fill;
                border-image-width: 16px;
                border-image-outset: 0.3rem;
                background: transparent;
                color: #ffffff;
            `;
        }
        return css`
            background: #e3e4e7;
            border: 1px solid #e3e4e7;
            color: #000000;
        `;
    }}

    ${({$isFirst, $tone}) => $isFirst && $tone !== 'MEGAPHONE' && css`
        &::before {
            content: '';
            position: absolute;
            top: 16px;
            left: -12px;
            width: 0;
            height: 0;
            border-top: 10px solid transparent;
            border-bottom: 10px solid transparent;
            border-right: 12px solid ${$tone === 'MAFIACHAT'
                    ? '#901a1a'
                    : $tone === 'GHOSTCHAT'
                        ? 'rgba(209, 209, 209, 0.3)'
                        : $tone === 'WITCHCHAT'
                            ? '#c187e0'
                            : $tone === 'MAGICIANCHAT'
                                ? '#6f7cde'
                                : $tone === 'LOVERCHAT'
                                    ? '#f279aa'
                                    : $tone === 'CULT_LEADER'
                                        ? '#ad931c'
                                        : '#e3e4e7'};
        }

        &::after {
            content: '';
            position: absolute;
            top: 17px;
            left: -10px;
            width: 0;
            height: 0;
            border-top: 9px solid transparent;
            border-bottom: 9px solid transparent;
            border-right: 11px solid ${$tone === 'MAFIACHAT'
                    ? '#141517'
                    : $tone === 'GHOSTCHAT'
                        ? 'rgba(209, 209, 209, 0.5)'
                        : $tone === 'WITCHCHAT'
                            ? '#141517'
                            : $tone === 'MAGICIANCHAT'
                                ? '#e2d9f8'
                                : $tone === 'LOVERCHAT'
                                    ? '#f6f8fb'
                                    : $tone === 'CULT_LEADER'
                                        ? '#141517'
                                        : '#e3e4e7'};
        }
    `}
`;

const ReplayParticipants = styled.div`
    display: grid;
    gap: ${({theme}) => theme.spacing.sm};
`;

const ReplayParticipantsToggle = styled.button.attrs({type: 'button'})<{ $expanded: boolean }>`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({theme}) => theme.spacing.md};
    padding: ${({theme}) => `${theme.spacing.sm} ${theme.spacing.md}`};
    border-radius: ${({theme}) => theme.radii.md};
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: ${({$expanded}) => $expanded ? 'rgba(0, 0, 0, 0.34)' : 'rgba(0, 0, 0, 0.24)'};
    color: #ffffff;
    cursor: pointer;
    text-align: left;
    transition: background ${({theme}) => theme.transitions.default}, border-color ${({theme}) => theme.transitions.default};

    &:hover {
        background: rgba(0, 0, 0, 0.4);
        border-color: rgba(255, 255, 255, 0.16);
    }
`;

const ReplayParticipantsToggleCopy = styled.div`
    display: grid;
    gap: 4px;
    min-width: 0;
`;

const ReplayParticipantsToggleTitle = styled.div`
    color: #ffffff;
    font-size: ${({theme}) => theme.typography.sizes.sm};
    font-weight: ${({theme}) => theme.typography.weights.semibold};
`;

const ReplayParticipantsToggleMeta = styled.div`
    color: rgba(255, 255, 255, 0.68);
    font-size: ${({theme}) => theme.typography.sizes.xs};
`;

const ReplayParticipantsToggleIcon = styled.span<{ $expanded: boolean }>`
    color: rgba(255, 255, 255, 0.82);
    font-size: ${({theme}) => theme.typography.sizes.sm};
    transform: rotate(${({$expanded}) => $expanded ? '180deg' : '0deg'});
    transition: transform ${({theme}) => theme.transitions.snappy};
`;

const ReplayParticipantsPreview = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({theme}) => theme.spacing.xs};
`;

const ReplayParticipantChip = styled.div`
    display: inline-flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing.xs};
    padding: ${({theme}) => `${theme.spacing.xs} ${theme.spacing.sm}`};
    border-radius: ${({theme}) => theme.radii.pill};
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.24);
    color: rgba(255, 255, 255, 0.82);
    font-size: ${({theme}) => theme.typography.sizes.xs};

    ${ReplayProfileFrame},
    ${ReplayProfileFallback} {
        width: 24px;
        height: 24px;
        min-width: 24px;
        border-radius: 8px;
        box-shadow: none;
    }

    ${ReplayJobIcon} {
        border-radius: 8px;
    }
`;

const ReplayParticipantChipText = styled.span`
    white-space: nowrap;
`;

const ReplayParticipantsRail = styled.div`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: ${({theme}) => theme.spacing.sm};

    @media (max-width: ${({theme}) => theme.breakpoints.md}px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
`;

const ReplayParticipantCard = styled.div`
    display: grid;
    justify-items: center;
    gap: 6px;
    padding: ${({theme}) => theme.spacing.sm};
    border-radius: ${({theme}) => theme.radii.md};
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(0, 0, 0, 0.26);
    text-align: center;
`;

const ReplayParticipantName = styled.div`
    color: #ffffff;
    font-size: ${({theme}) => theme.typography.sizes.xs};
    font-weight: ${({theme}) => theme.typography.weights.semibold};
`;

const ReplayParticipantPick = styled.div`
    color: rgba(255, 255, 255, 0.72);
    font-size: ${({theme}) => theme.typography.sizes.xs};
`;

const SearchHighlight = styled.mark`
    padding: 0 2px;
    border-radius: 4px;
    background: rgba(255, 214, 102, 0.95);
    color: #1b1b1b;
`;

const CommentComposer = styled.div`
    display: grid;
    gap: ${({theme}) => theme.spacing.sm};

    > ${ButtonRow} {
        width: 100%;
        justify-content: flex-end;
        align-items: center;

        > label:first-child {
            margin-right: auto;
        }
    }
`;

const ComposerActionBar = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: ${({theme}) => theme.spacing.sm};
`;

const ComposerActionButtons = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: ${({theme}) => theme.spacing.sm};
    margin-left: auto;
`;

const ComposerOptionRow = styled.label`
    display: inline-flex;
    width: fit-content;
    align-items: center;
    gap: ${({theme}) => theme.spacing.xs};
    cursor: pointer;
    color: ${({theme}) => theme.colors.textSecondary};
    font-size: ${({theme}) => theme.typography.sizes.sm};
    padding-left: 2px;
`;

const ComposerOptionCheckbox = styled.input.attrs({type: 'checkbox'})`
    width: 16px;
    height: 16px;
    margin: 0;
    accent-color: ${({theme}) => theme.colors.accent};
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
    background: ${({theme, $isReply}) => $isReply ? theme.colors.surface : theme.colors.surfaceElevated};
    margin-left: ${({theme, $isReply}) => $isReply ? theme.spacing.lg : '0'};
`;

const CommentHeader = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: ${({theme}) => theme.spacing.sm};
    align-items: center;
`;

const CommentMeta = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({theme}) => theme.spacing.xs};
    align-items: center;
`;

const CommentIdentity = styled.div`
    display: grid;
    gap: 6px;
    min-width: 0;
`;

const CommentIdentityRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${({theme}) => theme.spacing.xs};
    min-width: 0;
`;

const CommentAuthor = styled.strong`
    color: ${({theme}) => theme.colors.textPrimary};
`;

const CommentNameplate = styled.span<{ $tier: RankTier }>`
    ${({$tier}) => {
        const theme = RANK_PLATE_THEMES[$tier];
        return css`
            position: relative;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            max-width: min(100%, 320px);
            min-height: 30px;
            padding: 4px 12px;
            border-radius: 12px;
            border: 1px solid ${theme.border};
            background: ${theme.background};
            color: ${theme.text};
            box-shadow:
                inset 0 1px 0 rgba(255, 255, 255, 0.32),
                inset 0 -1px 0 rgba(0, 0, 0, 0.28),
                0 6px 14px ${theme.shadow};
            overflow: hidden;

            &::before {
                content: '';
                position: absolute;
                inset: 1px;
                border-radius: 10px;
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.2), transparent 42%, rgba(0, 0, 0, 0.08));
                pointer-events: none;
            }

            &::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 12px;
                right: 12px;
                height: 1px;
                background: linear-gradient(90deg, transparent, ${theme.accent}, transparent);
                opacity: 0.35;
                transform: translateY(-50%);
                pointer-events: none;
            }
        `;
    }}
`;

const CommentNameplateName = styled.span`
    position: relative;
    z-index: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: ${({theme}) => theme.typography.sizes.sm};
    font-weight: ${({theme}) => theme.typography.weights.semibold};
`;

const CommentNameplateRank = styled.span<{ $tier: RankTier }>`
    ${({$tier}) => {
        const theme = RANK_PLATE_THEMES[$tier];
        return css`
            position: relative;
            z-index: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 1px 7px;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            background: rgba(0, 0, 0, 0.18);
            color: ${theme.accent};
            font-size: 11px;
            font-weight: ${({theme: appTheme}) => appTheme.typography.weights.bold};
            white-space: nowrap;
            flex-shrink: 0;
        `;
    }}
`;

const CommentVerdictBadge = styled.span<{ $tone: 'danger' | 'success' | 'default' }>`
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    padding: 3px 9px;
    border-radius: 999px;
    border: 1px solid ${({$tone, theme}) => $tone === 'danger'
            ? 'rgba(226, 82, 82, 0.4)'
            : $tone === 'success'
                ? 'rgba(70, 185, 107, 0.4)'
                : theme.colors.border};
    background: ${({$tone, theme}) => $tone === 'danger'
            ? 'rgba(226, 82, 82, 0.12)'
            : $tone === 'success'
                ? 'rgba(70, 185, 107, 0.12)'
                : theme.colors.surfaceMuted};
    color: ${({$tone, theme}) => $tone === 'danger'
            ? '#ff9c9c'
            : $tone === 'success'
                ? '#92ebb0'
                : theme.colors.textSecondary};
    font-size: ${({theme}) => theme.typography.sizes.xs};
    font-weight: ${({theme}) => theme.typography.weights.semibold};
    white-space: nowrap;
`;

const CommentRankPoint = styled.span`
    color: ${({theme}) => theme.colors.textSecondary};
    font-size: ${({theme}) => theme.typography.sizes.xs};
    white-space: nowrap;
`;

const CommentTime = styled.span`
    color: ${({theme}) => theme.colors.textSubtle};
    font-size: ${({theme}) => theme.typography.sizes.xs};
`;

const CommentBody = styled.div`
    color: ${({theme}) => theme.colors.textSecondary};
    line-height: ${({theme}) => theme.typography.lineHeights.relaxed};
    white-space: pre-line;
    word-break: break-word;
`;

const CommentDeletedText = styled.div`
    color: ${({theme}) => theme.colors.textSubtle};
    line-height: ${({theme}) => theme.typography.lineHeights.relaxed};
`;

const CommentActionRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({theme}) => theme.spacing.xs};
`;

const StyledTextarea = styled.textarea`
    width: 100%;
    min-height: 132px;
    resize: vertical;
    border-radius: ${({theme}) => theme.radii.md};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surface};
    color: ${({theme}) => theme.colors.textPrimary};
    padding: ${({theme}) => theme.spacing.md};
    box-sizing: border-box;
    font: inherit;

    &::placeholder {
        color: ${({theme}) => theme.colors.textSubtle};
    }

    &:focus {
        outline: none;
        border-color: ${({theme}) => theme.colors.accent};
    }
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
`;

const LinkFieldRow = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: ${({theme}) => theme.spacing.sm};
    align-items: center;
`;

const PreviewSummary = styled.div`
    display: grid;
    gap: ${({theme}) => theme.spacing.md};
    padding: ${({theme}) => theme.spacing.md};
    border-radius: ${({theme}) => theme.radii.md};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surfaceMuted};
`;

const PreviewMetaGrid = styled.div`
    display: grid;
    gap: ${({theme}) => theme.spacing.sm};
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
`;

const PreviewMetaItem = styled.div`
    display: grid;
    gap: 4px;
`;

const PreviewMetaLabel = styled.span`
    color: ${({theme}) => theme.colors.textSubtle};
    font-size: ${({theme}) => theme.typography.sizes.xs};
`;

const PreviewMetaValue = styled.span`
    color: ${({theme}) => theme.colors.textPrimary};
    font-size: ${({theme}) => theme.typography.sizes.sm};
    font-weight: ${({theme}) => theme.typography.weights.semibold};
`;

const PreviewPlayerGrid = styled.div`
    display: grid;
    gap: ${({theme}) => theme.spacing.sm};
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
`;

const PreviewPlayerCard = styled.button.attrs({type: 'button'})<{ $active: boolean }>`
    display: grid;
    justify-items: center;
    gap: 8px;
    padding: ${({theme}) => theme.spacing.md};
    border-radius: ${({theme}) => theme.radii.md};
    border: 1px solid ${({theme, $active}) => $active ? theme.colors.accent : theme.colors.border};
    background: ${({theme, $active}) => $active ? theme.colors.surfaceElevated : theme.colors.surface};
    color: ${({theme}) => theme.colors.textPrimary};
    cursor: pointer;
    transition: transform ${({theme}) => theme.transitions.snappy},
    border-color ${({theme}) => theme.transitions.default},
    background ${({theme}) => theme.transitions.default};

    &:hover {
        transform: translateY(-1px);
    }
`;

const PreviewPlayerOrder = styled.span`
    color: ${({theme}) => theme.colors.textSubtle};
    font-size: ${({theme}) => theme.typography.sizes.xs};
`;

const ModalOverlay = styled.div`
    position: fixed;
    inset: 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: ${({theme}) => theme.spacing.lg};
    overflow-y: auto;
    background: rgba(5, 6, 10, 0.76);
    z-index: ${({theme}) => theme.zIndex.modal};
`;

const ModalSheet = styled.div`
    width: min(100%, 760px);
    margin: clamp(24px, 6vh, 72px) auto;
    max-height: min(88vh, 920px);
    overflow-y: auto;
    display: grid;
    gap: ${({theme}) => theme.spacing.lg};
    padding: clamp(20px, 3vw, 28px);
    border-radius: ${({theme}) => theme.radii.lg};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surface};
    box-shadow: 0 28px 64px rgba(0, 0, 0, 0.45);
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${({theme}) => theme.spacing.md};
`;

const ModalCloseButton = styled.button.attrs({type: 'button'})`
    ${buttonBase};
    min-width: 44px;
    min-height: 44px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: ${({theme}) => theme.colors.surfaceMuted};
    color: ${({theme}) => theme.colors.textPrimary};
`;

const parseCaseId = (value: string | null | undefined): number | null => {
    if (!value) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

function Tribunal() {
    const navigate = useNavigate();
    const params = useParams<{ caseId?: string }>();
    const [searchParams] = useSearchParams();
    const routeCaseId = useMemo(
        () => parseCaseId(params.caseId) ?? parseCaseId(searchParams.get('case')),
        [params.caseId, searchParams]
    );
    const [cases, setCases] = useState<TribunalCaseSummary[]>([]);
    const [selectedCase, setSelectedCase] = useState<TribunalCaseDetail | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [selectedCaseId, setSelectedCaseId] = useState<number | null>(routeCaseId);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => Boolean(readAccessToken()));
    const [viewerRole, setViewerRole] = useState<string | null>(null);
    const [listLoading, setListLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [caseSubmitting, setCaseSubmitting] = useState(false);
    const [busyKey, setBusyKey] = useState<string | null>(null);
    const [listError, setListError] = useState<string | null>(null);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [status, setStatus] = useState<StatusMessage | null>(null);
    const [isWriteOpen, setIsWriteOpen] = useState(false);
    const [caseForm, setCaseForm] = useState<CaseFormState>(defaultCaseForm);
    const [replayPreview, setReplayPreview] = useState<TribunalReplayPreview | null>(null);
    const [selectedPreviewOrder, setSelectedPreviewOrder] = useState<number | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [caseQuery, setCaseQuery] = useState('');
    const [messageSearch, setMessageSearch] = useState('');
    const [isParticipantsExpanded, setIsParticipantsExpanded] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [newCommentAnonymous, setNewCommentAnonymous] = useState(true);
    const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
    const [replyAnonymous, setReplyAnonymous] = useState<Record<number, boolean>>({});
    const [replyTargetId, setReplyTargetId] = useState<number | null>(null);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const [editingAnonymous, setEditingAnonymous] = useState(false);
    const deferredCaseQuery = useDeferredValue(caseQuery.trim().toLowerCase());
    const deferredMessageSearch = useDeferredValue(messageSearch.trim().toLowerCase());
    const isDetailPage = selectedCaseId !== null;
    const isAdmin = viewerRole === 'ROLE_ADMIN';
    const replayFocusRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const selectedPreviewPlayer = useMemo<TribunalReplayPreviewPlayer | null>(() => {
        if (!replayPreview || selectedPreviewOrder === null) return null;
        return replayPreview.players.find((player) => player.order === selectedPreviewOrder) ?? null;
    }, [replayPreview, selectedPreviewOrder]);

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
        if (!isLoggedIn) {
            setViewerRole(null);
            return;
        }

        const accessToken = readAccessToken();
        const roleFromToken = extractRoleFromToken(accessToken);
        setViewerRole(roleFromToken);
    }, [isLoggedIn]);

    useEffect(() => {
        setSelectedCaseId(routeCaseId);
    }, [routeCaseId]);

    useEffect(() => {
        setReplyTargetId(null);
        setReplyDrafts({});
        setReplyAnonymous({});
        setEditingCommentId(null);
        setEditingContent('');
        setEditingAnonymous(false);
        setNewCommentAnonymous(true);
        setIsParticipantsExpanded(true);
    }, [selectedCaseId]);

    useEffect(() => {
        if (!listError) return;
        setStatus({tone: 'danger', message: listError});
    }, [listError]);

    useEffect(() => {
        if (!detailError) return;
        setStatus({tone: 'danger', message: detailError});
    }, [detailError]);

    useEffect(() => {
        if (typeof document === 'undefined') return;

        if (isWriteOpen) {
            document.body.setAttribute('data-scroll-locked', 'true');
        } else {
            document.body.removeAttribute('data-scroll-locked');
        }

        return () => {
            document.body.removeAttribute('data-scroll-locked');
        };
    }, [isWriteOpen]);

    useEffect(() => {
        if (!isWriteOpen) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsWriteOpen(false);
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isWriteOpen]);

    const loadCases = useCallback(async (silent = false, page = 0) => {
        if (!silent) setListLoading(true);

        try {
            const result = await listTribunalCases({page, size: CASE_PAGE_SIZE});
            setCases(result.content);
            setCurrentPage(result.page);
            setTotalPages(result.totalPages);
            setTotalElements(result.totalElements);
            setListError(null);
            return result.content;
        } catch (error) {
            console.error(error);
            setListError(error instanceof Error ? error.message : '사건 목록을 불러오지 못했습니다.');
            return [];
        } finally {
            if (!silent) setListLoading(false);
        }
    }, []);

    const loadCaseDetail = useCallback(async (caseId: number, silent = false) => {
        if (!silent) setDetailLoading(true);

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
            if (!silent) setDetailLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadCases(false, currentPage);
    }, [currentPage, loadCases]);

    useEffect(() => {
        if (!selectedCaseId) {
            setSelectedCase(null);
            return;
        }

        void loadCaseDetail(selectedCaseId);
    }, [loadCaseDetail, selectedCaseId]);

    const visibleCases = useMemo(() => {
        if (deferredCaseQuery.length === 0) return cases;

        return cases.filter((item) => {
            const target = [
                item.nickname,
                String(item.id),
            ]
                .join(' ')
                .toLowerCase();

            return target.includes(deferredCaseQuery);
        });
    }, [cases, deferredCaseQuery]);

    const groupedMessages = useMemo<ReplayMessageGroup[]>(() => {
        if (!selectedCase) return [];

        const groups: ReplayMessageGroup[] = [];

        selectedCase.messages.forEach((message) => {
            const tone = normalizeChatType(message);
            const pick = resolvePickLabel(message, selectedCase);

            if (message.kind === 'SYSTEM') {
                groups.push({
                    key: message.id,
                    kind: 'SYSTEM',
                    speaker: message.speaker,
                    pick,
                    round: message.round,
                    timestamp: message.timestamp,
                    chatType: 'SYSTEM',
                    frameImageUrl: null,
                    jobIconUrl: null,
                    lines: [message],
                });
                return;
            }

            const previous = groups[groups.length - 1];
            if (
                previous &&
                previous.kind === 'PLAYER' &&
                previous.speaker === message.speaker &&
                previous.chatType === tone
            ) {
                previous.lines.push(message);
                previous.timestamp = message.timestamp ?? previous.timestamp;
                previous.round = previous.round ?? message.round;
                previous.pick = previous.pick ?? pick;
                previous.frameImageUrl = previous.frameImageUrl ?? message.frameImageUrl;
                previous.jobIconUrl = previous.jobIconUrl ?? message.jobIconUrl;
                return;
            }

            groups.push({
                key: message.id,
                kind: 'PLAYER',
                speaker: message.speaker,
                pick,
                round: message.round,
                timestamp: message.timestamp,
                chatType: tone,
                frameImageUrl: message.frameImageUrl,
                jobIconUrl: message.jobIconUrl,
                lines: [message],
            });
        });

        return groups;
    }, [selectedCase]);

    const matchedGroupKeys = useMemo(() => {
        if (deferredMessageSearch.length === 0) return [];

        return groupedMessages
            .filter((group) => {
                const target = `${group.speaker} ${group.lines.map((line) => line.content).join(' ')} ${group.round ?? ''}`.toLowerCase();
                return target.includes(deferredMessageSearch);
            })
            .map((group) => group.key);
    }, [deferredMessageSearch, groupedMessages]);

    const matchedGroupKeySet = useMemo(
        () => new Set(matchedGroupKeys),
        [matchedGroupKeys]
    );

    useEffect(() => {
        if (deferredMessageSearch.length === 0) return;

        const firstKey = matchedGroupKeys[0];
        if (!firstKey) return;

        const node = replayFocusRefs.current[firstKey];
        if (!node) return;

        node.scrollIntoView({behavior: 'smooth', block: 'center'});
    }, [deferredMessageSearch, matchedGroupKeys]);

    const replayParticipants = useMemo<ReplayParticipant[]>(() => {
        if (!selectedCase) return [];

        const ordered = new Map<string, ReplayParticipant>();
        selectedCase.messages.forEach((message) => {
            if (message.kind !== 'PLAYER') return;

            const existing = ordered.get(message.speaker);
            const next: ReplayParticipant = {
                speaker: message.speaker,
                pick: resolvePickLabel(message, selectedCase),
                frameImageUrl: message.frameImageUrl,
                jobIconUrl: message.jobIconUrl,
                isDefendant: message.speaker === selectedCase.nickname,
            };

            if (!existing) {
                ordered.set(message.speaker, next);
                return;
            }

            ordered.set(message.speaker, {
                ...existing,
                pick: existing.pick ?? next.pick,
                frameImageUrl: existing.frameImageUrl ?? next.frameImageUrl,
                jobIconUrl: existing.jobIconUrl ?? next.jobIconUrl,
                isDefendant: existing.isDefendant || next.isDefendant,
            });
        });

        if (!ordered.has(selectedCase.nickname)) {
            ordered.set(selectedCase.nickname, {
                speaker: selectedCase.nickname,
                pick: getDisplayPickLabel(selectedCase.pick, selectedCase.pickName),
                frameImageUrl: null,
                jobIconUrl: null,
                isDefendant: true,
            });
        }

        return Array.from(ordered.values());
    }, [selectedCase]);

    const selectedCommentCount = useMemo(
        () => selectedCase ? countAllComments(selectedCase.comments) : 0,
        [selectedCase]
    );

    const selectCase = (caseId: number) => {
        startTransition(() => {
            setSelectedCaseId(caseId);
            navigate(`/재판소/${caseId}`);
        });
    };

    const goToCaseList = () => {
        startTransition(() => {
            setSelectedCaseId(null);
            setSelectedCase(null);
            navigate('/재판소');
        });
    };

    const changePage = (nextPage: number) => {
        if (nextPage < 0) return;
        if (totalPages > 0 && nextPage >= totalPages) return;

        startTransition(() => {
            setCurrentPage(nextPage);
        });
    };

    const updateCaseFormField = <K extends keyof CaseFormState>(key: K, value: CaseFormState[K]) => {
        setCaseForm((current) => ({
            ...current,
            [key]: value,
        }));

        if (key === 'replayUrl') {
            setReplayPreview(null);
            setSelectedPreviewOrder(null);
        }
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
                return {...current, cafeLinks: ['']};
            }

            return {
                ...current,
                cafeLinks: current.cafeLinks.filter((_, itemIndex) => itemIndex !== index),
            };
        });
    };

    const ensureLoggedIn = (actionLabel: string): boolean => {
        if (isLoggedIn) return true;
        setStatus({tone: 'info', message: `${actionLabel}은 로그인 후 사용할 수 있습니다.`});
        return false;
    };

    const openWriteModal = () => {
        if (!isLoggedIn) {
            setStatus({tone: 'info', message: '사건 등록은 로그인 후 사용할 수 있습니다.'});
            startGoogleLogin();
            return;
        }
        setIsWriteOpen(true);
    };

    const closeWriteModal = () => {
        setIsWriteOpen(false);
    };

    const handleReplayPreview = async () => {
        const replayUrl = caseForm.replayUrl.trim();

        if (!ensureLoggedIn('리플레이 확인')) return;

        if (!replayUrlPattern.test(replayUrl)) {
            setStatus({tone: 'danger', message: '마피아42 리플레이 링크를 정확히 입력해주세요.'});
            return;
        }

        setPreviewLoading(true);
        try {
            const preview = await previewTribunalReplay(replayUrl);
            setReplayPreview(preview);
            setSelectedPreviewOrder(null);

            if (preview.players.length === 0) {
                setStatus({tone: 'danger', message: '리플레이에서 플레이어 정보를 찾지 못했습니다.'});
                return;
            }

            setStatus({tone: 'success', message: '리플레이를 확인했습니다. 사건으로 등록할 플레이어를 선택해주세요.'});
        } catch (error) {
            console.error(error);
            setReplayPreview(null);
            setSelectedPreviewOrder(null);
            setStatus({tone: 'danger', message: error instanceof Error ? error.message : '리플레이 확인에 실패했습니다.'});
        } finally {
            setPreviewLoading(false);
        }
    };

    const handlePreviewPlayerSelect = (player: TribunalReplayPreviewPlayer) => {
        setSelectedPreviewOrder(player.order);
    };

    const handleCreateCase = async () => {
        const replayUrl = caseForm.replayUrl.trim();
        const description = caseForm.description.trim();
        const cafeLinks = caseForm.cafeLinks.map((item) => item.trim()).filter((item) => item.length > 0);

        if (!ensureLoggedIn('사건 등록')) return;

        if (!replayUrlPattern.test(replayUrl)) {
            setStatus({tone: 'danger', message: '마피아42 리플레이 링크를 정확히 입력해주세요.'});
            return;
        }

        if (!replayPreview) {
            setStatus({tone: 'danger', message: '먼저 리플레이 확인을 해주세요.'});
            return;
        }

        if (!selectedPreviewPlayer) {
            setStatus({tone: 'danger', message: '사건으로 등록할 플레이어를 선택해주세요.'});
            return;
        }

        if (!description) {
            setStatus({tone: 'danger', message: '설명을 입력해주세요.'});
            return;
        }

        setCaseSubmitting(true);
        try {
            const created = await createTribunalCase({
                replayUrl,
                nickname: selectedPreviewPlayer.nickname,
                pick: selectedPreviewPlayer.pick,
                description,
                cafeLinks,
            });

            setStatus({tone: 'success', message: '사건이 등록되었습니다.'});
            setCaseForm(defaultCaseForm());
            setReplayPreview(null);
            setSelectedPreviewOrder(null);
            setIsWriteOpen(false);

            const shouldResetPage = currentPage !== 0;
            if (shouldResetPage) {
                setCurrentPage(0);
            }

            const nextCases = shouldResetPage ? [] : await loadCases(true, 0);
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
            loadCases(true, currentPage),
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

        const content = (parentId ? replyDrafts[parentId] : newComment).trim();
        const anonymous = parentId ? (replyAnonymous[parentId] ?? true) : newCommentAnonymous;
        if (!content) {
            setStatus({tone: 'danger', message: '댓글 내용을 입력해주세요.'});
            return;
        }

        setBusyKey(parentId ? `reply-${parentId}` : 'comment-create');
        try {
            await createTribunalComment(selectedCaseId, content, parentId, anonymous);
            setStatus({tone: 'success', message: parentId ? '대댓글이 등록되었습니다.' : '댓글이 등록되었습니다.'});

            if (parentId) {
                setReplyDrafts((current) => ({...current, [parentId]: ''}));
                setReplyAnonymous((current) => ({...current, [parentId]: true}));
                setReplyTargetId(null);
            } else {
                setNewComment('');
                setNewCommentAnonymous(true);
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
        setEditingAnonymous(comment.author.anonymous);
        setReplyTargetId(null);
    };

    const handleCommentUpdate = async (comment: TribunalComment) => {
        if (!selectedCaseId) return;
        const content = editingContent.trim();

        if (!content) {
            setStatus({tone: 'danger', message: '수정할 내용을 입력해주세요.'});
            return;
        }

        setBusyKey(`edit-${comment.id}`);
        try {
            await updateTribunalComment(comment.id, content, comment.parentId, editingAnonymous);
            setStatus({tone: 'success', message: '댓글을 수정했습니다.'});
            setEditingCommentId(null);
            setEditingContent('');
            setEditingAnonymous(false);
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

    const handleCaseDelete = async () => {
        if (!selectedCase) return;
        if (!ensureLoggedIn('?ш굔 ??젣')) return;
        if (!isAdmin) {
            setStatus({tone: 'danger', message: '관리자만 사건을 삭제할 수 있습니다.'});
            return;
        }
        if (!window.confirm(`사건 #${selectedCase.id}를 삭제할까요?`)) return;

        setBusyKey(`case-delete-${selectedCase.id}`);
        try {
            await deleteTribunalCase(selectedCase.id);
            setSelectedCase(null);
            setSelectedCaseId(null);
            setDetailError(null);
            setStatus({tone: 'success', message: '사건을 삭제했습니다.'});
            navigate('/재판소', {replace: true});
            await loadCases(false, currentPage);
        } catch (error) {
            console.error(error);
            setStatus({tone: 'danger', message: error instanceof Error ? error.message : '사건 삭제에 실패했습니다.'});
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

    const renderReplayProfile = (
        speaker: string,
        _frameImageUrl: string | null,
        jobIconUrl: string | null
    ) => {
        if (!jobIconUrl) {
            return <ReplayProfileFallback>{speaker.slice(0, 1)}</ReplayProfileFallback>;
        }

        return (
            <ReplayProfileFrame>
                {jobIconUrl && <ReplayJobIcon src={jobIconUrl} alt="" />}
            </ReplayProfileFrame>
        );
    };

    const renderHighlightedText = (value: string, query: string) => {
        if (!query) return value;

        const normalizedQuery = query.trim();
        if (!normalizedQuery) return value;

        const matcher = new RegExp(`(${escapeRegExp(normalizedQuery)})`, 'ig');
        const parts = value.split(matcher);

        return parts.map((part, index) => (
            part.toLowerCase() === normalizedQuery.toLowerCase()
                ? <SearchHighlight key={`${part}-${index}`}>{part}</SearchHighlight>
                : <Fragment key={`${part}-${index}`}>{part}</Fragment>
        ));
    };

    const renderVoteStatus = (guiltyCount: number, notGuiltyCount: number, compact = false) => {
        const voteBreakdown = getVoteBreakdown(guiltyCount, notGuiltyCount);

        return (
            <VoteStatusCell $compact={compact}>
                <VoteStatusTrack
                    $compact={compact}
                    aria-label={`유죄 ${voteBreakdown.guiltyPercent}%, 무죄 ${voteBreakdown.notGuiltyPercent}%`}
                >
                    <VoteStatusSegment $tone="danger" $width={voteBreakdown.guiltyPercent} />
                    <VoteStatusSegment $tone="success" $width={voteBreakdown.notGuiltyPercent} />
                </VoteStatusTrack>
                {voteBreakdown.total > 0 ? (
                    <VoteStatusLegend $compact={compact}>
                        <VoteStatusItem $tone="danger" $compact={compact}>
                            유죄 {guiltyCount}표 ({voteBreakdown.guiltyPercent}%)
                        </VoteStatusItem>
                        <VoteStatusItem $tone="success" $compact={compact}>
                            무죄 {notGuiltyCount}표 ({voteBreakdown.notGuiltyPercent}%)
                        </VoteStatusItem>
                    </VoteStatusLegend>
                ) : (
                    <VoteStatusEmpty $compact={compact}>투표 없음</VoteStatusEmpty>
                )}
            </VoteStatusCell>
        );
    };

    const renderComment = (comment: TribunalComment, isReply = false) => {
        const isEditing = editingCommentId === comment.id;
        const replyDraft = replyDrafts[comment.id] ?? '';
        const replyIsAnonymous = replyAnonymous[comment.id] ?? true;
        const canReply = comment.parentId === null && !comment.deleted;
        const displayContent = comment.deleted ? '삭제된 댓글입니다.' : comment.content;
        const authorLabel = getTribunalAuthorLabel(comment.author);
        const authorRankTier = getRankTier(comment.author.rankPoint);
        const authorRankTheme = RANK_PLATE_THEMES[authorRankTier];
        const authorVerdictLabel = getCommentVerdictCopy(comment.authorVerdict);
        const authorVerdictTone =
            comment.authorVerdict === 'GUILTY'
                ? 'danger'
                : comment.authorVerdict === 'NOT_GUILTY'
                    ? 'success'
                    : 'default';
        const authorRankPointText = comment.author.rankPoint !== null && comment.author.rankPoint >= 0
            ? `${comment.author.rankPoint.toLocaleString()} RP`
            : null;

        return (
            <Fragment key={comment.id}>
                <CommentCard $isReply={isReply}>
                    <CommentHeader>
                        <CommentMeta>
                            <CommentIdentity>
                                <CommentIdentityRow>
                                    <CommentNameplate
                                        $tier={authorRankTier}
                                        title={authorRankPointText ?? undefined}
                                    >
                                        <CommentNameplateName>{authorLabel}</CommentNameplateName>
                                        <CommentNameplateRank $tier={authorRankTier}>
                                            {authorRankTheme.label}
                                        </CommentNameplateRank>
                                    </CommentNameplate>
                                    {authorRankPointText && (
                                        <CommentRankPoint>{authorRankPointText}</CommentRankPoint>
                                    )}
                                </CommentIdentityRow>
                                <CommentIdentityRow>
                                    <CommentVerdictBadge $tone={authorVerdictTone}>
                                        투표 {authorVerdictLabel ?? '없음'}
                                    </CommentVerdictBadge>
                                </CommentIdentityRow>
                            </CommentIdentity>
                            <CommentTime>{formatDateTime(comment.updatedAt ?? comment.createdAt)}</CommentTime>
                        </CommentMeta>
                        <CommentActionRow>
                            {!comment.deleted && (
                                <TinyButton onClick={() => handleToggleLike(comment.id)} disabled={busyKey === `like-${comment.id}`}>
                                    인정 {comment.likeCount}
                                </TinyButton>
                            )}
                            {canReply && (
                                <TinyButton onClick={() => {
                                    setReplyTargetId((current) => current === comment.id ? null : comment.id);
                                    setEditingCommentId(null);
                                }}>
                                    답글
                                </TinyButton>
                            )}
                            {!comment.deleted && comment.canEdit && (
                                <TinyButton onClick={() => startEditingComment(comment)}>
                                    수정
                                </TinyButton>
                            )}
                            {!comment.deleted && comment.canDelete && (
                                <TinyButton onClick={() => handleCommentDelete(comment.id)} disabled={busyKey === `delete-${comment.id}`}>
                                    삭제
                                </TinyButton>
                            )}
                        </CommentActionRow>
                    </CommentHeader>

                    {!comment.deleted && isEditing ? (
                        <CommentComposer>
                            <StyledTextarea
                                value={editingContent}
                                onChange={(event) => setEditingContent(event.target.value)}
                                placeholder="댓글을 수정하세요."
                            />
                            <ComposerOptionRow>
                                <ComposerOptionCheckbox
                                    checked={editingAnonymous}
                                    onChange={(event) => setEditingAnonymous(event.target.checked)}
                                />
                                익명으로 수정
                            </ComposerOptionRow>
                            <ButtonRow>
                                <PrimaryButton onClick={() => handleCommentUpdate(comment)} disabled={busyKey === `edit-${comment.id}`}>
                                    수정 저장
                                </PrimaryButton>
                                <GhostButton onClick={() => {
                                    setEditingCommentId(null);
                                    setEditingContent('');
                                    setEditingAnonymous(false);
                                }}>
                                    취소
                                </GhostButton>
                            </ButtonRow>
                        </CommentComposer>
                    ) : (
                        comment.deleted ? <CommentDeletedText>{displayContent}</CommentDeletedText> : <CommentBody>{displayContent}</CommentBody>
                    )}

                    {replyTargetId === comment.id && (
                        <CommentComposer>
                            <StyledTextarea
                                value={replyDraft}
                                onChange={(event) => setReplyDrafts((current) => ({...current, [comment.id]: event.target.value}))}
                                placeholder="답글을 입력하세요."
                            />
                            <ButtonRow>
                                <ComposerOptionRow>
                                    <ComposerOptionCheckbox
                                        checked={replyIsAnonymous}
                                        onChange={(event) => setReplyAnonymous((current) => ({...current, [comment.id]: event.target.checked}))}
                                    />
                                    익명으로 작성
                                </ComposerOptionRow>
                                <PrimaryButton onClick={() => handleCommentSubmit(comment.id)} disabled={busyKey === `reply-${comment.id}`}>
                                    답글 등록
                                </PrimaryButton>
                                <GhostButton onClick={() => {
                                    setReplyTargetId(null);
                                    setReplyAnonymous((current) => ({...current, [comment.id]: true}));
                                }}>
                                    닫기
                                </GhostButton>
                            </ButtonRow>
                        </CommentComposer>
                    )}
                </CommentCard>

                {comment.children.map((child) => renderComment(child, true))}
            </Fragment>
        );
    };

    return (
        <Layout>
            <ContentLayout gap={'24px'}>
                <CategoryTitle title="재판소" />

                <PageStack>
                    <BoardCard>
                        <BoardHeader>
                            <TitleRow>
                                <Title>재판소</Title>
                            </TitleRow>
                            <ButtonRow>
                                {!isLoggedIn && (
                                    <SecondaryButton onClick={startGoogleLogin}>
                                        로그인
                                    </SecondaryButton>
                                )}
                                {isDetailPage && (
                                    <SecondaryButton onClick={goToCaseList}>
                                        사건 목록
                                    </SecondaryButton>
                                )}
                                <SecondaryButton onClick={() => void (isDetailPage && selectedCaseId
                                    ? refreshSelectedCase(selectedCaseId)
                                    : loadCases(false, currentPage))}>
                                    새로고침
                                </SecondaryButton>
                                {isLoggedIn && (
                                    <PrimaryButton onClick={openWriteModal}>
                                        사건 등록
                                    </PrimaryButton>
                                )}
                            </ButtonRow>
                        </BoardHeader>

                        {!isLoggedIn && (
                            <StatusBox $tone="info">
                                목록과 상세 조회는 볼 수 있고, 사건 등록, 투표, 댓글은 로그인 후 사용할 수 있습니다.
                            </StatusBox>
                        )}
                    </BoardCard>

                    {!isDetailPage && (
                        <BoardCard>
                            <BoardHeader>
                                <TitleRow>
                                    <Title>사건 목록</Title>
                                </TitleRow>
                            </BoardHeader>

                            <Toolbar>
                                <SearchRow>
                                    <Input
                                        value={caseQuery}
                                        onChange={setCaseQuery}
                                        placeholder="닉네임, 사건 번호 검색"
                                        width="100%"
                                    />
                                    <CountText>총 {totalElements.toLocaleString()}건</CountText>
                                </SearchRow>
                            </Toolbar>

                            {listError && <StatusBox $tone="danger">{listError}</StatusBox>}

                            {listLoading ? (
                                <Spinner isLoading={true}/>
                            ) : (
                                <>
                                    {visibleCases.length > 0 ? (
                                        <>
                                            <TableWrap>
                                                <BoardTable>
                                                    <thead>
                                                    <tr>
                                                        <th>번호</th>
                                                        <th>피고인 닉네임 / 직업</th>
                                                        <th>조회수</th>
                                                        <th>현재 투표현황</th>
                                                        <th>댓글</th>
                                                        <th>등록일</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {visibleCases.map((item) => (
                                                        <CaseRow
                                                            key={item.id}
                                                            $active={false}
                                                            onClick={() => selectCase(item.id)}
                                                        >
                                                            <td>#{item.id}</td>
                                                            <td>
                                                                <CasePlayer>
                                                                    <CaseNickname>피고인 {item.nickname} / {getDisplayPickLabel(item.pick, item.pickName) ?? item.pick}</CaseNickname>
                                                                    <CaseAuthor>게시자 {item.author?.name ?? '-'}</CaseAuthor>
                                                                </CasePlayer>
                                                            </td>
                                                            <td>{item.viewCount.toLocaleString()}</td>
                                                            <td>{renderVoteStatus(item.guiltyCount, item.notGuiltyCount)}</td>
                                                            <td>{item.commentCount.toLocaleString()}</td>
                                                            <td>{formatDateTime(item.createdAt) ?? ''}</td>
                                                        </CaseRow>
                                                    ))}
                                                    </tbody>
                                                </BoardTable>
                                            </TableWrap>

                                            <MobileCaseList>
                                                {visibleCases.map((item) => (
                                                    <MobileCaseCard key={`mobile-${item.id}`} onClick={() => selectCase(item.id)}>
                                                        <MobileCaseTopRow>
                                                            <CasePlayer>
                                                                <MobileCaseId>#{item.id}</MobileCaseId>
                                                                <CaseNickname>피고인 {item.nickname} / {getDisplayPickLabel(item.pick, item.pickName) ?? item.pick}</CaseNickname>
                                                                <CaseAuthor>게시자 {item.author?.name ?? '-'}</CaseAuthor>
                                                            </CasePlayer>
                                                            <Badge>{formatDateTime(item.createdAt) ?? '-'}</Badge>
                                                        </MobileCaseTopRow>

                                                        {renderVoteStatus(item.guiltyCount, item.notGuiltyCount, true)}

                                                        <MobileCaseMetaGrid>
                                                            <MobileCaseMetaItem>
                                                                <MobileCaseMetaLabel>조회수</MobileCaseMetaLabel>
                                                                <MobileCaseMetaValue>{item.viewCount.toLocaleString()}</MobileCaseMetaValue>
                                                            </MobileCaseMetaItem>
                                                            <MobileCaseMetaItem>
                                                                <MobileCaseMetaLabel>댓글</MobileCaseMetaLabel>
                                                                <MobileCaseMetaValue>{item.commentCount.toLocaleString()}</MobileCaseMetaValue>
                                                            </MobileCaseMetaItem>
                                                            <MobileCaseMetaItem>
                                                                <MobileCaseMetaLabel>게시자</MobileCaseMetaLabel>
                                                                <MobileCaseMetaValue>{item.author?.name ?? '-'}</MobileCaseMetaValue>
                                                            </MobileCaseMetaItem>
                                                        </MobileCaseMetaGrid>
                                                    </MobileCaseCard>
                                                ))}
                                            </MobileCaseList>
                                        </>
                                    ) : (
                                        <EmptyState>조건에 맞는 사건이 없습니다.</EmptyState>
                                    )}

                                    {totalPages > 0 && (
                                        <PaginationRow>
                                            <CountText>{Math.max(currentPage + 1, 1)} / {Math.max(totalPages, 1)} 페이지</CountText>
                                            <ButtonRow>
                                                <GhostButton onClick={() => changePage(currentPage - 1)} disabled={currentPage <= 0 || listLoading}>
                                                    이전
                                                </GhostButton>
                                                <SecondaryButton
                                                    onClick={() => changePage(currentPage + 1)}
                                                    disabled={currentPage >= totalPages - 1 || listLoading}
                                                >
                                                    다음
                                                </SecondaryButton>
                                            </ButtonRow>
                                        </PaginationRow>
                                    )}
                                </>
                            )}
                        </BoardCard>
                    )}

                    {isDetailPage && detailLoading ? (
                        <BoardCard>
                            <Spinner isLoading={true}/>
                        </BoardCard>
                    ) : isDetailPage && detailError ? (
                        <BoardCard>
                            <StatusBox $tone="danger">{detailError}</StatusBox>
                        </BoardCard>
                    ) : isDetailPage && selectedCase ? (
                        <ArticleCard>
                            <ArticleHeader>
                                <ArticleMetaRow>
                                    <Badge>사건 #{selectedCase.id}</Badge>
                                    {formatDateTime(selectedCase.createdAt) && (
                                        <Badge>{formatDateTime(selectedCase.createdAt)}</Badge>
                                    )}
                                    <Badge>게시자 {selectedCase.author?.name ?? '-'}</Badge>
                                    <Badge>내 판결 {selectedCase.myVote === 'GUILTY' ? '유죄' : selectedCase.myVote === 'NOT_GUILTY' ? '무죄' : '없음'}</Badge>
                                    {selectedCase.gameType && <Badge>{selectedCase.gameType}</Badge>}
                                    {selectedCase.winnerTeam && <Badge>{selectedCase.winnerTeam}</Badge>}
                                    <Badge>조회 {selectedCase.viewCount.toLocaleString()}</Badge>
                                </ArticleMetaRow>
                                <ArticleTitle>
                                    피고인 {selectedCase.nickname} / {getDisplayPickLabel(selectedCase.pick, selectedCase.pickName) ?? selectedCase.pick}
                                </ArticleTitle>
                                <ArticleBody>{selectedCase.description || '설명 없음'}</ArticleBody>
                            </ArticleHeader>

                            <LinkGrid>
                                <ExternalLink href={selectedCase.replayUrl} target="_blank" rel="noreferrer">
                                    원본 리플레이
                                </ExternalLink>
                                <SecondaryButton onClick={() => void refreshSelectedCase(selectedCase.id)}>
                                    사건 새로고침
                                </SecondaryButton>
                                {isAdmin && (
                                    <DangerButton
                                        onClick={handleCaseDelete}
                                        disabled={busyKey === `case-delete-${selectedCase.id}`}
                                    >
                                        {busyKey === `case-delete-${selectedCase.id}` ? '삭제 중...' : '사건 삭제'}
                                    </DangerButton>
                                )}
                                {selectedCase.cafeLinks.map((link, index) => (
                                    <ExternalLink key={`${link.id ?? 'cafe'}-${index}`} href={link.url} target="_blank" rel="noreferrer">
                                        카페 글 {index + 1}
                                    </ExternalLink>
                                ))}
                            </LinkGrid>

                            <Divider />

                            <SectionCard>
                                <SectionHeader>
                                    <SectionTitle>리플레이 로그</SectionTitle>
                                    <SectionHint>
                                        {deferredMessageSearch.length > 0
                                            ? `${matchedGroupKeys.length.toLocaleString()}개 찾음`
                                            : `${groupedMessages.length.toLocaleString()}개 표시`}
                                    </SectionHint>
                                </SectionHeader>
                                <FilterRow>
                                    <Input
                                        value={messageSearch}
                                        onChange={setMessageSearch}
                                        placeholder="닉네임이나 채팅 키워드 검색"
                                        width="280px"
                                    />
                                </FilterRow>

                                {groupedMessages.length > 0 ? (
                                    <ReplayStage>
                                        <ReplayStream>
                                            {groupedMessages.map((group) => {
                                                const isHighlighted = matchedGroupKeySet.has(group.key);

                                                return group.kind === 'SYSTEM' ? (
                                                    <ReplaySystemMessage
                                                        key={group.key}
                                                        $highlighted={isHighlighted}
                                                        ref={(node) => {
                                                            replayFocusRefs.current[group.key] = node;
                                                        }}
                                                    >
                                                        {renderHighlightedText(group.lines[0]?.content ?? '', deferredMessageSearch)}
                                                    </ReplaySystemMessage>
                                                ) : (
                                                    <ReplayRow
                                                        key={group.key}
                                                        $highlighted={isHighlighted}
                                                        ref={(node) => {
                                                            replayFocusRefs.current[group.key] = node;
                                                        }}
                                                    >
                                                        <ReplayProfileColumn>
                                                            {renderReplayProfile(group.speaker, group.frameImageUrl, group.jobIconUrl)}
                                                        </ReplayProfileColumn>
                                                        <ReplayContentColumn>
                                                            <ReplaySpeakerName>{renderHighlightedText(group.speaker, deferredMessageSearch)}</ReplaySpeakerName>
                                                            <ReplayBubbleStack>
                                                                {group.lines.map((line, index) => (
                                                                    <ReplayBubble
                                                                        key={line.id}
                                                                        $tone={group.chatType}
                                                                        $isFirst={index === 0}
                                                                    >
                                                                        {renderHighlightedText(line.content, deferredMessageSearch)}
                                                                    </ReplayBubble>
                                                                ))}
                                                            </ReplayBubbleStack>
                                                        </ReplayContentColumn>
                                                    </ReplayRow>
                                                )
                                            })}
                                        </ReplayStream>

                                        <ReplayParticipants>
                                            <ReplayParticipantsToggle
                                                $expanded={isParticipantsExpanded}
                                                onClick={() => setIsParticipantsExpanded((current) => !current)}
                                                aria-expanded={isParticipantsExpanded}
                                            >
                                                <ReplayParticipantsToggleCopy>
                                                    <ReplayParticipantsToggleTitle>참여자 픽</ReplayParticipantsToggleTitle>
                                                    <ReplayParticipantsToggleMeta>
                                                        {replayParticipants.length.toLocaleString()}명 · {isParticipantsExpanded ? '접기' : '펼치기'}
                                                    </ReplayParticipantsToggleMeta>
                                                </ReplayParticipantsToggleCopy>
                                                <ReplayParticipantsToggleIcon $expanded={isParticipantsExpanded}>
                                                    {isParticipantsExpanded ? '-' : '+'}
                                                </ReplayParticipantsToggleIcon>
                                            </ReplayParticipantsToggle>
                                            <SectionHint>참여자 픽</SectionHint>
                                            {isParticipantsExpanded ? (
                                                <ReplayParticipantsRail>
                                                {replayParticipants.map((participant) => (
                                                    <ReplayParticipantCard key={participant.speaker}>
                                                        {renderReplayProfile(participant.speaker, participant.frameImageUrl, participant.jobIconUrl)}
                                                        <ReplayParticipantName>{participant.speaker}</ReplayParticipantName>
                                                        <ReplayParticipantPick>
                                                            {participant.isDefendant
                                                                ? `피고인 / ${translatePickLabel(participant.pick) ?? '직업 미상'}`
                                                                : translatePickLabel(participant.pick) ?? '직업 미상'}
                                                        </ReplayParticipantPick>
                                                    </ReplayParticipantCard>
                                                ))}
                                            </ReplayParticipantsRail>
                                            ) : (
                                                <ReplayParticipantsPreview>
                                                    {replayParticipants.slice(0, 4).map((participant) => (
                                                        <ReplayParticipantChip key={`collapsed-${participant.speaker}`}>
                                                            {renderReplayProfile(participant.speaker, participant.frameImageUrl, participant.jobIconUrl)}
                                                            <ReplayParticipantChipText>
                                                                {participant.speaker} / {formatReplayParticipantPick(participant)}
                                                            </ReplayParticipantChipText>
                                                        </ReplayParticipantChip>
                                                    ))}
                                                    {replayParticipants.length > 4 && (
                                                        <ReplayParticipantChip>
                                                            <ReplayParticipantChipText>+{replayParticipants.length - 4}명</ReplayParticipantChipText>
                                                        </ReplayParticipantChip>
                                                    )}
                                                </ReplayParticipantsPreview>
                                            )}
                                        </ReplayParticipants>
                                    </ReplayStage>
                                ) : (
                                    <EmptyState>조건에 맞는 로그가 없습니다.</EmptyState>
                                )}
                            </SectionCard>

                            <SectionCard>
                                <SectionHeader>
                                    <SectionTitle>내 판결</SectionTitle>
                                    <SectionHint>
                                        현재 선택: {selectedCase.myVote === 'GUILTY' ? '유죄' : selectedCase.myVote === 'NOT_GUILTY' ? '무죄' : '없음'}
                                    </SectionHint>
                                </SectionHeader>
                                <VoteGrid>
                                    <VoteCard
                                        $tone="danger"
                                        $active={selectedCase.myVote === 'GUILTY'}
                                        onClick={() => handleVote('GUILTY')}
                                        disabled={busyKey === 'vote-GUILTY'}
                                    >
                                        <MetaText>유죄</MetaText>
                                        <VoteNumber>{selectedCase.guiltyCount.toLocaleString()}</VoteNumber>
                                        <VoteHint>
                                            {selectedCase.myVote === 'GUILTY' ? '내 판결' : '이 영역을 눌러 유죄로 투표'}
                                        </VoteHint>
                                    </VoteCard>
                                    <VoteCard
                                        $tone="success"
                                        $active={selectedCase.myVote === 'NOT_GUILTY'}
                                        onClick={() => handleVote('NOT_GUILTY')}
                                        disabled={busyKey === 'vote-NOT_GUILTY'}
                                    >
                                        <MetaText>무죄</MetaText>
                                        <VoteNumber>{selectedCase.notGuiltyCount.toLocaleString()}</VoteNumber>
                                        <VoteHint>
                                            {selectedCase.myVote === 'NOT_GUILTY' ? '내 판결' : '이 영역을 눌러 무죄로 투표'}
                                        </VoteHint>
                                    </VoteCard>
                                </VoteGrid>
                            </SectionCard>

                            <SectionCard>
                                <SectionHeader>
                                    <SectionTitle>댓글</SectionTitle>
                                    <SectionHint>{selectedCommentCount.toLocaleString()}개</SectionHint>
                                </SectionHeader>
                                <CommentComposer>
                                    <StyledTextarea
                                        value={newComment}
                                        onChange={(event) => setNewComment(event.target.value)}
                                        placeholder="댓글을 입력하세요."
                                    />
                                    <ComposerOptionRow>
                                        <ComposerOptionCheckbox
                                            checked={newCommentAnonymous}
                                            onChange={(event) => setNewCommentAnonymous(event.target.checked)}
                                        />
                                        익명으로 작성
                                    </ComposerOptionRow>
                                    <ButtonRow>
                                        <PrimaryButton onClick={() => handleCommentSubmit()} disabled={busyKey === 'comment-create'}>
                                            댓글 등록
                                        </PrimaryButton>
                                    </ButtonRow>
                                </CommentComposer>

                                {selectedCase.comments.length > 0 ? (
                                    <CommentList>
                                        {selectedCase.comments.map((comment) => renderComment(comment))}
                                    </CommentList>
                                ) : (
                                    <EmptyState>댓글이 없습니다.</EmptyState>
                                )}
                            </SectionCard>
                        </ArticleCard>
                    ) : isDetailPage ? (
                        <BoardCard>
                            <EmptyState>사건 정보를 불러오지 못했습니다.</EmptyState>
                        </BoardCard>
                    ) : null}
                </PageStack>

                {isWriteOpen && typeof document !== 'undefined' && createPortal(
                    <ModalOverlay onClick={closeWriteModal}>
                        <ModalSheet onClick={(event) => event.stopPropagation()}>
                            <ModalHeader>
                                <TitleRow>
                                    <Title>사건 등록</Title>
                                </TitleRow>
                                <ModalCloseButton onClick={closeWriteModal}>×</ModalCloseButton>
                            </ModalHeader>

                            <FieldGroup>
                                <Label htmlFor="tribunal-replay-url">리플레이 링크</Label>
                                <Input
                                    value={caseForm.replayUrl}
                                    onChange={(value) => updateCaseFormField('replayUrl', value)}
                                    placeholder="https://mafia42.com/history/kr/..."
                                    width="100%"
                                />
                                <HelperText>마피아42 리플레이 URL</HelperText>
                                <ButtonRow>
                                    <SecondaryButton onClick={handleReplayPreview} disabled={previewLoading}>
                                        {previewLoading ? '확인 중...' : '리플레이 확인'}
                                    </SecondaryButton>
                                </ButtonRow>
                            </FieldGroup>

                            {replayPreview && (
                                <PreviewSummary>
                                    <PreviewMetaGrid>
                                        <PreviewMetaItem>
                                            <PreviewMetaLabel>게임 유형</PreviewMetaLabel>
                                            <PreviewMetaValue>{replayPreview.gameType ?? '-'}</PreviewMetaValue>
                                        </PreviewMetaItem>
                                        <PreviewMetaItem>
                                            <PreviewMetaLabel>승리 팀</PreviewMetaLabel>
                                            <PreviewMetaValue>{replayPreview.winnerTeam ?? '-'}</PreviewMetaValue>
                                        </PreviewMetaItem>
                                        <PreviewMetaItem>
                                            <PreviewMetaLabel>진행 시간</PreviewMetaLabel>
                                            <PreviewMetaValue>{replayPreview.gameDuration ?? '-'}</PreviewMetaValue>
                                        </PreviewMetaItem>
                                        <PreviewMetaItem>
                                            <PreviewMetaLabel>플레이어 수</PreviewMetaLabel>
                                            <PreviewMetaValue>{replayPreview.players.length}명</PreviewMetaValue>
                                        </PreviewMetaItem>
                                    </PreviewMetaGrid>

                                    <FieldGroup>
                                        <Label>플레이어 선택</Label>
                                        <HelperText>사건으로 등록할 플레이어를 선택해주세요.</HelperText>
                                        <PreviewPlayerGrid>
                                            {replayPreview.players.map((player) => (
                                                <PreviewPlayerCard
                                                    key={`${player.order}-${player.nickname}-${player.pick}`}
                                                    $active={selectedPreviewOrder === player.order}
                                                    onClick={() => handlePreviewPlayerSelect(player)}
                                                >
                                                    <PreviewPlayerOrder>#{player.order}</PreviewPlayerOrder>
                                                    {renderReplayProfile(player.nickname, player.frameImageUrl, player.jobImageUrl)}
                                                    <ReplayParticipantName>{player.nickname}</ReplayParticipantName>
                                                    <ReplayParticipantPick>{getDisplayPickLabel(player.pick, player.pickName) ?? player.pick}</ReplayParticipantPick>
                                                </PreviewPlayerCard>
                                            ))}
                                        </PreviewPlayerGrid>
                                        {selectedPreviewPlayer && (
                                            <HelperText>
                                                선택됨: {selectedPreviewPlayer.nickname} / {getDisplayPickLabel(selectedPreviewPlayer.pick, selectedPreviewPlayer.pickName) ?? selectedPreviewPlayer.pick}
                                            </HelperText>
                                        )}
                                    </FieldGroup>
                                </PreviewSummary>
                            )}

                            <FieldGroup>
                                <Label htmlFor="tribunal-description">설명</Label>
                                <StyledTextarea
                                    id="tribunal-description"
                                    value={caseForm.description}
                                    onChange={(event) => updateCaseFormField('description', event.target.value)}
                                    placeholder="사건 설명"
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
                                <ButtonRow>
                                    <SecondaryButton onClick={addCafeLink}>
                                        링크 추가
                                    </SecondaryButton>
                                </ButtonRow>
                            </FieldGroup>

                            <ButtonRow>
                                <PrimaryButton onClick={handleCreateCase} disabled={caseSubmitting}>
                                    {caseSubmitting ? '등록 중...' : '등록'}
                                </PrimaryButton>
                                <GhostButton onClick={closeWriteModal}>
                                    취소
                                </GhostButton>
                            </ButtonRow>
                        </ModalSheet>
                    </ModalOverlay>,
                    document.body
                )}
            </ContentLayout>
            <ToastNotice notice={status} onClose={() => setStatus(null)} />
        </Layout>
    );
}

export default Tribunal;
