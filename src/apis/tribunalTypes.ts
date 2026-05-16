export type TribunalVoteChoice = 'GUILTY' | 'NOT_GUILTY';

export type TribunalReplayMessage = {
    id: string;
    kind: 'PLAYER' | 'SYSTEM';
    speaker: string;
    content: string;
    timestamp: string | null;
    round: string | null;
};

export type TribunalComment = {
    id: number;
    caseId: number | null;
    parentId: number | null;
    author: string;
    content: string;
    createdAt: string | null;
    updatedAt: string | null;
    likeCount: number;
    likedByMe: boolean;
    canEdit: boolean;
    canDelete: boolean;
    children: TribunalComment[];
};

export type TribunalCaseSummary = {
    id: number;
    replayUrl: string;
    nickname: string;
    pick: string;
    description: string;
    cafeLinks: string[];
    createdAt: string | null;
    messageCount: number;
    guiltyCount: number;
    notGuiltyCount: number;
    commentCount: number;
};

export type TribunalCaseDetail = TribunalCaseSummary & {
    statusLabel: string;
    myVote: TribunalVoteChoice | null;
    messages: TribunalReplayMessage[];
    comments: TribunalComment[];
};

export type TribunalCaseCreateRequest = {
    replayUrl: string;
    nickname: string;
    pick: string;
    description: string;
    cafeLinks: string[];
};
