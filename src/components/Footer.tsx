import React from "react";
import styled from "styled-components";
import {Link} from "react-router-dom";

const FooterWrapper = styled.footer`
    width: 100%;
    border-radius: ${({theme}) => theme.radii.lg};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surfaceMuted};
    padding: clamp(24px, 4vw, 48px);
    box-shadow: ${({theme}) => theme.shadows.soft};
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing.lg};
`;

const FooterGrid = styled.div`
    display: grid;
    gap: ${({theme}) => theme.spacing.lg};
    grid-template-columns: repeat(1, minmax(0, 1fr));

    @media (min-width: ${({theme}) => theme.breakpoints.md}px) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
`;

const FooterSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing.sm};
`;

const FooterHeading = styled.p`
    margin: 0;
    font-size: ${({theme}) => theme.typography.sizes.xs};
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${({theme}) => theme.colors.textSecondary};
`;

const FooterBrand = styled.span`
    font-size: ${({theme}) => theme.typography.sizes.xl};
    font-weight: ${({theme}) => theme.typography.weights.semibold};
    color: ${({theme}) => theme.colors.textPrimary};
`;

const FooterLink = styled(Link)`
    color: ${({theme}) => theme.colors.textPrimary};
    text-decoration: none;
    font-size: ${({theme}) => theme.typography.sizes.sm};
    display: inline-flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing.xs};
    transition: color ${({theme}) => theme.transitions.default};

    &:hover {
        color: ${({theme}) => theme.colors.accent};
    }
`;

const ExternalLink = styled.a`
    color: ${({theme}) => theme.colors.textPrimary};
    text-decoration: none;
    font-size: ${({theme}) => theme.typography.sizes.sm};
    display: inline-flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing.xs};

    &:hover {
        color: ${({theme}) => theme.colors.accent};
    }
`;

const ContactList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing.xs};
`;

const FooterLegal = styled.div`
    border-top: 1px solid ${({theme}) => theme.colors.borderMuted};
    padding-top: ${({theme}) => theme.spacing.md};
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing.xs};
    font-size: ${({theme}) => theme.typography.sizes.xs};
    color: ${({theme}) => theme.colors.textSubtle};

    @media (min-width: ${({theme}) => theme.breakpoints.md}px) {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
`;

const InfoText = styled.span`
    color: ${({theme}) => theme.colors.textPrimary};
    font-size: ${({theme}) => theme.typography.sizes.sm};
`;

function Footer() {
    return (
        <FooterWrapper>
            <FooterGrid>
                <FooterSection>
                    <FooterBrand>DAEHYUN</FooterBrand>
                    <FooterHeading>CONTACT</FooterHeading>
                    <ContactList>
                        <ExternalLink href="mailto:rkdeown10@naver.com">rkdeown10@naver.com</ExternalLink>
                        <ExternalLink href="tel:01077122413">010-7712-2413</ExternalLink>
                    </ContactList>
                </FooterSection>

                <FooterSection>
                    <FooterHeading>POLICY</FooterHeading>
                    <FooterLink to="/terms">서비스 이용약관</FooterLink>
                    <FooterLink to="/privacy">개인정보 처리방침</FooterLink>
                </FooterSection>

                <FooterSection>
                    <FooterHeading>광고 제휴/문의</FooterHeading>
                    <ContactList>
                        <ExternalLink href="https://open.kakao.com/o/sWIax8Vc" target="_blank" rel="noreferrer">
                            카카오톡 오픈채팅
                        </ExternalLink>
                        <InfoText>후원: 토스뱅크 1000-0947-5155 (강대현)</InfoText>
                    </ContactList>
                </FooterSection>
            </FooterGrid>

            <FooterLegal>
                <span>© {new Date().getFullYear()} DAEHYUN. All rights reserved.</span>
            </FooterLegal>
        </FooterWrapper>
    );
}

export default Footer;
