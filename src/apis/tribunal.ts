import type {
    ApiResponse,
    TribunalAuthor,
    TribunalCafeLink,
    TribunalCaseCreateRequest,
    TribunalCaseDetail,
    TribunalCaseListPage,
    TribunalCaseListParams,
    TribunalCaseSummary,
    TribunalComment,
    TribunalReplayMessage,
    TribunalReplayPreview,
    TribunalReplayPreviewPlayer,
    TribunalVoteChoice,
    TribunalVoteSummary,
} from "@/apis/tribunalTypes";

const API_BASE_URL = import.meta.env.VITE_API_BASE ?? 'https://api.xn--vk1b177d.com';

const readAccessToken = (): string | null => {
    if (typeof document === 'undefined') return null;
    return document.cookie
        .split(';')
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith('accessToken='))
        ?.split('=')[1] ?? null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const pickValue = (source: Record<string, unknown>, keys: string[]): unknown => {
    for (const key of keys) {
        const value = source[key];
        if (value !== undefined && value !== null) {
            return value;
        }
    }
    return undefined;
};

const toStringValue = (value: unknown): string | null => {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    return null;
};

const toNumberValue = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === 'string' && value.trim().length > 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};

const toBooleanValue = (value: unknown): boolean | null => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
    }
    return null;
};

const toVoteChoice = (value: unknown): TribunalVoteChoice | null => {
    const upper = toStringValue(value)?.toUpperCase();
    if (upper === 'GUILTY' || upper === 'NOT_GUILTY') {
        return upper;
    }
    return null;
};

const parseJsonSafely = (text: string): unknown => {
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
};

const isApiResponse = <T>(value: unknown): value is ApiResponse<T> =>
    isRecord(value) && 'success' in value && 'message' in value && 'data' in value;

const extractErrorMessage = (value: unknown): string | null => {
    if (typeof value === 'string' && value.trim().length > 0) {
        return value;
    }

    if (isApiResponse(value)) {
        return toStringValue(value.message) ?? extractErrorMessage(value.data);
    }

    if (!isRecord(value)) return null;

    return toStringValue(
        pickValue(value, ['message', 'error', 'detail', 'description'])
    );
};

const tribunalRequest = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
    const headers = new Headers(init.headers);
    headers.set('Accept', 'application/json');

    if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const accessToken = readAccessToken();
    if (accessToken && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers,
        credentials: 'include',
    });

    const text = await response.text();
    const parsed = text.length > 0 ? parseJsonSafely(text) : null;

    if (!response.ok) {
        const fallbackMessage = response.status === 401 || response.status === 403
            ? '로그인이 필요합니다.'
            : `Request failed with status ${response.status}`;
        throw new Error(extractErrorMessage(parsed) ?? fallbackMessage);
    }

    if (isApiResponse<T>(parsed)) {
        if (parsed.success === false) {
            throw new Error(parsed.message || '요청 처리에 실패했습니다.');
        }
        return parsed.data;
    }

    return parsed as T;
};

const sortByCreatedAt = <T extends { createdAt: string | null }>(items: T[]): T[] =>
    [...items].sort((left, right) => {
        const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
        const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
        return leftTime - rightTime;
    });

const countNestedComments = (comments: TribunalComment[]): number =>
    comments.reduce((total, comment) => total + 1 + countNestedComments(comment.children), 0);

const normalizeAuthor = (source: unknown): TribunalAuthor | null => {
    if (!isRecord(source)) return null;

    const nickname = toStringValue(pickValue(source, ['nickname', 'name'])) ?? '작성자 없음';
    const anonymous = toBooleanValue(source.anonymous) ?? false;
    const mine = toBooleanValue(source.mine) ?? false;

    return {
        id: toNumberValue(source.id),
        name: toStringValue(pickValue(source, ['name', 'nickname'])) ?? nickname,
        nickname,
        avatarUrl: toStringValue(source.avatarUrl),
        rankPoint: toNumberValue(pickValue(source, ['rankPoint2', 'rankPoint'])),
        anonymous,
        mine,
    };
};

