import React, {useEffect, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import styled from "styled-components";
import {PageType} from "@/app/App";
import HeaderItemLink from "./HeaderItemLink";
import Logo from "./base/Logo";
import {startGoogleLogin} from "@/utils/googleLogin";

type HeaderProps = {
    pages: PageType[];
    member_pages: PageType[];
};

const HeaderWrapper = styled.header`
    position: sticky;
    top: 0;
    z-index: ${({theme}) => theme.zIndex.header};
    backdrop-filter: blur(0px);
`;

const HeaderSurface = styled.div`
    display: flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing.md};
    padding: ${({theme}) => theme.spacing.md};
    border-radius: ${({theme}) => theme.radii.lg};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: rgba(10, 12, 18, 0.92);
    backdrop-filter: blur(18px);
    box-shadow: ${({theme}) => theme.shadows.soft};
`;

const BrandLink = styled(Link)`
    display: inline-flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing.sm};
    color: ${({theme}) => theme.colors.textPrimary};
    text-decoration: none;
`;

const BrandCopy = styled.div`
    display: flex;
    flex-direction: column;
    line-height: 1.1;
`;

const BrandTitle = styled.span`
    font-size: ${({theme}) => theme.typography.sizes.lg};
    font-weight: ${({theme}) => theme.typography.weights.semibold};
`;

const BrandCaption = styled.span`
    font-size: ${({theme}) => theme.typography.sizes.xs};
    color: ${({theme}) => theme.colors.textSecondary};
    letter-spacing: 0.08em;
    text-transform: uppercase;
`;

const DesktopNav = styled.nav`
    flex: 1;
    display: none;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing.xs};

    @media (min-width: ${({theme}) => theme.breakpoints.lg}px) {
        display: flex;
    }
`;

const NavRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({theme}) => theme.spacing.sm};
    justify-content: center;
`;

const Actions = styled.div`
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing.sm};
`;

const MobileMenuButton = styled.button`
    width: 44px;
    height: 44px;
    border-radius: ${({theme}) => theme.radii.pill};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surfaceMuted};
    color: ${({theme}) => theme.colors.textPrimary};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background ${({theme}) => theme.transitions.default};

    &:hover {
        background: ${({theme}) => theme.colors.surfaceElevated};
    }

    @media (min-width: ${({theme}) => theme.breakpoints.lg}px) {
        display: none;
    }
`;

const MenuIcon = styled.span`
    position: relative;
    width: 18px;
    height: 2px;
    background: currentColor;

    &::before,
    &::after {
        content: '';
        position: absolute;
        left: 0;
        width: 18px;
        height: 2px;
        background: currentColor;
        transition: transform ${({theme}) => theme.transitions.default};
    }

    &::before {
        transform: translateY(-6px);
    }

    &::after {
        transform: translateY(6px);
    }
`;

const NavRail = styled.div`
    margin-top: ${({theme}) => theme.spacing.sm};
    padding: ${({theme}) => `${theme.spacing.sm} ${theme.spacing.md}`};
    border-radius: ${({theme}) => theme.radii.lg};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surfaceMuted};
    box-shadow: ${({theme}) => theme.shadows.soft};
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing.sm};

    @media (min-width: ${({theme}) => theme.breakpoints.lg}px) {
        display: none;
    }
`;

const NavScroller = styled.nav`
    display: flex;
    gap: ${({theme}) => theme.spacing.sm};
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: ${({theme}) => theme.spacing.xs};
    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }
`;

const RailLabel = styled.p`
    margin: 0;
    font-size: ${({theme}) => theme.typography.sizes.xs};
    color: ${({theme}) => theme.colors.textSecondary};
    letter-spacing: 0.08em;
    text-transform: uppercase;
`;

const MobileMenuOverlay = styled.div<{ $isOpen: boolean }>`
    position: fixed;
    inset: 0;
    background: ${({theme}) => theme.colors.overlay};
    backdrop-filter: blur(12px);
    opacity: ${({$isOpen}) => $isOpen ? 1 : 0};
    pointer-events: ${({$isOpen}) => $isOpen ? 'auto' : 'none'};
    transition: opacity ${({theme}) => theme.transitions.default};
    z-index: ${({theme}) => theme.zIndex.overlay};
