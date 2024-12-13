import React, {useState, useEffect} from "react";
import fetchAds from "../apis/fetchAds";
import styled from "styled-components";
import Container from "./base/Container";
import { useLocation } from "react-router-dom";

const StyledAdContainer = styled.div`
    font-size: 22px; /* 글씨 크기 */
    font-weight: 600; /* 약간 굵은 텍스트 */
    color: #333333; /* 검은 배경에 잘 보이는 색상 */
    text-align: center;
    animation: fade-in 0.5s ease-in-out; /* 부드러운 등장 효과 */
    overflow: clip;

    @keyframes fade-in {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`

const StyledImage = styled.img`
    display: flex;
    width: 100%;
    max-width: 500px;
    justify-content: center;
    align-items: center;
`

const StyledA = styled.a`
    margin-top: 5px;
    margin-bottom: 5px;
    font-size: 20px;
    background-color: #1e1e1e;
    width: 100%;
    /* a태그 색 */
    color: #EAEAEA;
    text-Align:center;
    font-weight: bold;
    display:flex;
    justify-Content:center;
`


function Nofi() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [nofi, setNofi] = useState<string[]>([]);
    
    const location = useLocation();
    const { pathname } = location;
    const path = decodeURIComponent(pathname);

    // api 가져와서 ads에 저장
    useEffect(() => {
        fetchAds((nofi) => {
            setNofi(nofi.urls[0])
        })
    }, []);

    useEffect(() => {
        const interval2 = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % nofi.length);
        }, 5000); // 5초마다 두 번째 광고 변경
        return () => clearInterval(interval2);
    }, [nofi.length]);

    return (
        <Container fullWidth>
                    <StyledImage
                        src={`${nofi[currentIndex]}`}
                        alt="광고"
                    />
        
        <StyledA href="https://open.kakao.com/o/sWIax8Vc">대현 : 카카오톡 오픈카톡</StyledA>
        
        </Container>
    );
}

export default Nofi;