const normalizeVoteSummary = (source: unknown): TribunalVoteSummary => {
    const record = isRecord(source) ? source : {};
    return {
        guiltyCount: toNumberValue(record.guiltyCount) ?? 0,
        notGuiltyCount: toNumberValue(record.notGuiltyCount) ?? 0,
        myVerdict: toVoteChoice(record.myVerdict),
    };
};

const normalizeReplayMessage = (source: unknown, index: number): TribunalReplayMessage => {
    const record = isRecord(source) ? source : {};
    const sequenceNo = toNumberValue(record.sequenceNo) ?? index + 1;
    const messageType = toStringValue(record.messageType)?.toUpperCase();
    const jobCode = toStringValue(record.jobCode);

    return {
        id: toStringValue(record.id) ?? `message-${sequenceNo}`,
        sequenceNo,
        kind: messageType === 'SYSTEM' ? 'SYSTEM' : 'PLAYER',
        speaker: toStringValue(record.nickname) ?? 'SYSTEM',
        content: toStringValue(record.content) ?? '',
        timestamp: toStringValue(record.createdAt),
        round: `#${sequenceNo}`,
        chatType: toStringValue(record.chatType),
        pick: null,
        frameImageUrl: toStringValue(record.frameImageUrl),
        jobIconUrl: toStringValue(record.jobImageUrl),
        jobCode,
    };
};

const normalizeCommentShallow = (source: unknown): TribunalComment => {
    const record = isRecord(source) ? source : {};
    const author = normalizeAuthor(record.author) ?? {
        id: null,
        name: '작성자 없음',
        nickname: '작성자 없음',
        avatarUrl: null,
        rankPoint: null,
        anonymous: false,
        mine: false,
    };

    return {
        id: toNumberValue(record.id) ?? 0,
        parentId: toNumberValue(record.parentId),
        author,
        authorVerdict: toVoteChoice(record.authorVerdict),
        content: toStringValue(record.content) ?? '',
        deleted: toBooleanValue(record.deleted) ?? false,
        createdAt: toStringValue(record.createdAt),
        updatedAt: toStringValue(record.updatedAt),
        likeCount: toNumberValue(record.likeCount) ?? 0,
        likedByMe: toBooleanValue(record.likedByMe) ?? false,
        canEdit: toBooleanValue(pickValue(record, ['canEdit', 'editable', 'mine'])) ?? author.mine,
        canDelete: toBooleanValue(pickValue(record, ['canDelete', 'deletable', 'mine'])) ?? author.mine,
        children: [],
    };
};

const flattenCommentSources = (source: unknown): unknown[] => {
    if (!Array.isArray(source)) return [];

    const result: unknown[] = [];

    const visit = (item: unknown) => {
        result.push(item);

        if (!isRecord(item)) return;

        const nested = pickValue(item, ['children', 'replies', 'replyComments']);
        if (Array.isArray(nested)) {
            nested.forEach(visit);
        }
    };

    source.forEach(visit);
    return result;
};

const buildCommentTree = (source: unknown): TribunalComment[] => {
    const normalizedMap = new Map<number, TribunalComment>();
    const encounterOrder: number[] = [];

    flattenCommentSources(source).forEach((item) => {
        const normalized = normalizeCommentShallow(item);
        if (!normalized.id || normalizedMap.has(normalized.id)) return;

        normalizedMap.set(normalized.id, normalized);
        encounterOrder.push(normalized.id);
    });

    encounterOrder.forEach((id) => {
        const comment = normalizedMap.get(id);
        if (!comment || comment.parentId === null) return;

        const parent = normalizedMap.get(comment.parentId);
        if (!parent) return;
        parent.children.push(comment);
    });

    normalizedMap.forEach((comment) => {
        comment.children = sortByCreatedAt(comment.children);
    });

    return sortByCreatedAt(
        encounterOrder
            .map((id) => normalizedMap.get(id))
            .filter((comment): comment is TribunalComment => Boolean(comment) && comment.parentId === null)
    );
};

