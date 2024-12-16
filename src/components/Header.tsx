import React from 'react';
import {Link, useLocation} from 'react-router-dom';
import HeaderItemLink from "./HeaderItemLink";
import Container from "./base/Container";
import Logo from "./base/Logo";
import styled from "styled-components";
import {PageType} from "@/app/App";

const StyledCMenuContainer = styled(Container)`
    overflow-x: scroll;
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

type HeaderProps = {
    pages: PageType[]
}

function Header({pages}: HeaderProps) {
    const {pathname} = useLocation();
    const path = decodeURIComponent(pathname);

    return (
        <Container fullWidth backgroundColor={'#85282C'} align={'topLeft'} margin={'0 0 15px 0'}>
            <Container fullWidth
                       align={'topLeft'}
                       background={'linear-gradient(180deg, #242426 0%, rgba(36,36,38,0) 100%)'}
                       padding={'12px 12px 12px  12px'}>
                <Link to="/">
                    <Logo/>
                </Link>
            </Container>
            <StyledCMenuContainer fullWidth flexDirection={'row'} gap={'20px'} padding={'12px 12px 0  12px'}
                                  align={'topLeft'}>
                {pages
                    .filter(item => !item.hide)
                    .map((item, index) => (
                        <HeaderItemLink key={index} path={path} {...item}/>
                    ))}
            </StyledCMenuContainer>
        </Container>
    );
}

export default Header;