`;

const MobileMenuSheet = styled.div<{ $isOpen: boolean }>`
    position: absolute;
    inset: ${({theme}) => theme.spacing.lg};
    border-radius: ${({theme}) => theme.radii.lg};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surfaceElevated};
    padding: ${({theme}) => theme.spacing.lg};
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing.lg};
    transform: ${({$isOpen}) => $isOpen ? 'translateY(0)' : 'translateY(20px)'};
    transition: transform ${({theme}) => theme.transitions.snappy};
    max-height: calc(100vh - 2 * ${({theme}) => theme.spacing.lg});
    overflow-y: auto;
`;

const SheetHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const CloseButton = styled.button`
    width: 40px;
    height: 40px;
    border-radius: ${({theme}) => theme.radii.pill};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surfaceMuted};
    color: ${({theme}) => theme.colors.textPrimary};
`;

const GoogleButton = styled.a`
    display: inline-flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing.sm};
    padding: ${({theme}) => `${theme.spacing.xs} ${theme.spacing.md}`};
    border-radius: ${({theme}) => theme.radii.pill};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: #fff;
    color: #202124;
    font-weight: ${({theme}) => theme.typography.weights.semibold};
    text-decoration: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.12);

    svg {
        width: 18px;
        height: 18px;
    }
`;

const GoogleLogo = () => (
    <svg viewBox="0 0 488 512" aria-hidden="true" focusable="false">
        <path fill="#EA4335" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.3 0 122 24.4 164.7 64.6l-66.8 64.2C310 104.5 281.3 92.7 248 92.7c-85.8 0-155.4 69.2-155.4 155.3 0 86 69.6 155.3 155.4 155.3 79.1 0 130-45.3 136-108.6H248v-87.4h240c2.2 12.7 4 24.9 4 43.5z"/>
    </svg>
);

const MobileSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing.sm};
`;

const MobileSectionTitle = styled.p`
    margin: 0;
    font-size: ${({theme}) => theme.typography.sizes.sm};
    color: ${({theme}) => theme.colors.textSecondary};
    letter-spacing: 0.08em;
    text-transform: uppercase;
`;

