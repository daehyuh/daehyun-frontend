import React, {useEffect} from "react";
import {createPortal} from "react-dom";
import styled, {css, keyframes} from "styled-components";

export type ToastTone = 'info' | 'success' | 'danger';

export type ToastMessage = {
    tone: ToastTone;
    message: string;
};

type ToastNoticeProps = {
    notice: ToastMessage | null;
    onClose: () => void;
    duration?: number;
};

const slideIn = keyframes`
    from {
        opacity: 0;
        transform: translate3d(0, -12px, 0);
    }
    to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
    }
`;

const ToastViewport = styled.div`
    position: fixed;
    top: max(16px, env(safe-area-inset-top));
    left: 50%;
    transform: translateX(-50%);
    width: min(calc(100vw - 24px), 520px);
    z-index: ${({theme}) => theme.zIndex.modal + 20};
    pointer-events: none;
`;

const ToastCard = styled.div<{ $tone: ToastTone }>`
    pointer-events: auto;
    display: flex;
    align-items: flex-start;
    gap: ${({theme}) => theme.spacing.sm};
    width: 100%;
    padding: ${({theme}) => `${theme.spacing.md} ${theme.spacing.md}`};
    border-radius: ${({theme}) => theme.radii.lg};
    border: 1px solid ${({theme, $tone}) => $tone === 'danger'
            ? 'rgba(255, 107, 107, 0.42)'
            : $tone === 'success'
                ? 'rgba(91, 228, 155, 0.42)'
                : 'rgba(131, 181, 255, 0.42)'};
    background: ${({theme, $tone}) => $tone === 'danger'
            ? 'rgba(60, 20, 24, 0.96)'
            : $tone === 'success'
                ? 'rgba(17, 47, 31, 0.96)'
                : 'rgba(15, 31, 52, 0.96)'};
    color: ${({theme}) => theme.colors.textPrimary};
    box-shadow: 0 18px 44px rgba(0, 0, 0, 0.28);
    animation: ${slideIn} 180ms ease-out;
    backdrop-filter: blur(10px);
`;

const ToastStripe = styled.div<{ $tone: ToastTone }>`
    width: 4px;
    align-self: stretch;
    border-radius: 999px;
    background: ${({$tone}) => $tone === 'danger'
            ? '#ff7b7b'
            : $tone === 'success'
                ? '#67e09a'
                : '#7cb5ff'};
    flex-shrink: 0;
`;

const ToastBody = styled.div`
    display: grid;
    gap: 4px;
    min-width: 0;
    flex: 1;
`;

const ToastTitle = styled.strong<{ $tone: ToastTone }>`
    font-size: ${({theme}) => theme.typography.sizes.sm};
    ${({$tone}) => $tone === 'danger' && css`color: #ffd0d0;`}
    ${({$tone}) => $tone === 'success' && css`color: #cbffd9;`}
    ${({$tone}) => $tone === 'info' && css`color: #d7e8ff;`}
`;

const ToastText = styled.p`
    margin: 0;
    color: ${({theme}) => theme.colors.textPrimary};
    font-size: ${({theme}) => theme.typography.sizes.sm};
    line-height: ${({theme}) => theme.typography.lineHeights.relaxed};
    word-break: break-word;
`;

const ToastCloseButton = styled.button`
    border: none;
    background: transparent;
    color: ${({theme}) => theme.colors.textSubtle};
    font-size: 18px;
    line-height: 1;
    padding: 2px;
    cursor: pointer;
    flex-shrink: 0;

    &:hover {
        color: ${({theme}) => theme.colors.textPrimary};
    }
`;

const getToastTitle = (tone: ToastTone): string => {
    if (tone === 'danger') return '오류';
    if (tone === 'success') return '완료';
    return '안내';
};

function ToastNotice({notice, onClose, duration = 3200}: ToastNoticeProps) {
    useEffect(() => {
        if (!notice) return;

        const timeout = window.setTimeout(() => {
            onClose();
        }, duration);

        return () => window.clearTimeout(timeout);
    }, [notice, onClose, duration]);

    if (!notice || typeof document === 'undefined') {
        return null;
    }

    return createPortal(
        <ToastViewport aria-live="polite" aria-atomic="true">
            <ToastCard $tone={notice.tone} role="status">
                <ToastStripe $tone={notice.tone} aria-hidden />
                <ToastBody>
                    <ToastTitle $tone={notice.tone}>{getToastTitle(notice.tone)}</ToastTitle>
                    <ToastText>{notice.message}</ToastText>
                </ToastBody>
                <ToastCloseButton type="button" onClick={onClose} aria-label="알림 닫기">
                    ×
                </ToastCloseButton>
            </ToastCard>
        </ToastViewport>,
        document.body
    );
}

export default ToastNotice;
