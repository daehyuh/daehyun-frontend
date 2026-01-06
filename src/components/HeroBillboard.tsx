import React, {useEffect, useMemo, useState} from "react";
import styled from "styled-components";
import fetchAds from "@/apis/fetchAds";
import {NormalizedAd, normalizeAdsResponse} from "@/utils/ads";

const Billboard = styled.section`
    position: relative;
    width: 100%;
    border-radius: ${({theme}) => theme.radii.lg};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.gradients.panel};
    padding: clamp(14px, 2.4vw, 22px);
    box-shadow: ${({theme}) => theme.shadows.soft};
    overflow: hidden;
`;

const HeaderRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing.sm};
    flex-wrap: wrap;
    margin-bottom: ${({theme}) => theme.spacing.md};

    @media (max-width: ${({theme}) => theme.breakpoints.md}px) {
        flex-direction: column;
        align-items: flex-start;
        gap: ${({theme}) => theme.spacing.xs};
    }
`;

const InlineLink = styled.a`
    display: inline-flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing.xs};
    padding: ${({theme}) => `${theme.spacing.xs} ${theme.spacing.sm}`};
    border-radius: ${({theme}) => theme.radii.pill};
    border: 1px solid ${({theme}) => theme.colors.border};
    color: ${({theme}) => theme.colors.textPrimary};
    background: ${({theme}) => theme.colors.surfaceMuted};
    font-size: ${({theme}) => theme.typography.sizes.sm};
    text-decoration: none;
    white-space: nowrap;

    &:hover {
        border-color: ${({theme}) => theme.colors.accent};
        color: ${({theme}) => theme.colors.accent};
    }
`;

const Track = styled.div<{ $index: number }>`
    display: flex;
    width: 100%;
    transition: transform ${({theme}) => theme.transitions.default};
    transform: translateX(${({$index}) => `-${$index * 100}%`});
`;

const SlideCard = styled.a<{ $clickable: boolean }>`
    min-width: 100%;
    display: grid;
    grid-template-columns: 1fr;
    gap: ${({theme}) => theme.spacing.md};
    align-items: center;
    background: ${({theme}) => theme.colors.surface};
    border: 1px solid ${({theme}) => theme.colors.border};
    border-radius: ${({theme}) => theme.radii.md};
    padding: clamp(8px, 1.4vw, 14px);
    color: ${({theme}) => theme.colors.textPrimary};
    text-decoration: none;
    box-shadow: ${({theme}) => theme.shadows.soft};
    overflow: hidden;
    cursor: ${({$clickable}) => ($clickable ? 'pointer' : 'default')};
    transition: transform ${({theme}) => theme.transitions.default}, border ${({theme}) => theme.transitions.default};

    &:hover {
        transform: ${({$clickable}) => $clickable ? 'translateY(-2px)' : 'none'};
        border-color: ${({theme}) => theme.colors.accent};
    }

    @media (max-width: ${({theme}) => theme.breakpoints.md}px) {
        grid-template-columns: 1fr;
        padding: 0;
        border-radius: ${({theme}) => theme.radii.md};
        border: none;
        background: transparent;
        box-shadow: none;
    }
`;

const Visual = styled.div`
    position: relative;
    width: 100%;
    border-radius: ${({theme}) => theme.radii.md};
    overflow: hidden;
    background: ${({theme}) => theme.colors.surfaceMuted};
    aspect-ratio: 16 / 5;
    max-height: clamp(160px, 28vw, 220px);
    box-shadow: ${({theme}) => theme.shadows.tight};

    @media (max-width: ${({theme}) => theme.breakpoints.md}px) {
        aspect-ratio: 16 / 7;
        max-height: 200px;
        border-radius: ${({theme}) => theme.radii.lg};
        box-shadow: none;
    }
`;

const VisualImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: ${({theme}) => theme.colors.surfaceMuted};
    display: block;

    @media (max-width: ${({theme}) => theme.breakpoints.md}px) {
        object-fit: cover;
    }
`;

const Ribbon = styled.span`
    position: absolute;
    top: ${({theme}) => theme.spacing.sm};
    left: ${({theme}) => theme.spacing.sm};
    padding: ${({theme}) => `${theme.spacing.xs} ${theme.spacing.sm}`};
    border-radius: ${({theme}) => theme.radii.pill};
    background: rgba(0, 0, 0, 0.4);
    color: ${({theme}) => theme.colors.textPrimary};
    font-size: ${({theme}) => theme.typography.sizes.xs};
    letter-spacing: 0.08em;
    text-transform: uppercase;
    backdrop-filter: blur(6px);

    @media (max-width: ${({theme}) => theme.breakpoints.md}px) {
        top: ${({theme}) => theme.spacing.md};
        left: ${({theme}) => theme.spacing.md};
    }
`;

const Copy = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing.sm};
    justify-content: center;
`;

const Eyebrow = styled.span`
    font-size: ${({theme}) => theme.typography.sizes.xs};
    color: ${({theme}) => theme.colors.textSecondary};
    letter-spacing: 0.08em;
    text-transform: uppercase;
