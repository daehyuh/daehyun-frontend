import React from "react";
import styled from "styled-components";
import {Container, Text} from "@components/index";


const StyledFooter = styled.div`
    padding: 2rem 0;
    margin-inline: auto;
    font-style: normal;
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 100%; /* 부모 요소가 뷰포트 전체를 차지하게 설정 */
    color: gray;
`

const StyledA = styled.a`
    color: gray;
    text-decoration: none;
    margin-top: 10px; /* 원하는 값으로 설정 */
    margin-bottom: 10px; /* 원하는 값으로 설정 */

    &:hover {
        color: white;
    }
`

function Footer() {
    return (
        <StyledFooter>
            <Container gap={'10px'} align={'centerLeft'}>
                <Text color={'gray'}>대현닷컴 © 2021</Text>
                {/* <Text color={'gray'}>쓰리이디엇츠 · 대표 강대현</Text> */}
                {/* <Text color={'gray'}>사업자 등록번호 868-18-02199</Text> */}
                <Text color={'gray'}>문의 · rkdeown10@naver.com · 010-7712-2413</Text>
            </Container>
            <Container gap={'10px'} align={'topLeft'}>
                <StyledA href="이용약관">이용약관</StyledA>
                <StyledA href="개인정보처리방침">개인정보 처리방침</StyledA>
            </Container>
        </StyledFooter>
    );
}

export default Footer;