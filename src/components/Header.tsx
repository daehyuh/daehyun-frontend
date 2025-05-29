import React from 'react';
import {Link, useLocation} from 'react-router-dom';
import HeaderItemLink from "./HeaderItemLink";
import Container from "./base/Container";
import Logo from "./base/Logo";
import styled from "styled-components";
import {PageType} from "@/app/App";
import { useEffect, useState } from 'react';
import AuthButton from './AuthButton';




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
    pages: PageType[];
    member_pages: PageType[];
};


function Header({pages, member_pages}: HeaderProps ) {
    const {pathname} = useLocation();
    const path = decodeURIComponent(pathname);
    
    return (
        <Container fullWidth backgroundColor={'#85282C'} align={'topLeft'} margin={'0 0 0 0'}>
            <Container fullWidth
                       align={'topLeft'}
                       background={'linear-gradient(180deg, #242426 0%, rgba(36,36,38,0) 100%)'}
                       padding={'12px 0px 12px  0px'}>
                <Link to="/">
                    <Logo/>
                </Link>
            </Container>

        <StyledCMenuContainer fullWidth flexDirection={'row'} gap={'20px'} padding={'0px 12px 12px 12px'}
                            align={'topLeft'}>
                {pages
                    .filter(item => !item.hide)
                    .map((item, index) => (
                        <HeaderItemLink key={index} path={path} {...item}/>
                    ))}
            </StyledCMenuContainer>



            <Container background={'#3a3a3c'} fullWidth align='center' padding={'12px 12px 12px 12px'} gap={'20px'}>
                <Container padding={'0 12px 12px 12px'}>
                    
                    <Container>
                        <AuthButton />
                    </Container>
                    

                </Container>
            </Container>


            <StyledCMenuContainer background={'#3a3a3c'} fullWidth flexDirection={'row'} gap={'20px'} margin={'0px 0px 10px 0px'} padding={'12px 12px 12px  12px'} align={'topLeft'}>
                {member_pages
                    .filter(item => !item.hide)
                    .map((item, index) => (
                        <HeaderItemLink key={index} path={path} {...item}/>
                    ))}
            </StyledCMenuContainer>

        </Container>
    );
}

export default Header;