const normalizeCafeLinks = (source: unknown): TribunalCafeLink[] => {
    if (!Array.isArray(source)) return [];

    return source
        .map((item) => {
            if (typeof item === 'string') {
                const url = toStringValue(item);
                return url ? {id: null, url} : null;
            }

            if (!isRecord(item)) return null;

            const url = toStringValue(item.url);
            if (!url) return null;

            return {
                id: toNumberValue(item.id),
                url,
            };
        })
        .filter((item): item is TribunalCafeLink => Boolean(item));
};

const normalizeReplayPreviewPlayer = (source: unknown, index: number): TribunalReplayPreviewPlayer => {
    const record = isRecord(source) ? source : {};

    return {
        order: toNumberValue(record.order) ?? index + 1,
        nickname: toStringValue(record.nickname) ?? '플레이어 없음',
        pick: toStringValue(record.pick) ?? '',
        pickName: toStringValue(record.pickName),
        jobImageUrl: toStringValue(record.jobImageUrl),
        frameImageUrl: toStringValue(record.frameImageUrl),
    };
};

const normalizeReplayPreview = (source: unknown): TribunalReplayPreview => {
    const record = isRecord(source) ? source : {};

    return {
        replayUrl: toStringValue(record.replayUrl) ?? '',
        replayRoomId: toStringValue(record.replayRoomId),
        replayLang: toStringValue(record.replayLang),
        winnerTeam: toStringValue(record.winnerTeam),
        gameType: toStringValue(record.gameType),
        gameDuration: toStringValue(record.gameDuration),
        fetchedAt: toStringValue(record.fetchedAt),
        players: Array.isArray(record.players)
            ? record.players.map((item, index) => normalizeReplayPreviewPlayer(item, index))
            : [],
    };
};

const normalizeCaseSummary = (source: unknown): TribunalCaseSummary => {
    const record = isRecord(source) ? source : {};
    const voteSummary = normalizeVoteSummary(record.voteSummary);

    return {
        id: toNumberValue(record.id) ?? 0,
        replayUrl: toStringValue(record.replayUrl) ?? '',
        replayRoomId: toStringValue(record.replayRoomId),
        replayLang: toStringValue(record.replayLang),
        nickname: toStringValue(record.playerNickname) ?? '플레이어 없음',
        pick: toStringValue(record.playerPick) ?? '직업 미상',
        pickName: toStringValue(record.playerPickName),
        description: toStringValue(record.description) ?? '',
        winnerTeam: toStringValue(record.winnerTeam),
        gameType: toStringValue(record.gameType),
        gameDuration: toStringValue(record.gameDuration),
        author: normalizeAuthor(record.author),
        guiltyCount: voteSummary.guiltyCount,
        notGuiltyCount: voteSummary.notGuiltyCount,
        myVote: voteSummary.myVerdict,
        viewCount: toNumberValue(record.viewCount) ?? 0,
        commentCount: toNumberValue(record.commentCount) ?? 0,
        messageCount: toNumberValue(pickValue(record, ['messageCount', 'replayMessageCount'])) ?? 0,
        replayFetchedAt: toStringValue(record.replayFetchedAt),
        createdAt: toStringValue(record.createdAt),
        updatedAt: toStringValue(record.updatedAt),
    };
};

const normalizeCaseDetail = (source: unknown): TribunalCaseDetail => {
    const record = isRecord(source) ? source : {};
    const base = normalizeCaseSummary(record);
    const messages = Array.isArray(record.replayMessages)
        ? record.replayMessages
            .map((item, index) => normalizeReplayMessage(item, index))
            .sort((left, right) => left.sequenceNo - right.sequenceNo)
        : [];
    const comments = buildCommentTree(record.comments);

    return {
        ...base,
        cafeLinks: normalizeCafeLinks(record.cafeLinks),
        messages,
        comments,
        messageCount: base.messageCount || messages.length,
        commentCount: base.commentCount || countNestedComments(comments),
    };
};

