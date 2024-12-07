import React from "react";
import styled from "styled-components";


const StyledFooter = styled.div`
    margin-top: 2rem;
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
            <div>
                <p>대현닷컴<br/>© 2021</p>
                <p>쓰리이디엇츠 · 대표 강대현</p>
                <p>사업자 등록번호 868-18-02199</p>
                <p>contact@collecti.me · 010-7712-2413</p>
            </div>
            <div>
                <StyledA href="privacy.html">이용약관</StyledA> <br></br>
                <StyledA href="terms.html">개인정보 처리방침</StyledA>
            </div>
        </StyledFooter>
    );
}

export default Footer;