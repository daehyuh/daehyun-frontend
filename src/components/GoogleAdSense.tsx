import React, {useEffect} from 'react';
import styled from 'styled-components';

declare global {
    interface Window {
        adsbygoogle?: Array<Record<string, unknown>>;
    }
}

type GoogleAdSenseProps = {
    slotId?: string;
    adClient?: string;
    format?: string;
    layout?: string;
    responsive?: boolean;
    label?: string;
    minHeight?: string;
};

const SlotWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing.xs};
    width: 100%;
`;

const SlotLabel = styled.span`
    font-size: ${({theme}) => theme.typography.sizes.xs};
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: ${({theme}) => theme.colors.textSecondary};
`;

const SlotFrame = styled.div<{ $minHeight?: string }>`
    width: 100%;
    border-radius: ${({theme}) => theme.radii.md};
    border: 1px dashed ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surface};
    min-height: ${({$minHeight}) => $minHeight ?? '140px'};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: ${({theme}) => theme.spacing.sm};
`;

const SlotHint = styled.p`
    margin: 0;
    font-size: ${({theme}) => theme.typography.sizes.xs};
    color: ${({theme}) => theme.colors.textSubtle};
    line-height: ${({theme}) => theme.typography.lineHeights.relaxed};
`;

const DEFAULT_CLIENT = 'ca-pub-7639379894247883';

const GoogleAdSense: React.FC<GoogleAdSenseProps> = ({
    slotId,
    adClient = DEFAULT_CLIENT,
    format = 'auto',
    layout,
    responsive = true,
    label = 'Google AdSense',
    minHeight
}) => {
    useEffect(() => {
        if (!slotId || typeof window === 'undefined') return;
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (error) {
            console.warn('AdSense slot error', error);
        }
    }, [slotId]);

    const hint = slotId
        ? '구글 애드센스가 자동으로 채우는 슬롯입니다.'
        : 'VITE_ADSENSE_* 환경변수를 설정하면 이 슬롯에 실 광고가 표기됩니다.';

    return (
        <SlotWrapper>
            <SlotLabel>{label}</SlotLabel>
            <SlotFrame $minHeight={minHeight}>
                {slotId ? (
                    <ins
                        className="adsbygoogle"
                        style={{display: 'block', width: '100%'}}
                        data-ad-client={adClient}
                        data-ad-slot={slotId}
                        data-ad-format={format}
                        {...(layout ? {'data-ad-layout': layout} : {})}
                        data-full-width-responsive={responsive ? 'true' : 'false'}
                    />
                ) : (
                    <SlotHint>Ad slot placeholder</SlotHint>
                )}
            </SlotFrame>
            <SlotHint>{hint}</SlotHint>
        </SlotWrapper>
    );
};

export default GoogleAdSense;
