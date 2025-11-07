import {Route, Routes} from "react-router-dom";
import {ReactElement, useEffect, useState} from "react";
import '../utils/extensions/index'
import '../utils/overrideConsole'

import {Analytics} from '@vercel/analytics/react';
import Footer from "../components/Footer";
import Tier from "../pages/Tier/Tier";
import Mail from "../pages/Mail/Mail";
import Exchange from "../pages/Exchange/Exchange";
import Discipline from "../pages/Discipline/Discipline";
import Gacha from "../pages/Gacha/Gacha";
import DailyReward from "../pages/DailyReward/DailyReward";
import ColorRank from "../pages/ColorRank/ColorRank";
import LimitCheck from "../pages/LimitCheck/LimitCheck";
import Header from "../components/Header";
import Ads from "../components/Ads";
import GoogleAdSense from "../components/GoogleAdSense";
import Channel from "../pages/Channel/Channel";
import MarkdownPage from "../pages/Common/MarkdownPage";
import GuildColorRank from "@/pages/GuildColorRank/GuildColorRank";
import JobReceiveCalculator from "@/pages/JobReceiveCalculator/JobReceiveCalculator";
import ChannelLive from "@/pages/ChannelLive/ChannelLive";

import styled from 'styled-components';
import AuthButton from "@/components/AuthButton";

const ADSENSE_SLOTS = {
    inline: import.meta.env.VITE_ADSENSE_SLOT_INLINE,
    rail: import.meta.env.VITE_ADSENSE_SLOT_RAIL
};

const SHOW_AD_LAYOUT = import.meta.env.VITE_SHOW_AD_LAYOUT === 'true';

const Viewport = styled.div`
    width: 100%;
    min-height: 100vh;
    padding: clamp(28px, 4vw, 56px) clamp(18px, 4vw, 56px);
    background: ${({theme}) => theme.colors.background};
`;

const Shell = styled.div`
    width: 100%;
    max-width: ${({theme}) => theme.layout.gridMaxWidth};
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing.xl};
`;

const ContentGrid = styled.div<{ $hasRail: boolean }>`
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: ${({theme}) => theme.spacing.xl};
    width: 100%;

    @media (min-width: ${({theme}) => theme.breakpoints.lg}px) {
        grid-template-columns: ${({$hasRail, theme}) => $hasRail
                ? `minmax(0, 1fr) ${theme.layout.adRailWidth}`
                : 'minmax(0, 1fr)'};
    }
`;

const PrimaryColumn = styled.main`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing.xl};
`;

const PageSurface = styled.section`
    width: 100%;
    border-radius: ${({theme}) => theme.radii.lg};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surface};
    padding: clamp(20px, 3vw, 40px);
    box-shadow: ${({theme}) => theme.shadows.soft};
    backdrop-filter: blur(10px);
`;

const InlineAdsSection = styled.section`
    border-radius: ${({theme}) => theme.radii.md};
    border: 1px dashed ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surfaceMuted};
    padding: ${({theme}) => theme.spacing.lg};
    box-shadow: ${({theme}) => theme.shadows.soft};
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing.md};
`;

const SectionTitle = styled.h2`
    margin: 0;
    font-size: ${({theme}) => theme.typography.sizes.lg};
    color: ${({theme}) => theme.colors.textPrimary};
`;

const AdRail = styled.aside`
    display: none;

    @media (min-width: ${({theme}) => theme.breakpoints.lg}px) {
        display: flex;
        flex-direction: column;
        gap: ${({theme}) => theme.spacing.lg};
        position: sticky;
        top: ${({theme}) => `calc(${theme.layout.headerHeight} + ${theme.spacing.lg})`};
    }
`;

const RailCard = styled.div`
    border-radius: ${({theme}) => theme.radii.lg};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surfaceElevated};
    padding: ${({theme}) => theme.spacing.lg};
    box-shadow: ${({theme}) => theme.shadows.soft};
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing.sm};
`;

const RailTitle = styled.p`
    margin: 0;
    font-weight: ${({theme}) => theme.typography.weights.semibold};
    color: ${({theme}) => theme.colors.textPrimary};
`;

const PrankOverlay = styled.div`
    position: fixed;
    inset: 0;
    background-color: black;
    z-index: ${({theme}) => theme.zIndex.modal};
    display: flex;
    justify-content: center;
    align-items: center;
`;

export type PageType = {
    hide?: boolean
    hrefs: string[]
    title: string
    page: ReactElement
}

