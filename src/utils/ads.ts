export type RawAdPayload = {
    id?: number | string;
    url?: string;
    href?: string;
    ad?: string[];
    ads?: string[];
    urls?: string[];
    startDate?: string;
    endDate?: string;
    title?: string;
};

export type NormalizedAd = {
    id: string;
    image: string;
    href?: string;
    label?: string;
    period?: string;
};

const ATTACH_BASE = (import.meta as any)?.env?.VITE_AD_IMAGE_BASE ?? 'https://api.xn--vk1b177d.com/attach/images/';

const toAbsoluteUrl = (url?: string): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) return url;
    return `${ATTACH_BASE.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};

export const FALLBACK_ADS: NormalizedAd[] = [
    {
        id: 'fallback-1',
        image: 'https://placehold.co/1200x520/15161f/ffffff?text=Ad+Placement+Preview',
        label: '스폰서 슬롯 프리뷰',
        period: '728×90 또는 336×280 권장'
    },
    {
        id: 'fallback-2',
        image: 'https://placehold.co/1200x520/21222f/ffffff?text=Upload+Your+Creative',
        label: '브랜드 협찬 가이드',
        period: '고정 노출 · 6초 전환'
    }
];

export const normalizeAdsResponse = (payload: any): NormalizedAd[] => {
    if (!payload) return [];

    const collectFromEntry = (entry: RawAdPayload | undefined): NormalizedAd[] => {
        if (!entry) return [];
        const sources = entry.ad ?? entry.ads ?? entry.urls ?? [];
        if (Array.isArray(sources) && sources.length > 0) {
            return sources.map((value, index) => {
                const image = toAbsoluteUrl(typeof value === 'string' ? value : value?.url);
                const href = typeof value === 'string' ? entry.href : value?.href ?? entry.href;
                return image ? {
                    id: `${entry.id ?? entry.title ?? 'ad'}-${index}`,
                    image,
                    href,
                    label: entry.title,
                    period: entry.startDate && entry.endDate ? `${entry.startDate} ~ ${entry.endDate}` : undefined
                } : null;
            }).filter((item): item is NormalizedAd => !!item);
        }

        if (entry.url) {
            return [{
                id: String(entry.id ?? entry.url),
                image: toAbsoluteUrl(entry.url) ?? entry.url,
                href: entry.href,
                label: entry.title,
                period: entry.startDate && entry.endDate ? `${entry.startDate} ~ ${entry.endDate}` : undefined
            }];
        }

        return [];
    };

    if (Array.isArray(payload?.data)) {
        return payload.data.flatMap((item: RawAdPayload) => collectFromEntry(item));
    }

    if (Array.isArray(payload)) {
        return payload.flatMap((item: RawAdPayload) => collectFromEntry(item));
    }

    return collectFromEntry(payload);
};