`;

const Headline = styled.h3`
    margin: 0;
    font-size: clamp(1.05rem, 2.2vw, 1.3rem);
    color: ${({theme}) => theme.colors.textPrimary};
    letter-spacing: -0.01em;
`;

const Period = styled.span`
    font-size: ${({theme}) => theme.typography.sizes.sm};
    color: ${({theme}) => theme.colors.textSubtle};
`;

const Hint = styled.p`
    margin: ${({theme}) => `${theme.spacing.sm} 0 0 0`};
    font-size: ${({theme}) => theme.typography.sizes.xs};
    color: ${({theme}) => theme.colors.textSubtle};
    text-align: center;
`;

const Controls = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    pointer-events: none;
`;

const ControlButton = styled.button`
    pointer-events: auto;
    width: 42px;
    height: 42px;
    border-radius: ${({theme}) => theme.radii.pill};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surfaceMuted};
    color: ${({theme}) => theme.colors.textPrimary};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: ${({theme}) => theme.shadows.soft};
    transition: background ${({theme}) => theme.transitions.default};

    &:hover {
        background: ${({theme}) => theme.colors.surfaceElevated};
    }
`;

const Dots = styled.div`
    display: flex;
    gap: ${({theme}) => theme.spacing.xs};
    justify-content: center;
    margin-top: ${({theme}) => theme.spacing.sm};
`;

const Dot = styled.button<{ $active: boolean }>`
    width: 10px;
    height: 10px;
    border-radius: ${({theme}) => theme.radii.pill};
    border: none;
    background: ${({$active, theme}) => $active ? theme.colors.accent : theme.colors.border};
    opacity: ${({$active}) => $active ? 1 : 0.6};
    transition: transform ${({theme}) => theme.transitions.default};

    ${({$active}) => $active && `
        transform: scale(1.1);
    `}
`;

function HeroBillboard() {
    const [ads, setAds] = useState<NormalizedAd[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetchAds();
                const normalized = normalizeAdsResponse(response);
                if (normalized.length > 0) {
                    setAds(normalized);
                }
            } catch (error) {
                console.warn('광고 데이터를 불러오지 못했습니다.', error);
            }
        };

        fetchData();
    }, []);

    const items = useMemo(() => ads, [ads]);
    const hasAds = items.length > 0;
    const activeAd = hasAds ? items[currentIndex % items.length] : null;

    useEffect(() => {
        if (items.length <= 1 || isPaused) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, 6500);

        return () => clearInterval(timer);
    }, [items.length, isPaused]);

    const goTo = (index: number) => {
        if (items.length === 0) return;
        setCurrentIndex((index + items.length) % items.length);
    };

    const goPrev = () => goTo(currentIndex - 1);
    const goNext = () => goTo(currentIndex + 1);

    if (!hasAds || !activeAd) {
        return null;
    }

    const isClickable = Boolean(activeAd.href);

    return (
        <Billboard
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            aria-label="상단 광고판"
        >
            <HeaderRow>
                <InlineLink
                    href="https://open.kakao.com/o/sWIax8Vc"
                    target="_blank"
                    rel="noreferrer"
                >
                    광고/제휴 카카오톡 오픈채팅
                </InlineLink>
            </HeaderRow>

            <div style={{position: 'relative', width: '100%'}}>
                <Track $index={currentIndex}>
                    {items.map((item, index) => {
                        const clickable = Boolean(item.href);
                        return (
                            <SlideCard
                                key={item.id}
                                href={clickable ? item.href : undefined}
                                target={clickable ? '_blank' : undefined}
                                rel={clickable ? 'noreferrer' : undefined}
                                $clickable={clickable}
                                aria-label={`${item.label ?? '스폰서'} 배너`}
                            >
                                <Visual>
                                    <VisualImage src={item.image} alt={item.label ?? '광고 이미지'} />
                                    <Ribbon>광고</Ribbon>
                                </Visual>
                                <Copy className="sr-only">
                                    <Eyebrow>스폰서 · {index + 1} / {items.length}</Eyebrow>
                                    <Headline>{item.label ?? '스폰서 콘텐츠'}</Headline>
                                    {item.period && <Period>{item.period}</Period>}
                                </Copy>
                            </SlideCard>
                        );
                    })}
                </Track>

                {items.length > 1 && (
                    <Controls aria-label="광고 슬라이더 컨트롤">
                        <ControlButton type="button" onClick={goPrev} aria-label="이전 광고">
                            ←
                        </ControlButton>
                        <ControlButton type="button" onClick={goNext} aria-label="다음 광고">
                            →
                        </ControlButton>
                    </Controls>
                )}
            </div>

            {items.length > 1 && (
                <>
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
                    <Hint>모바일에서는 좌우로 밀어 다음 광고를 볼 수 있어요.</Hint>
                </>
            )}
            {!isClickable && (
                <Hint>광고/제휴 문의: https://open.kakao.com/o/sWIax8Vc</Hint>
            )}
        </Billboard>
    );
}

export default HeroBillboard;