function App() {
    const [showPrank, setShowPrank] = useState(false);
    
    useEffect(() => {
        const timeout = setTimeout(() => {
            setShowPrank(false);
        }, 3000);

        const skip = () => setShowPrank(false);
        
        window.addEventListener("click", skip);
        window.addEventListener("keydown", skip);
        window.addEventListener("mousemove", skip);
        window.addEventListener("scroll", skip);

        return () => {
            clearTimeout(timeout);
            window.removeEventListener("click", skip);
            window.removeEventListener("keydown", skip);
            window.removeEventListener("mousemove", skip);
            window.removeEventListener("scroll", skip);
        };
    }, []);
    
    const pages: PageType[] = [
        {hrefs: ["/상자깡", "/"], title: "상자깡 확률", page: <Gacha/>},
        {hrefs: ["/티어"], title: "티어 계산기", page: <Tier/>},
        {hrefs: ["/우체통"], title: "우체통 계산기", page: <Mail/>},
        {hrefs: ["/출석보상"], title: "출석보상 계산기", page: <DailyReward/>},
        {hrefs: ["/환율"], title: "환율 계산기", page: <Exchange/>},
        {hrefs: ["/권엽"], title: "권엽 계산기", page: <Discipline/>},
        {hrefs: ["/직플받"], title: "직플받 계산기", page: <JobReceiveCalculator/>},
        {hrefs: ["/동접"], title: "실시간 동접", page: <ChannelLive/>},
        {
            hide: true,
            hrefs: ["/이용약관"],
            title: "이용약관",
            page: <MarkdownPage markdownFilePath={"/markdowns/terms.md"}/>
        },
        {
            hide: true,
            hrefs: ["/개인정보처리방침"],
            title: "개인정보처리방침",
            page: <MarkdownPage markdownFilePath={"markdowns/privacy.md"}/>
        }
    ]


    const member_pages: PageType[] = [
        {hide: true, hrefs: ["/인증"], title: "인증/유저등록", page: <AuthButton/>},
        {hide: true, hrefs: ["/검닉랭킹"], title: "검닉랭킹", page: <ColorRank/>},
        {hide: true, hrefs: ["/길드배경랭킹"], title: "길드배경랭킹", page: <GuildColorRank/>},
        {hide: true, hrefs: ["/전적검색"], title: "전적검색", page: <LimitCheck/>},
        {hide: true, hrefs: ["/채널동접"], title: "채널동접", page: <Channel/>},
    ]

    if (showPrank) {
        return (
            <PrankOverlay>
                <img
                    src="https://api.xn--vk1b177d.com/web/images/ad/%EB%A7%8C%EC%9A%B0%EC%A0%88.png"
                    alt="만우절 이벤트"
                    style={{maxWidth: "100%", maxHeight: "100%"}}
                />
            </PrankOverlay>
        );
    }

    return (
        <Viewport>
            <Analytics/>
            <Shell>
                <Header pages={pages} member_pages={member_pages}/>

                <ContentGrid $hasRail={SHOW_AD_LAYOUT}>
                    <PrimaryColumn>
                        <PageSurface>
                            <Routes>
                                {
                                    member_pages.map((item) => (
                                        item.hrefs.map(href => (
                                            <Route key={href} path={href} element={item.page}/>
                                        ))
                                    ))
                                }
                                {
                                    pages.map((item) => (
                                        item.hrefs.map(href => (
                                            <Route key={href} path={href} element={item.page}/>
                                        ))
                                    ))
                                }
                            </Routes>
                        </PageSurface>

                        {SHOW_AD_LAYOUT && (
                            <InlineAdsSection aria-label="콘텐츠와 맞물린 광고 영역">
                                <SectionTitle>스폰서</SectionTitle>
                                <GoogleAdSense
                                    slotId={ADSENSE_SLOTS.inline}
                                    label="인라인 반응형 광고"
                                    layout="in-article"
                                    minHeight="200px"
                                />
                                <Ads/>
                            </InlineAdsSection>
                        )}
                    </PrimaryColumn>

                    {SHOW_AD_LAYOUT && (
                        <AdRail aria-label="사이드 광고 레일">
                            <RailCard>
                                <RailTitle>사이드 광고</RailTitle>
                                <GoogleAdSense
                                    slotId={ADSENSE_SLOTS.rail}
                                    label="사이드 고정형 광고"
                                    minHeight="600px"
                                />
                            </RailCard>
                        </AdRail>
                    )}
                </ContentGrid>

                <Footer/>
            </Shell>
        </Viewport>
    );
}

export default App;
