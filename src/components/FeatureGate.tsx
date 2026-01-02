import React, {ReactNode, useEffect, useState} from "react";
import styled from "styled-components";
import {Text} from "@/components";

type FeatureGateProps = {
    children: ReactNode;
    title: string;
    description?: string;
};

const GateCard = styled.section`
    width: 100%;
    border-radius: ${({theme}) => theme.radii.lg};
    border: 1px solid ${({theme}) => theme.colors.accent};
    background: linear-gradient(135deg, rgba(255, 95, 109, 0.12), rgba(91, 192, 248, 0.08));
    padding: ${({theme}) => theme.spacing.xl};
    box-shadow: 0 12px 40px rgba(255, 95, 109, 0.18), 0 8px 30px rgba(0, 0, 0, 0.45);
    display: grid;
    gap: ${({theme}) => theme.spacing.sm};
    position: relative;
    overflow: hidden;

    &::after {
        content: "";
        position: absolute;
        inset: -20%;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 60%);
        opacity: 0.6;
        pointer-events: none;
    }
`;

const GateBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing.xs};
    padding: ${({theme}) => `${theme.spacing.xs} ${theme.spacing.sm}`};
    border-radius: ${({theme}) => theme.radii.pill};
    background: ${({theme}) => theme.colors.surfaceMuted};
    border: 1px solid ${({theme}) => theme.colors.border};
    font-weight: ${({theme}) => theme.typography.weights.semibold};
`;

const GateActions = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({theme}) => theme.spacing.sm};
    align-items: center;
`;

const GateButton = styled.button`
    padding: ${({theme}) => `${theme.spacing.sm} ${theme.spacing.lg}`};
    border-radius: ${({theme}) => theme.radii.pill};
    border: 1px solid ${({theme}) => theme.colors.accent};
    background: linear-gradient(135deg, ${({theme}) => theme.colors.accent}, ${({theme}) => theme.colors.accentAlt});
    color: #fff;
    font-weight: ${({theme}) => theme.typography.weights.bold};
    cursor: pointer;
    box-shadow: ${({theme}) => theme.shadows.soft};
    transition: transform ${({theme}) => theme.transitions.snappy}, box-shadow ${({theme}) => theme.transitions.default};

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 12px 30px rgba(255, 95, 109, 0.4);
    }
`;

const getAccessToken = (): string | null => {
    if (typeof document === 'undefined') return null;
    return document.cookie
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith('accessToken='))?.split('=')[1] ?? null;
};

function FeatureGate({children, title, description}: FeatureGateProps) {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => Boolean(getAccessToken()));

    useEffect(() => {
        setIsLoggedIn(Boolean(getAccessToken()));
    }, []);

    const handleLogin = () => {
        window.alert("구글 로그인 후 이용 가능합니다.");
        window.location.href = "/login";
    };

    if (isLoggedIn) {
        return <>{children}</>;
    }

    return (
        <GateCard aria-label={`${title} 접근 안내`}>
            <GateBadge>🔒 멤버 전용</GateBadge>
            <Text fontWeight="700" fontSize="1.2rem">{title}</Text>
            {description && <Text color="#A4A9C3">{description}</Text>}
            <GateActions>
                <GateButton onClick={handleLogin}>구글 로그인</GateButton>
                <Text color="#A4A9C3">멤버 로그인 후 이용 가능합니다.</Text>
            </GateActions>
        </GateCard>
    );
}

export default FeatureGate;
