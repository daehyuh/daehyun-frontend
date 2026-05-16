import type {
    TribunalCaseCreateRequest,
    TribunalCaseDetail,
    TribunalCaseSummary,
    TribunalComment,
    TribunalReplayMessage,
    TribunalVoteChoice
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

const toStringArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        return value
            .map((item) => toStringValue(item))
            .filter((item): item is string => Boolean(item));
    }

    const single = toStringValue(value);
    return single ? [single] : [];
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

const unwrapPayload = (value: unknown): unknown => {
    if (!isRecord(value)) return value;

    const wrapped = pickValue(value, ['data', 'result', 'payload']);
    if (wrapped !== undefined) {
        return wrapped;
    }

    return value;
};

const extractErrorMessage = (value: unknown): string | null => {
    if (typeof value === 'string' && value.trim().length > 0) {
        return value;
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
        throw new Error(extractErrorMessage(parsed) ?? `Request failed with status ${response.status}`);
    }

    return parsed as T;
};

const sortByCreatedAt = <T extends { createdAt: string | null }>(items: T[]): T[] => {
    return [...items].sort((left, right) => {
        const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
        const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
        return leftTime - rightTime;
    });
};

const countNestedComments = (comments: TribunalComment[]): number =>
    comments.reduce((total, comment) => total + 1 + countNestedComments(comment.children), 0);

const normalizeReplayMessage = (source: unknown, index: number): TribunalReplayMessage => {
    const record = isRecord(source) ? source : {};
    const typeToken = toStringValue(pickValue(record, ['kind', 'type', 'messageType', 'speakerType']))?.toUpperCase();
    const speaker = toStringValue(pickValue(record, ['speaker', 'nickname', 'playerNickname', 'name'])) ?? 'SYSTEM';
    const kind: TribunalReplayMessage['kind'] = typeToken?.includes('SYSTEM') || speaker === 'SYSTEM'
        ? 'SYSTEM'
        : 'PLAYER';

    return {
        id: toStringValue(pickValue(record, ['id', 'messageId'])) ?? `message-${index}`,
        kind,
        speaker,
        content: toStringValue(pickValue(record, ['content', 'message', 'text', 'body'])) ?? '',
        timestamp: toStringValue(pickValue(record, ['timestamp', 'time', 'createdAt'])),
        round: toStringValue(pickValue(record, ['round', 'phase', 'turn', 'day'])),
    };
};

