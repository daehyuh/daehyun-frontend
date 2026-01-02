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
const DEFAULT_LINK_PROTOCOL = (import.meta as any)?.env?.VITE_AD_LINK_PROTOCOL ?? 'https://';

const toAbsoluteUrl = (url?: string): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) return url;
    return `${ATTACH_BASE.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};

export const toAbsoluteHref = (href?: string): string | undefined => {
    if (!href) return undefined;
    const trimmed = href.trim();
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) return trimmed; // has scheme
    if (trimmed.startsWith('//')) return `${DEFAULT_LINK_PROTOCOL.replace(/:\/\//, '')}:${trimmed}`;
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return trimmed; // mailto:, tel:, etc.
    return `${DEFAULT_LINK_PROTOCOL}${trimmed.replace(/^\/+/, '')}`;
};

// Intentionally empty: we should not show preview ads when the API returns no data.
export const FALLBACK_ADS: NormalizedAd[] = [];

export const normalizeAdsResponse = (payload: any): NormalizedAd[] => {
    if (!payload) return [];

    const collectFromEntry = (entry: RawAdPayload | undefined): NormalizedAd[] => {
        if (!entry) return [];
        const sources = entry.ad ?? entry.ads ?? entry.urls ?? [];
        if (Array.isArray(sources) && sources.length > 0) {
            return sources
                .map((value, index) => {
                    const image = toAbsoluteUrl(typeof value === 'string' ? value : value?.url);
                    const href = toAbsoluteHref(typeof value === 'string' ? entry.href : value?.href ?? entry.href);
                    return image
                        ? {
                            id: `${entry.id ?? entry.title ?? 'ad'}-${index}`,
                            image,
                            href,
                            label: entry.title,
                            period: entry.startDate && entry.endDate ? `${entry.startDate} ~ ${entry.endDate}` : undefined,
                        }
                        : null;
                })
                .filter((item): item is NormalizedAd => !!item);
        }

        if (entry.url) {
            return [{
                id: String(entry.id ?? entry.url),
                image: toAbsoluteUrl(entry.url) ?? entry.url,
                href: toAbsoluteHref(entry.href),
                label: entry.title,
                period: entry.startDate && entry.endDate ? `${entry.startDate} ~ ${entry.endDate}` : undefined,
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