const normalizeCaseListPage = (source: unknown): TribunalCaseListPage => {
    const record = isRecord(source) ? source : {};
    const content = Array.isArray(record.content)
        ? record.content.map((item) => normalizeCaseSummary(item))
        : [];

    return {
        page: toNumberValue(record.page) ?? 0,
        size: toNumberValue(record.size) ?? content.length,
        totalElements: toNumberValue(record.totalElements) ?? content.length,
        totalPages: toNumberValue(record.totalPages) ?? (content.length > 0 ? 1 : 0),
        content,
    };
};

export const listTribunalCases = async (
    params: TribunalCaseListParams = {}
): Promise<TribunalCaseListPage> => {
    const searchParams = new URLSearchParams();
    searchParams.set('page', String(params.page ?? 0));
    searchParams.set('size', String(params.size ?? 20));

    const response = await tribunalRequest<unknown>(`/tribunal/cases?${searchParams.toString()}`);
    return normalizeCaseListPage(response);
};

export const getTribunalCaseDetail = async (caseId: number): Promise<TribunalCaseDetail> => {
    const response = await tribunalRequest<unknown>(`/tribunal/cases/${caseId}`);
    return normalizeCaseDetail(response);
};

export const previewTribunalReplay = async (replayUrl: string): Promise<TribunalReplayPreview> => {
    const response = await tribunalRequest<unknown>('/tribunal/cases/replay/preview', {
        method: 'POST',
        body: JSON.stringify({replayUrl}),
    });

    return normalizeReplayPreview(response);
};

export const createTribunalCase = async (payload: TribunalCaseCreateRequest): Promise<TribunalCaseDetail> => {
    const response = await tribunalRequest<unknown>('/tribunal/cases', {
        method: 'POST',
        body: JSON.stringify({
            replayUrl: payload.replayUrl,
            nickname: payload.nickname,
            pick: payload.pick,
            description: payload.description,
            cafeLinks: payload.cafeLinks,
        }),
    });

    return normalizeCaseDetail(response);
};

export const deleteTribunalCase = async (caseId: number): Promise<void> => {
    await tribunalRequest<null>(`/tribunal/cases/${caseId}`, {
        method: 'DELETE',
    });
};

export const voteTribunalCase = async (
    caseId: number,
    verdict: TribunalVoteChoice
): Promise<TribunalVoteSummary> => {
    const response = await tribunalRequest<unknown>(`/tribunal/cases/${caseId}/votes`, {
        method: 'POST',
        body: JSON.stringify({verdict}),
    });

    return normalizeVoteSummary(response);
};

export const createTribunalComment = async (
    caseId: number,
    content: string,
    parentId?: number | null,
    anonymous = false
): Promise<TribunalComment> => {
    const response = await tribunalRequest<unknown>(`/tribunal/cases/${caseId}/comments`, {
        method: 'POST',
        body: JSON.stringify({
            content,
            parentId: parentId ?? null,
            anonymous,
        }),
    });

    return normalizeCommentShallow(response);
};

export const updateTribunalComment = async (
    commentId: number,
    content: string,
    parentId?: number | null,
    anonymous = false
): Promise<TribunalComment> => {
    const response = await tribunalRequest<unknown>(`/tribunal/cases/comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify({
            content,
            parentId: parentId ?? null,
            anonymous,
        }),
    });

    return normalizeCommentShallow(response);
};

export const deleteTribunalComment = async (commentId: number): Promise<void> => {
    await tribunalRequest<null>(`/tribunal/cases/comments/${commentId}`, {
        method: 'DELETE',
    });
};

export const toggleTribunalCommentLike = async (commentId: number): Promise<TribunalComment> => {
    const response = await tribunalRequest<unknown>(`/tribunal/cases/comments/${commentId}/likes`, {
        method: 'POST',
    });

    return normalizeCommentShallow(response);
};
