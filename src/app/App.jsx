import { Route, Routes, useLocation, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import '../utils/extensions/index'
import '../utils/overrideConsole'

import { Analytics } from '@vercel/analytics/react';
import Footer from "../components/Footer.tsx";
import Tier from "../pages/Tier/Tier.tsx";
import Mail from "../pages/Mail.jsx";
import Exchange from "../pages/Exchange.jsx";
import Discipline from "../pages/Discipline.jsx";
import Gacha from "../pages/Gacha/Gacha.tsx";
import DailyReward from "../pages/DailyReward";
import Board from "../pages/Board/Board.jsx";
import BoardDetail from "../pages/Board/BoardDetail.jsx";
import ColorRank from "../pages/ColorRank/ColorRank";
import LimitCheck from "../pages/LimitCheck/LimitCheck";
import Header from "../components/Header.tsx";
import Ads from "../components/Ads.tsx";
import Terms from "../pages/terms.jsx";
import Privacy from "../pages/privacy.jsx";
import Channel from "../pages/Channel/Channel.tsx";
import Nofi from "../components/Nofi.tsx";

function App() {
    const location = useLocation(); // 현재 경로 정보를 가져옴
    const [selectedMenu, setSelectedMenu] = useState('상자깡'); // 선택된 메뉴 상태

    const showHeader = location.pathname !== '/'; // "/main"일 때 Header를 렌더링하지 않도록 설정

    return (
        <>
         <Analytics /> {/* Vercel Analytics 추가 */}
            {/* {showHeader && 
            <>
            <Header setSelectedMenu={setSelectedMenu} />
            </>
            ||
            <>
            <Nofi />
            <Ads />
            </>
            
            } */}

            <Nofi />
            <Header setSelectedMenu={setSelectedMenu} />
            <Ads useInquiry={false}/>
            
            <Routes>
                <Route path="/Main" element={<Gacha />} />
                
                <Route path="/" element={<Gacha />} />
                <Route path="/상자깡"  element={<Gacha />} />
                <Route path="/검닉랭킹"  element={<ColorRank />} />
                <Route path="/획초체크"  element={<LimitCheck />} />
                <Route path="/티어"  element={<Tier />} />
                <Route path="/우체통" element={<Mail />} />
                <Route path="/환율" element={<Exchange />} />
                <Route path="/권엽"  element={<Discipline />} />
           
                <Route path="/출석보상"  element={<DailyReward />} />
                <Route path="/채널동접" element={<Channel />} />
                
         
                <Route path="/유저게시판"  element={<Board />} />
                <Route path="/유저게시판/:id" element={<BoardDetail />} />
                <Route path="/이용약관" element={<Terms />} />
                <Route path="/개인정보처리방침" element={<Privacy />} />
            </Routes>
            <Ads />
            <Footer />
        </>
    );
}

export default App;