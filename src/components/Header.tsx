import React, {useEffect, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import styled from "styled-components";
import {PageType} from "@/app/App";
import HeaderItemLink from "./HeaderItemLink";
import Logo from "./base/Logo";

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
    justify-content: center;

    @media (min-width: ${({theme}) => theme.breakpoints.lg}px) {
        display: flex;
    }
`;

const DesktopList = styled.div`
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

const MemberCluster = styled.div`
    display: none;
    align-items: center;
    gap: ${({theme}) => theme.spacing.sm};

    @media (min-width: ${({theme}) => theme.breakpoints.md}px) {
        display: flex;
    }
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

    const primaryPages = pages.filter(item => !item.hide);
    const memberPages = member_pages.filter(item => !item.hide);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [path]);

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
                    <DesktopList>
                        {primaryPages.map((item, index) => (
                            <HeaderItemLink
                                key={item.hrefs[0] ?? index}
                                path={path}
                                variant={'primary'}
                                {...item}
                            />
                        ))}
                    </DesktopList>
                </DesktopNav>

                <Actions>
                    <MemberCluster>
                        {memberPages.map((item, index) => (
                            <HeaderItemLink
                                key={item.hrefs[0] ?? index}
                                path={path}
                                variant={'secondary'}
                                {...item}
                            />
                        ))}
                    </MemberCluster>

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
                <NavScroller aria-label="메뉴 내비게이션">
                    {primaryPages.map((item, index) => (
                        <HeaderItemLink
                            key={item.hrefs[0] ?? index}
                            path={path}
                            {...item}
                        />
                    ))}
                </NavScroller>

                {memberPages.length > 0 && (
                    <>
                        <RailLabel>회원 툴</RailLabel>
                        <NavScroller aria-label="회원 전용 툴">
                            {memberPages.map((item, index) => (
                                <HeaderItemLink
                                    key={item.hrefs[0] ?? index}
                                    path={path}
                                    variant={'secondary'}
                                    {...item}
                                />
                            ))}
                        </NavScroller>
                    </>
                )}
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
