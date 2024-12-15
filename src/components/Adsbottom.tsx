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
    height: 150px;
    max-height: 150px;
    justify-content: center;
    align-items: center;
    border-radius:10px;
`

function Adsbottom() {

    const [currentIndex2, setCurrentIndex2] = useState(0);

    const [ads2, setAds2] = useState<string[]>([]);
    
    const location = useLocation();
    const { pathname } = location;
    const path = decodeURIComponent(pathname);

    // api 가져와서 ads에 저장
    useEffect(() => {
        fetchAds((ads) => {
            setAds2(ads.urls[1])
        })
    }, []);

    useEffect(() => {
        const interval2 = setInterval(() => {
            setCurrentIndex2((prevIndex) => (prevIndex + 1) % ads2.length);
        }, 5000); // 5초마다 두 번째 광고 변경
        return () => clearInterval(interval2);
    }, [ads2.length]);

    return (
        <Container fullWidth>
            <Container width={'90%'}
                       border={'1px solid #7C7C7D'}
                       backgroundColor={'#3A3A3C'}
                       boxShadow={'0 0 10px 0 rgba(0, 0, 0, 0.1)'}
                       borderRadius={'10px'}>
                <StyledAdContainer>{
                    <StyledImage
                        src={`${ads2[currentIndex2]}`}
                        alt="광고"
                    />
                }</StyledAdContainer>
            </Container>

        </Container>
    );
}

export default Adsbottom;
