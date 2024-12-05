import React, {useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import styles from './styles/Header.module.css';
import HeaderItemLink from "./HeaderItemLink.jsx";
import Container from "./base/Container.jsx";
import Logo from '../assets/images/Logo.svg?react';
import Ads from './Ads.jsx';

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
        <Container className={styles.header}>
            <Container className={styles.menu} fullWidth alignLeft>
                <Link to="/">
                    <Logo className={styles.logo}/>
                </Link>
            </Container>
            <Container fullWidth className={styles.menubar}>
                <Container fullWidth alignTop alignLeft direction={'row'} gap={20}>
                    {headerItem.map((item, index) => (
                        <HeaderItemLink key={index} path={path} {...item}/>
                    ))}
                </Container>
            </Container>
        </Container>
    );
}

export default Header;