function Header({pages, member_pages}: HeaderProps) {
    const {pathname} = useLocation();
    const path = decodeURIComponent(pathname);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [hasToken, setHasToken] = useState<boolean>(() => {
        if (typeof document === 'undefined') return false;
        return document.cookie.includes('accessToken=');
    });

    const memberPages = member_pages.filter(item => !item.hide);
    const primaryPages = pages.filter(item => !item.hide);
    const loginPage = primaryPages.find(item => item.hrefs.includes('/login') || item.hrefs.includes('/인증'));
    const generalPages = primaryPages.filter(item => item !== loginPage);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [path]);

    useEffect(() => {
        const syncToken = () => {
            if (typeof document === 'undefined') return;
            setHasToken(document.cookie.includes('accessToken='));
        };
        syncToken();
        const interval = setInterval(syncToken, 2000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (typeof document === 'undefined') return;

        if (isMobileMenuOpen) {
            document.body.setAttribute('data-scroll-locked', 'true');
        } else {
            document.body.removeAttribute('data-scroll-locked');
        }

        return () => {
            document.body.removeAttribute('data-scroll-locked');
        };
    }, [isMobileMenuOpen]);

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <HeaderWrapper>
            <HeaderSurface>
                <BrandLink to="/">
                    <Logo size={'42px'}/>
                    <BrandCopy>
                        <BrandTitle>대현닷컴</BrandTitle>
                        <BrandCaption>since 2021</BrandCaption>
                    </BrandCopy>
                </BrandLink>

                <DesktopNav aria-label="메뉴 (데스크톱)">
                    <NavRow>
                        {loginPage && (
                            <HeaderItemLink
                                key={loginPage.hrefs[0]}
                                path={path}
                                variant={'premium'}
                                {...loginPage}
                            />
                        )}
                        {memberPages.map((item, index) => (
                            <HeaderItemLink
                                key={item.hrefs[0] ?? `member-${index}`}
                                path={path}
                                variant={'premium'}
                                requiresAuth={true}
                                {...item}
                            />
                        ))}
                    </NavRow>
                    <NavRow>
                        {generalPages.map((item, index) => (
                            <HeaderItemLink
                                key={item.hrefs[0] ?? `general-${index}`}
                                path={path}
                                variant={'primary'}
                                requiresAuth={item.requiresAuth}
                                {...item}
                            />
                        ))}
                    </NavRow>
                </DesktopNav>

                <Actions>
                    {loginPage && !hasToken && (
                        <GoogleButton href={loginPage.hrefs[0]} onClick={(e) => {
                            e.preventDefault();
                            startGoogleLogin();
                        }}>
                            <GoogleLogo/>
                            <span>Google로 로그인</span>
                        </GoogleButton>
                    )}
                    {hasToken && (
                        <GoogleButton href={`${loginPage?.hrefs[0] ?? '/'}`} onClick={(e) => {
                            e.preventDefault();
                            window.location.href = `${loginPage?.hrefs[0] ?? '/'}`;
                        }}>
                            <GoogleLogo/>
                            <span>로그아웃</span>
                        </GoogleButton>
                    )}
                    <MobileMenuButton
                        type="button"
                        aria-label="전체 메뉴 열기"
                        aria-expanded={isMobileMenuOpen}
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <MenuIcon/>
                    </MobileMenuButton>
                </Actions>
            </HeaderSurface>

            <NavRail>
                {memberPages.length > 0 && (
                    <>
                        <RailLabel>멤버 툴</RailLabel>
                        <NavScroller aria-label="회원 전용 툴">
                            {loginPage && (
                                <HeaderItemLink
                                    key={loginPage.hrefs[0]}
                                    path={path}
                                    variant={'premium'}
                                    {...loginPage}
                                />
                            )}
                            {memberPages.map((item, index) => (
                                <HeaderItemLink
                                    key={item.hrefs[0] ?? index}
                                    path={path}
                                    variant={'premium'}
                                    requiresAuth={true}
                                    {...item}
                                />
                            ))}
                        </NavScroller>
                    </>
                )}

                <RailLabel>일반 도구</RailLabel>
                <NavScroller aria-label="일반 도구">
                    {generalPages.map((item, index) => (
                        <HeaderItemLink
                            key={item.hrefs[0] ?? index}
                            path={path}
                            requiresAuth={item.requiresAuth}
                            {...item}
                        />
                    ))}
                </NavScroller>
            </NavRail>

            <MobileMenuOverlay $isOpen={isMobileMenuOpen} aria-hidden={!isMobileMenuOpen} onClick={closeMobileMenu}>
                <MobileMenuSheet $isOpen={isMobileMenuOpen} onClick={(event) => event.stopPropagation()}>
                    <SheetHeader>
                        <BrandCopy>
                            <BrandTitle>전체 메뉴</BrandTitle>
                            <BrandCaption>빠른 점프</BrandCaption>
                        </BrandCopy>
                        <CloseButton type="button" aria-label="메뉴 닫기" onClick={closeMobileMenu}>
                            ✕
                        </CloseButton>
                    </SheetHeader>

                    <MobileSection>
                        {primaryPages.map((item, index) => (
                            <HeaderItemLink
                                key={`mobile-primary-${item.hrefs[0] ?? index}`}
                                path={path}
                                fullWidth
                                onNavigate={closeMobileMenu}
                                {...item}
                            />
                        ))}
                    </MobileSection>

                    {memberPages.length > 0 && (
                        <MobileSection>
                            <MobileSectionTitle>회원 툴</MobileSectionTitle>
                            {memberPages.map((item, index) => (
                                <HeaderItemLink
                                    key={`mobile-member-${item.hrefs[0] ?? index}`}
                                    path={path}
                                    variant={'secondary'}
                                    fullWidth
                                    onNavigate={closeMobileMenu}
                                    {...item}
                                />
                            ))}
                        </MobileSection>
                    )}
                </MobileMenuSheet>
            </MobileMenuOverlay>
        </HeaderWrapper>
    );
}

export default Header;
