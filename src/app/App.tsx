import {Route, Routes, useLocation} from "react-router-dom";
import {ReactElement, useState} from "react";
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
import Channel from "../pages/Channel/Channel";
import Nofi from "../components/Nofi";
import MarkdownPage from "../pages/Common/MarkdownPage";
import GuildColorRank from "@/pages/GuildColorRank/GuildColorRank";
import GoogleAdSense from "@/components/GoogleAdSense";

import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: stretch; // 자식 요소가 자동으로 늘어나게 함
`;

export type PageType = {
    hide?: boolean
    hrefs: string[]
    title: string
    page: ReactElement
}

function App() {
    const pages: PageType[] = [
        {hrefs: ["/상자깡", "/"], title: "상자깡 확률", page: <Gacha/>},
        {hrefs: ["/검닉랭킹"], title: "검닉랭킹", page: <ColorRank/>},
        {hrefs: ["/길드검닉랭킹"], title: "길드검닉랭킹", page: <GuildColorRank/>},
        {hrefs: ["/획초체크"], title: "획초체크", page: <LimitCheck/>},
        {hrefs: ["/채널동접"], title: "채널동접", page: <Channel/>},
        {hrefs: ["/티어"], title: "티어 계산기", page: <Tier/>},
        {hrefs: ["/우체통"], title: "우체통 계산기", page: <Mail/>},
        {hrefs: ["/출석보상"], title: "출석보상 계산기", page: <DailyReward/>},
        {hrefs: ["/환율"], title: "환율 계산기", page: <Exchange/>},
        {hrefs: ["/권엽"], title: "권엽 계산기", page: <Discipline/>},
        {
            hide: true,
            hrefs: ["/이용약관"],
            title: "이용약관",
            page: <MarkdownPage markdownFilePath={"src/assets/markdowns/terms.md"}/>
        },
        {
            hide: true,
            hrefs: ["/개인정보처리방침"],
            title: "개인정보처리방침",
            page: <MarkdownPage markdownFilePath={"src/assets/markdowns/privacy.md"}/>
        }
    ]

    return (
        <Container>
            <Analytics/> {/* Vercel Analytics 추가 */}
            <GoogleAdSense/>
            <div style={{ flex: 1, width: '100%' }}>
            <Nofi/>
            <Header pages={pages}/>
            <Ads useInquiry={false}/>
            <Routes>
                {
                    pages.map((item) => (
                        item.hrefs.map(href => (
                            <Route key={href} path={href} element={item.page}/>
                        ))
                    ))
                }
            </Routes>
            <Ads/>
            <Footer/>
            </div>
            <GoogleAdSense/>
        </Container>
            
    );
}

export default App;