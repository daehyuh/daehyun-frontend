import React from 'react';
import {Link, useLocation} from 'react-router-dom';
import HeaderItemLink from "./HeaderItemLink";
import Container from "./base/Container";
import Logo from "./base/Logo";
import styled from "styled-components";

const StyledCMenuContainer = styled(Container)`
    white-space: nowrap;
    &::-webkit-scrollbar {
        height: 8px;
    }

    &::-webkit-scrollbar-track {
        background: #3A3A3C;
    }

    &::-webkit-scrollbar-thumb {
        background: #7C7C7D;
        border-radius: 4px;
    }
`

function Header() {
    const {pathname} = useLocation();
    const path = decodeURIComponent(pathname);

    const headerItem = [
        {href: "/상자깡", title: "상자깡 확률"},
        {href: "/검닉랭킹", title: "검닉랭킹"},
        {href: "/획초체크", title: "획초체크"},
        {href: "/티어", title: "티어 계산기"},
        {href: "/우체통", title: "우체통 계산기"},
        {href: "/환율", title: "환율 계산기"},
        {href: "/권엽", title: "권엽 계산기"},
        {href: "/출석보상", title: "출석보상 계산기"},
        // {href: "/유저게시판", title: "유저게시판"}
    ]

    return (
        <Container fullWidth backgroundColor={'#85282C'} align={'topLeft'}>
            <Container fullWidth
                       align={'topLeft'}
                       background={'linear-gradient(180deg, #242426 0%, rgba(36,36,38,0) 100%)'}
                       padding={'12px 12px 0  12px'}>
                <Link to="/">
                    <Logo />
                </Link>
            </Container>
            <StyledCMenuContainer fullWidth flexDirection={'row'} gap={'20px'}  padding={'12px 12px 0  12px'} align={'topLeft'}>
                    {headerItem.map((item, index) => (
                        <HeaderItemLink key={index} path={path} {...item}/>
                    ))}
            </StyledCMenuContainer>
        </Container>
    );
}

export default Header;
