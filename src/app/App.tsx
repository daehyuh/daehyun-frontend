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
import Channel from "../pages/Channel/Channel";
import Nofi from "../components/Nofi";
import MarkdownPage from "../pages/Common/MarkdownPage";
import GuildColorRank from "@/pages/GuildColorRank/GuildColorRank";
import GoogleAdSense from "@/components/GoogleAdSense";

import styled from 'styled-components';


const StyledA = styled.a`
    margin-top: 20px;
    margin-bottom: 20px;
    font-size: 20px;
    background-color: #1e1e1e;
    width: 100%;
    /* a태그 색 */
    color: #EAEAEA;
    text-Align: center;
    font-weight: bold;
    display: flex;
    justify-Content: center;`


const Container = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
`;

export type PageType = {
    hide?: boolean
    hrefs: string[]
    title: string
    page: ReactElement
}

function App() {

    function copytoclipboard(val: string){
			var t = document.createElement("textarea");
			document.body.appendChild(t);
			t.value = val;
			t.select();
			document.execCommand('copy');
			document.body.removeChild(t);
		};
		function inappbrowserout(){
			copytoclipboard(window.location.href);
			alert('URL주소가 복사되었습니다.\n\nSafari가 열리면 주소창을 길게 터치한 뒤, "붙여놓기 및 이동"를 누르면 정상적으로 이용하실 수 있습니다.');
			location.href='x-web-search://?';
		};
        
    useEffect(() => {
    const useragt = navigator.userAgent.toLowerCase();
    const isKakao = useragt.match(/kakaotalk/i);
    const isLine = useragt.match(/line/i);
    const isAny = useragt.match(/inapp|naver|snapchat|wirtschaftswoche|thunderbird|instagram|everytimeapp|whatsApp|electron|wadiz|aliapp|zumapp|iphone(.*)whale|android(.*)whale|kakaostory|band|twitter|DaumApps|DaumDevice\/mobile|FB_IAB|FB4A|FBAN|FBIOS|FBSS|trill|SamsungBrowser\/[^1]/i)
		const target_url = location.href;
    
    if(isKakao) {
      //카톡 외부브라우저로 호출
      location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(location.href);
    }else if(isLine){
			
			//라인 외부브라우저로 호출
			if(target_url.indexOf('?') !== -1){
				location.href = target_url+'&openExternalBrowser=1';
			}else{
				location.href = target_url+'?openExternalBrowser=1';
			}
			
		}else if(isAny){
            
			//그외 다른 인앱들
			if(useragt.match(/iphone|ipad|ipod/i)){
                
				var mobile = document.createElement('meta');
				mobile.name = 'viewport';
				mobile.content = "width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no, minimal-ui";
				document.getElementsByTagName('head')[0].appendChild(mobile);
				var fonts = document.createElement('link');
        
				fonts.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap';
				document.getElementsByTagName('head')[0].appendChild(fonts);
				document.body.innerHTML = "<style>body{margin:0;padding:0;font-family: 'Noto Sans KR', sans-serif;overflow: hidden;height: 100%;}</style><h2 style='padding-top:50px; text-align:center;font-family: 'Noto Sans KR', sans-serif;'>인앱브라우저 호환문제로 인해<br />Safari로 접속해야합니다.</h2><article style='text-align:center; font-size:17px; word-break:keep-all;color:#999;'>아래 버튼을 눌러 Safari를 실행해주세요<br />Safari가 열리면, 주소창을 길게 터치한 뒤,<br />'붙여놓기 및 이동'을 누르면<br />정상적으로 이용할 수 있습니다.<br /><br /><button onclick='inappbrowserout();' style='min-width:180px;margin-top:10px;height:54px;font-weight: 700;background-color:#31408E;color:#fff;border-radius: 4px;font-size:17px;border:0;'>Safari로 열기</button></article><img style='width:70%;margin:50px 15% 0 15%' src='https://tistory3.daumcdn.net/tistory/1893869/skin/images/inappbrowserout.jpeg' />";
                
                
			}else{
        // if(target_url.indexOf('?') !== -1){
        //   location.href = target_url+'&openExternalBrowser=1';
        // }else{
        //   location.href = target_url+'?openExternalBrowser=1';
        // }
				location.href='intent://'+target_url.replace(/https?:\/\//i,'')+'#Intent;scheme=http;package=com.android.chrome;end';
			}
    }


  }, []);
  

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
        {hrefs: ["/검닉랭킹"], title: "검닉랭킹", page: <ColorRank/>},
        {hrefs: ["/길드배경랭킹"], title: "길드배경랭킹", page: <GuildColorRank/>},
        {hrefs: ["/전적검색"], title: "전적검색", page: <LimitCheck/>},
        {hrefs: ["/채널동접"], title: "채널동접", page: <Channel/>},
    ]

    if (showPrank) {
        return (
            <div style={{
                position: "fixed",
                top: 0, left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "black",
                zIndex: 9999,
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <img
                    src="https://api.xn--vk1b177d.com/web/images/ad/%EB%A7%8C%EC%9A%B0%EC%A0%88.png"
                    alt="만우절 이벤트"
                    style={{maxWidth: "100%", maxHeight: "100%"}}
                />
            </div>
        );
    }

    return (
        <Container>
            <Analytics/>
            <GoogleAdSense/>
            <div style={{ flex: 1, width: '100%'}}>
                <Nofi/>
                <Header pages={pages} member_pages={member_pages}/>
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
                <Footer/>
            </div>
            <GoogleAdSense/>
        </Container>
    );
}

export default App;
