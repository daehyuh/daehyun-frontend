import React, {useEffect, useMemo, useState} from "react";
import styled from "styled-components";
import fetchAds from "../apis/fetchAds";
import {NormalizedAd, normalizeAdsResponse} from "@/utils/ads";

type AdsProps = {
    useInquiry?: boolean;
    onAvailabilityChange?: (available: boolean) => void;
}

const AdsWrapper = styled.section`
    width: 100%;
    border-radius: ${({theme}) => theme.radii.lg};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surfaceElevated};
    padding: ${({theme}) => theme.spacing.lg};
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing.md};
    box-shadow: ${({theme}) => theme.shadows.soft};
`;

const Carousel = styled.div`
    position: relative;
    overflow: hidden;
    border-radius: ${({theme}) => theme.radii.md};
    border: 1px solid ${({theme}) => theme.colors.borderMuted};
`;

const CarouselImage = styled.img`
    width: 100%;
    height: 100%;
    aspect-ratio: 16 / 7;
    object-fit: contain;
    background: ${({theme}) => theme.colors.surfaceMuted};
    display: block;
`;

const CarouselOverlay = styled.div`
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 0.65) 100%);
    display: flex;
    align-items: flex-end;
    padding: ${({theme}) => theme.spacing.lg};
`;

const Meta = styled.div`
    color: ${({theme}) => theme.colors.textPrimary};
`;

const MetaLabel = styled.p`
    margin: 0;
    font-size: ${({theme}) => theme.typography.sizes.sm};
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${({theme}) => theme.colors.textSecondary};
`;

const MetaTitle = styled.h3`
    margin: ${({theme}) => `${theme.spacing.xs} 0`};
    font-size: ${({theme}) => theme.typography.sizes.xl};
    color: ${({theme}) => theme.colors.textPrimary};
`;

const MetaPeriod = styled.p`
    margin: 0;
    font-size: ${({theme}) => theme.typography.sizes.sm};
    color: ${({theme}) => theme.colors.textSecondary};
`;

const Controls = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const ControlButton = styled.button`
    width: 42px;
    height: 42px;
    border-radius: ${({theme}) => theme.radii.pill};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surfaceMuted};
    color: ${({theme}) => theme.colors.textPrimary};
    display: inline-flex;
    align-items: center;
    justify-content: center;
`;

const Dots = styled.div`
    display: flex;
    gap: ${({theme}) => theme.spacing.xs};
    flex: 1;
    justify-content: center;
`;

const Dot = styled.button<{ $active: boolean }>`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: none;
    background: ${({$active, theme}) => $active ? theme.colors.accent : theme.colors.border};
    opacity: ${({$active}) => $active ? 1 : 0.5};
`;

const ActionRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({theme}) => theme.spacing.sm};
`;

const PrimaryLink = styled.a`
    flex: 1;
    min-width: 180px;
    text-align: center;
    padding: ${({theme}) => `${theme.spacing.sm} ${theme.spacing.md}`};
    border-radius: ${({theme}) => theme.radii.pill};
    background: ${({theme}) => theme.gradients.hero};
    color: ${({theme}) => theme.colors.textPrimary};
    font-weight: ${({theme}) => theme.typography.weights.semibold};
    text-decoration: none;
`;

const SecondaryLink = styled.a`
    flex: 1;
    min-width: 180px;
    text-align: center;
    padding: ${({theme}) => `${theme.spacing.sm} ${theme.spacing.md}`};
    border-radius: ${({theme}) => theme.radii.pill};
    border: 1px solid ${({theme}) => theme.colors.border};
    color: ${({theme}) => theme.colors.textPrimary};
    text-decoration: none;
`;

const AdNote = styled.p`
    margin: 0;
    font-size: ${({theme}) => theme.typography.sizes.xs};
    color: ${({theme}) => theme.colors.textSubtle};
`;

function Ads({useInquiry = true, onAvailabilityChange}: AdsProps) {
    const [ads, setAds] = useState<NormalizedAd[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const hasAds = useMemo(() => ads.length > 0, [ads]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetchAds();
                const normalized = normalizeAdsResponse(response);
                setAds(normalized);
            } catch (error) {
                console.warn('광고 데이터를 불러오지 못했습니다.', error);
                setAds([]);
            }
        };

        fetchData();
    }, []);

    const items = useMemo(() => ads, [ads]);
    const activeAd = items[currentIndex % Math.max(items.length, 1)];

    useEffect(() => {
        if (items.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, 6000);

        return () => clearInterval(timer);
    }, [items.length]);

    const goTo = (index: number) => {
        setCurrentIndex((index + items.length) % items.length);
    };

    const goPrev = () => goTo(currentIndex - 1);
    const goNext = () => goTo(currentIndex + 1);

    useEffect(() => {
        onAvailabilityChange?.(hasAds);
    }, [hasAds, onAvailabilityChange]);

    if (!hasAds) return null;

    return (
        <AdsWrapper>
            <Carousel>
                <CarouselImage src={activeAd.image} alt={activeAd.label ?? '스폰서 배너'} />
                <CarouselOverlay>
                    <Meta>
                        <MetaLabel>Featured · {currentIndex + 1} / {items.length}</MetaLabel>
                        <MetaTitle>{activeAd.label ?? '스폰서 콘텐츠'}</MetaTitle>
                        {activeAd.period && <MetaPeriod>{activeAd.period}</MetaPeriod>}
                    </Meta>
                </CarouselOverlay>
            </Carousel>

            <Controls>
                <ControlButton type="button" aria-label="이전 광고" onClick={goPrev}>
                    ←
                </ControlButton>
                <Dots role="tablist" aria-label="광고 인디케이터">
                    {items.map((item, index) => (
                        <Dot
                            key={item.id}
                            $active={index === currentIndex}
                            onClick={() => goTo(index)}
                            aria-label={`${index + 1}번째 광고 보기`}
                        />
                    ))}
                </Dots>
                <ControlButton type="button" aria-label="다음 광고" onClick={goNext}>
                    →
                </ControlButton>
            </Controls>

            <ActionRow>
                {activeAd.href && (
                    <PrimaryLink href={activeAd.href} target="_blank" rel="noreferrer">
                        광고 자세히 보기
                    </PrimaryLink>
                )}
                {useInquiry && (
                    <SecondaryLink href="https://open.kakao.com/o/sWIax8Vc" target="_blank" rel="noreferrer">
                        광고/제휴 문의
                    </SecondaryLink>
                )}
            </ActionRow>
            <AdNote>권장 크기 : 728×90, 970×250, 336×280 (모바일에서는 320×100).</AdNote>
        </AdsWrapper>
    );
}

export default Ads;
