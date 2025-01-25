import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';

function Header() {
    const {pathname} = useLocation();
    const path = decodeURIComponent(pathname);
    console.log(path);
    
    return (
        
        <div className={styles.menu}>
            <div className={styles.header}>
                <Link to="/" className={styles.notactive}>
                    <img className={styles.logo} src="./image/logo.png" alt="LOGO" />
                </Link>
            </div>

            <div className={styles.menubar}>
                <Link
                    to="/상자깡"
                    className={path === '/상자깡' ? styles.active : styles.notactive}
                >
                    상자깡 확률
                </Link>                
                <Link
                    to="/티어"
                    className={path === '/티어' ? styles.active : styles.notactive}
                >
                    티어 계산기
                </Link>

                <Link
                    to="/우체통"
                    className={path === '/우체통' ? styles.active : styles.notactive}
                >
                    우체통 계산기
                </Link>

                <Link
                    to="/환율"
                    className={path === '/환율' ? styles.active : styles.notactive}
                >
                    환율 계산기
                </Link>

                <Link
                    to="/권엽"
                    className={path === '/권엽' ? styles.active : styles.notactive}
                >
                    권엽 계산기
                </Link>
                
                <Link
                    to="/출석보상"
                    className={path === '/출석보상' ? styles.active : styles.notactive}
                >
                    출석보상 계산기
                </Link>
                
                <Link
                    to="/컬러랭킹"
                    className={path === '/컬러랭킹' ? styles.active : styles.notactive}
                        >
                    컬러랭킹
                </Link>
                {/* <a href='rice'  className={selected === 'rice' ? styles.active : styles.notactive}
                onClick={() => handleMenuClick('rice')}
                >
                    추석이벤트 연습 사이트
                </a> */}

                {/* <Link
                    to="/rice"
                    className={selected === 'rice' ? styles.active : styles.notactive}
                    onClick={() => handleMenuClick('rice')}
                >
                    추석이벤트 연습 사이트
                </Link> */}

            </div>
        </div>
    );
}

export default Header;
