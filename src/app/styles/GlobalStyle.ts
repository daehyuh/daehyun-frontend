import {createGlobalStyle} from 'styled-components';

const GlobalStyle = createGlobalStyle`
    :root {
        color-scheme: dark;
        font-family: ${({theme}) => theme.typography.family};
        background-color: ${({theme}) => theme.colors.background};
        accent-color: ${({theme}) => theme.colors.accent};
    }

    *, *::before, *::after {
        box-sizing: border-box;
    }

    body {
        margin: 0;
        min-height: 100vh;
        background-color: ${({theme}) => theme.colors.background};
        color: ${({theme}) => theme.colors.textPrimary};
        font-family: ${({theme}) => theme.typography.family};
        font-size: ${({theme}) => theme.typography.sizes.base};
        line-height: ${({theme}) => theme.typography.lineHeights.relaxed};
        letter-spacing: -0.01em;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
    }

    body[data-scroll-locked='true'] {
        overflow: hidden;
    }

    body::before {
        content: '';
        position: fixed;
        inset: -20%;
        background: ${({theme}) => theme.gradients.glow};
        opacity: 0.55;
        filter: blur(90px);
        z-index: 0;
        pointer-events: none;
    }

    #root {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        position: relative;
        z-index: 1;
    }

    a {
        color: inherit;
        text-decoration: none;
    }

    ul {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    button,
    input,
    textarea,
    select {
        font: inherit;
        color: inherit;
        background: none;
        border: none;
    }

    button {
        cursor: pointer;
    }

    img,
    svg,
    picture,
    video {
        display: block;
        max-width: 100%;
    }

    ::selection {
        background: ${({theme}) => theme.colors.accent};
        color: ${({theme}) => theme.colors.surface};
    }

    :focus-visible {
        outline: 2px solid ${({theme}) => theme.colors.accent};
        outline-offset: 2px;
    }

    @media (max-width: ${({theme}) => theme.breakpoints.md}px) {
        body {
            font-size: 0.95rem;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
        }
    }

    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
`;

export default GlobalStyle;
