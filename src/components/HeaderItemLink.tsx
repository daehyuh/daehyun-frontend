import {Link} from "react-router-dom";
import React from "react";
import styled, {css} from "styled-components";

type HeaderItemLinkProps = {
    path: string;
    hrefs: string[];
    title?: string;
    variant?: 'primary' | 'secondary' | 'premium';
    fullWidth?: boolean;
    requiresAuth?: boolean;
    onNavigate?: () => void;
}

type StyledLinkProps = {
    $isActive: boolean;
    $variant: 'primary' | 'secondary' | 'premium';
    $fullWidth?: boolean;
}

const StyledLink = styled(Link)<StyledLinkProps>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${({theme}) => theme.spacing.xs};
    padding: ${({theme}) => `${theme.spacing.xs} ${theme.spacing.md}`};
    border-radius: ${({theme}) => theme.radii.pill};
    font-size: ${({theme}) => theme.typography.sizes.sm};
    font-weight: ${({theme}) => theme.typography.weights.medium};
    white-space: nowrap;
    transition: background ${({theme}) => theme.transitions.default}, border ${({theme}) => theme.transitions.default},
    color ${({theme}) => theme.transitions.default}, transform ${({theme}) => theme.transitions.default};
    border: 1px solid ${({theme}) => theme.colors.borderMuted};
    color: ${({theme}) => theme.colors.textPrimary};
    ${({$fullWidth}) => $fullWidth && css`
        width: 100%;
        justify-content: flex-start;
    `}

    ${({theme, $variant}) => {
        if ($variant === 'premium') {
            return css`
                background: linear-gradient(135deg, rgba(255, 95, 109, 0.18), rgba(91, 192, 248, 0.12));
                border-color: ${theme.colors.accent};
                box-shadow: 0 0 18px rgba(255, 95, 109, 0.28);
                color: ${theme.colors.textPrimary};
                font-weight: ${theme.typography.weights.semibold};
                &:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 0 22px rgba(255, 95, 109, 0.4);
                }
            `;
        }
        if ($variant === 'primary') {
            return css`
                background: ${theme.colors.surfaceMuted};
                &:hover {
                    background: ${theme.colors.surfaceElevated};
                    border-color: ${theme.colors.border};
                    transform: translateY(-1px);
                }
            `;
        }
        return css`
            background: transparent;
            border-color: ${theme.colors.border};
            color: ${theme.colors.textSecondary};
            &:hover {
                color: ${theme.colors.textPrimary};
                background: rgba(255, 255, 255, 0.04);
            }
        `;
    }}

    ${({$isActive, theme}) => $isActive && css`
        border-color: ${theme.colors.accent};
        background: ${theme.gradients.panel};
        color: ${theme.colors.textPrimary};
        font-weight: ${theme.typography.weights.semibold};
        box-shadow: 0 0 20px rgba(255, 95, 109, 0.25);
    `}
`;

function HeaderItemLink({path, hrefs, title, variant = 'primary', fullWidth, requiresAuth = false, onNavigate}: HeaderItemLinkProps) {
    const isActive = hrefs.some(e => e === path);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        onNavigate?.();
    };

    return (
        <StyledLink
            to={hrefs[0] ?? ""}
            $isActive={isActive}
            $variant={variant}
            $fullWidth={fullWidth}
            onClick={handleClick}
        >
            {title}
        </StyledLink>
    );
}

export default HeaderItemLink
