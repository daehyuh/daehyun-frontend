import { Route, Routes, useLocation, Link } from "react-router-dom";
import { useState, useEffect } from "react";

import { Analytics } from '@vercel/analytics/react';
import Main from "../pages/Main.jsx";
import Footer from "../components/Footer.jsx";
import Tier from "../pages/Tier.jsx";
import Mail from "../pages/Mail.jsx";
import Exchange from "../pages/Exchange.jsx";
import Discipline from "../pages/Discipline.jsx";
import Gacha from "../pages/Gacha.jsx";
import DailyReward from "../pages/DailyReward.jsx";
import Board from "../pages/Board.jsx";
import BoardDetail from "../pages/BoardDetail.jsx";
import ColorRank from "../pages/ColorRank.jsx";
import LimitCheck from "../pages/LimitCheck.jsx";
import Header from "../components/Header.jsx";
import Ads from "../components/Ads.jsx";
import Terms from "../pages/terms.jsx";
import Privacy from "../pages/privacy.jsx";

function App() {
    const location = useLocation(); // 현재 경로 정보를 가져옴
    const [selectedMenu, setSelectedMenu] = useState(null); // 선택된 메뉴 상태

    const showHeader = location.pathname !== '/'; // "/main"일 때 Header를 렌더링하지 않도록 설정

    return (
        <>
         <Analytics /> {/* Vercel Analytics 추가 */}
            {showHeader && 
            <>
            <Header setSelectedMenu={setSelectedMenu} />
            <Ads />
            </>             
            } {/* /main 경로에서는 Header를 렌더링하지 않음 */}
            
            <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/상자깡"  element={<Gacha />} />
                <Route path="/검닉랭킹"  element={<ColorRank />} />
                <Route path="/획초체크"  element={<LimitCheck />} />
                <Route path="/티어"  element={<Tier />} />
                <Route path="/우체통" element={<Mail />} />
                <Route path="/환율" element={<Exchange />} />
                <Route path="/권엽"  element={<Discipline />} />
           
                <Route path="/출석보상"  element={<DailyReward />} />
         
                <Route path="/유저게시판"  element={<Board />} />
                <Route path="/유저게시판/:id" element={<BoardDetail />} />
                <Route path="/이용약관" element={<Terms />} />
                <Route path="/개인정보처리방침" element={<Privacy />} />
            </Routes>
            <Footer />
            <></>
        </>
    );
}

export default App;