const normalizeCommentShallow = (source: unknown): TribunalComment => {
    const record = isRecord(source) ? source : {};

    return {
        id: toNumberValue(pickValue(record, ['id', 'commentId'])) ?? 0,
        caseId: toNumberValue(pickValue(record, ['caseId', 'tribunalCaseId'])),
        parentId: toNumberValue(pickValue(record, ['parentId', 'parentCommentId'])),
        author: toStringValue(pickValue(record, ['author', 'nickname', 'writer', 'createdByNickname'])) ?? '익명',
        content: toStringValue(pickValue(record, ['content', 'message', 'body'])) ?? '',
        createdAt: toStringValue(pickValue(record, ['createdAt', 'createdDate', 'timestamp'])),
        updatedAt: toStringValue(pickValue(record, ['updatedAt', 'modifiedAt'])),
        likeCount: toNumberValue(pickValue(record, ['likeCount', 'likes', 'recognitionCount'])) ?? 0,
        likedByMe: toBooleanValue(pickValue(record, ['likedByMe', 'isLiked', 'recognizedByMe'])) ?? false,
        canEdit: toBooleanValue(pickValue(record, ['canEdit', 'editable', 'mine'])) ?? false,
        canDelete: toBooleanValue(pickValue(record, ['canDelete', 'deletable', 'mine'])) ?? false,
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
    const flatSources = flattenCommentSources(source);
    const normalizedMap = new Map<number, TribunalComment>();
    const encounterOrder: number[] = [];

    flatSources.forEach((item) => {
        const normalized = normalizeCommentShallow(item);
        if (!normalized.id || normalizedMap.has(normalized.id)) {
            return;
        }

        normalizedMap.set(normalized.id, normalized);
        encounterOrder.push(normalized.id);
    });

    encounterOrder.forEach((id) => {
        const comment = normalizedMap.get(id);
        if (!comment || !comment.parentId) return;

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

const normalizeVoteSummary = (source: Record<string, unknown>) => {
    const summaryRecord = isRecord(pickValue(source, ['voteSummary', 'summary']))
        ? pickValue(source, ['voteSummary', 'summary']) as Record<string, unknown>
        : null;
    const votesSource = pickValue(source, ['votes']);
    const votes = Array.isArray(votesSource) ? votesSource : [];

    const guiltyCount =
        toNumberValue(pickValue(summaryRecord ?? {}, ['guiltyCount'])) ??
        toNumberValue(pickValue(source, ['guiltyCount'])) ??
        votes.filter((vote) => toVoteChoice(isRecord(vote) ? pickValue(vote, ['vote', 'choice', 'verdict']) : vote) === 'GUILTY').length;

    const notGuiltyCount =
        toNumberValue(pickValue(summaryRecord ?? {}, ['notGuiltyCount'])) ??
        toNumberValue(pickValue(source, ['notGuiltyCount'])) ??
        votes.filter((vote) => toVoteChoice(isRecord(vote) ? pickValue(vote, ['vote', 'choice', 'verdict']) : vote) === 'NOT_GUILTY').length;

    const myVote =
        toVoteChoice(pickValue(summaryRecord ?? {}, ['myVote', 'currentUserVote'])) ??
        toVoteChoice(pickValue(source, ['myVote', 'currentUserVote']));

    return {guiltyCount, notGuiltyCount, myVote};
};

const extractCasesArray = (source: unknown): unknown[] => {
    const root = unwrapPayload(source);
    if (Array.isArray(root)) return root;
    if (!isRecord(root)) return [];

    const candidates = ['cases', 'items', 'content', 'list'];
    for (const key of candidates) {
        const value = root[key];
        if (Array.isArray(value)) {
            return value;
        }
    }

    return [];
};

const normalizeCaseSummary = (source: unknown): TribunalCaseSummary => {
    const record = isRecord(source) ? source : {};
    const voteSummary = normalizeVoteSummary(record);
    const messageCount = toNumberValue(pickValue(record, ['messageCount'])) ?? 0;
    const commentCount = toNumberValue(pickValue(record, ['commentCount'])) ?? 0;

    return {
        id: toNumberValue(pickValue(record, ['id', 'caseId'])) ?? 0,
        replayUrl: toStringValue(pickValue(record, ['replayUrl', 'replayLink', 'url'])) ?? '',
        nickname: toStringValue(pickValue(record, ['nickname', 'playerNickname', 'defendantNickname'])) ?? '알 수 없음',
        pick: toStringValue(pickValue(record, ['pick', 'role', 'job'])) ?? '미상',
        description: toStringValue(pickValue(record, ['description', 'ingameDescription', 'summary'])) ?? '',
        cafeLinks: Array.from(new Set(
            toStringArray(pickValue(record, ['cafeLinks', 'naverCafeLinks', 'cafeUrls']))
        )),
        createdAt: toStringValue(pickValue(record, ['createdAt', 'createdDate', 'timestamp'])),
        messageCount,
        guiltyCount: voteSummary.guiltyCount,
        notGuiltyCount: voteSummary.notGuiltyCount,
        commentCount,
    };
};

const normalizeCaseDetail = (source: unknown): TribunalCaseDetail => {
    const record = isRecord(unwrapPayload(source)) ? unwrapPayload(source) as Record<string, unknown> : {};
    const base = normalizeCaseSummary(record);
    const voteSummary = normalizeVoteSummary(record);
    const rawMessages = pickValue(record, ['replayMessages', 'messages', 'logs']);
    const rawComments = pickValue(record, ['comments', 'commentList']);

    const messages = Array.isArray(rawMessages)
        ? rawMessages.map((item, index) => normalizeReplayMessage(item, index))
        : [];
    const comments = buildCommentTree(rawComments);

    return {
        ...base,
        messageCount: base.messageCount || messages.length,
        commentCount: base.commentCount || countNestedComments(comments),
        guiltyCount: voteSummary.guiltyCount,
        notGuiltyCount: voteSummary.notGuiltyCount,
        statusLabel: toStringValue(pickValue(record, ['statusLabel', 'status', 'verdictStatus'])) ?? '배심원 평결 진행 중',
        myVote: voteSummary.myVote,
        messages,
        comments,
    };
};

export const listTribunalCases = async (): Promise<TribunalCaseSummary[]> => {
    const response = await tribunalRequest<unknown>('/tribunal/cases');
    return extractCasesArray(response)
        .map((item) => normalizeCaseSummary(item))
        .sort((left, right) => {
            const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
            const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
            return rightTime - leftTime;
        });
};

export const getTribunalCaseDetail = async (caseId: number): Promise<TribunalCaseDetail> => {
    const response = await tribunalRequest<unknown>(`/tribunal/cases/${caseId}`);
    return normalizeCaseDetail(response);
};

export const createTribunalCase = async (payload: TribunalCaseCreateRequest): Promise<TribunalCaseSummary> => {
    const response = await tribunalRequest<unknown>('/tribunal/cases', {
        method: 'POST',
        body: JSON.stringify({
            replayUrl: payload.replayUrl,
            replayLink: payload.replayUrl,
            nickname: payload.nickname,
            playerNickname: payload.nickname,
            pick: payload.pick,
            role: payload.pick,
            description: payload.description,
            ingameDescription: payload.description,
            cafeLinks: payload.cafeLinks,
            naverCafeLinks: payload.cafeLinks,
            cafeUrls: payload.cafeLinks,
        }),
    });

    return normalizeCaseSummary(unwrapPayload(response));
};

export const voteTribunalCase = async (caseId: number, vote: TribunalVoteChoice): Promise<void> => {
    await tribunalRequest(`/tribunal/cases/${caseId}/votes`, {
        method: 'POST',
        body: JSON.stringify({
            vote,
            choice: vote,
            verdict: vote,
        }),
    });
};

export const createTribunalComment = async (caseId: number, content: string, parentId?: number | null): Promise<void> => {
    await tribunalRequest(`/tribunal/cases/${caseId}/comments`, {
        method: 'POST',
        body: JSON.stringify({
            content,
            body: content,
            parentId: parentId ?? null,
        }),
    });
};

export const updateTribunalComment = async (commentId: number, content: string): Promise<void> => {
    await tribunalRequest(`/tribunal/cases/comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify({
            content,
            body: content,
        }),
    });
};

export const deleteTribunalComment = async (commentId: number): Promise<void> => {
    await tribunalRequest(`/tribunal/cases/comments/${commentId}`, {
        method: 'DELETE',
    });
};

export const toggleTribunalCommentLike = async (commentId: number): Promise<void> => {
    await tribunalRequest(`/tribunal/cases/comments/${commentId}/likes`, {
        method: 'POST',
    });
};
