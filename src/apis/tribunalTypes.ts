export type ApiResponse<T> = {
    success: boolean;
    data: T;
    message: string;
};

export type TribunalVoteChoice = 'GUILTY' | 'NOT_GUILTY';
export type TribunalCommentType = 'USER' | 'AI_JUDGMENT';
export type TribunalAiReviewStatus = 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';

export type TribunalAuthor = {
    id: number | null;
    name: string;
    nickname: string;
    avatarUrl: string | null;
    rankPoint: number | null;
    anonymous: boolean;
    mine: boolean;
};

export type TribunalVoteSummary = {
    guiltyCount: number;
    notGuiltyCount: number;
    myVerdict: TribunalVoteChoice | null;
};

export type TribunalReplayMessage = {
    id: string;
    sequenceNo: number;
    kind: 'PLAYER' | 'SYSTEM';
    speaker: string;
    content: string;
    timestamp: string | null;
    round: string | null;
    chatType: string | null;
    pick: string | null;
    frameImageUrl: string | null;
    jobIconUrl: string | null;
    jobCode: string | null;
};

export type TribunalComment = {
    id: number;
    parentId: number | null;
    commentType: TribunalCommentType;
    author: TribunalAuthor;
    authorVerdict: TribunalVoteChoice | null;
    content: string;
    deleted: boolean;
    createdAt: string | null;
    updatedAt: string | null;
    likeCount: number;
    likedByMe: boolean;
    canEdit: boolean;
    canDelete: boolean;
    children: TribunalComment[];
};

export type TribunalAiReview = {
    id: number;
    status: TribunalAiReviewStatus;
    verdict: TribunalVoteChoice | null;
    score: number | null;
    grade: string | null;
    teamAlignment: number | null;
    confidence: number | null;
    model: string | null;
    errorMessage: 'AI_REVIEW_FAILED' | null;
    requestedAt: string | null;
    startedAt: string | null;
    completedAt: string | null;
    updatedAt: string | null;
};

export type TribunalCafeLink = {
    id: number | null;
    url: string;
};

export type TribunalReplayPreviewPlayer = {
    order: number;
    nickname: string;
    pick: string;
    pickName: string | null;
    jobImageUrl: string | null;
    frameImageUrl: string | null;
};

export type TribunalReplayPreview = {
    replayUrl: string;
    replayRoomId: string | null;
    replayLang: string | null;
    winnerTeam: string | null;
    gameType: string | null;
    gameDuration: string | null;
    fetchedAt: string | null;
    players: TribunalReplayPreviewPlayer[];
};

export type TribunalCaseSummary = {
    id: number;
    replayUrl: string;
    replayRoomId: string | null;
    replayLang: string | null;
    nickname: string;
    pick: string;
    pickName: string | null;
    description: string;
    winnerTeam: string | null;
    gameType: string | null;
    gameDuration: string | null;
    author: TribunalAuthor | null;
    guiltyCount: number;
    notGuiltyCount: number;
    myVote: TribunalVoteChoice | null;
    viewCount: number;
    commentCount: number;
    messageCount: number;
    replayFetchedAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
};

export type TribunalCaseDetail = TribunalCaseSummary & {
    cafeLinks: TribunalCafeLink[];
    messages: TribunalReplayMessage[];
    aiReview: TribunalAiReview | null;
    comments: TribunalComment[];
};

export type TribunalCaseListPage = {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    content: TribunalCaseSummary[];
};

export type TribunalCaseListParams = {
    page?: number;
    size?: number;
};

export type TribunalCaseCreateRequest = {
    replayUrl: string;
    nickname: string;
    pick: string;
    description: string;
    cafeLinks: string[];
};

export type TribunalCommentSubmitOptions = {
    parentId?: number | null;
    anonymous?: boolean;
};
