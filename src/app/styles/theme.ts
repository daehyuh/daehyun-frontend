const colors = {
    background: '#05060A',
    backgroundAlt: '#080A12',
    surface: '#11121C',
    surfaceElevated: '#1A1C28',
    surfaceMuted: '#161823',
    surfaceHighlight: 'rgba(255, 255, 255, 0.04)',
    textPrimary: '#F5F7FF',
    textSecondary: '#A4A9C3',
    textSubtle: '#6F738B',
    border: 'rgba(255, 255, 255, 0.08)',
    borderMuted: 'rgba(255, 255, 255, 0.04)',
    accent: '#FF5F6D',
    accentSoft: '#FF9A8D',
    accentAlt: '#FFB347',
    info: '#5BC0F8',
    success: '#5BE49B',
    warning: '#FFC75F',
    danger: '#FF6B6B',
    overlay: 'rgba(5, 6, 10, 0.72)',
    gradientStart: '#FF5F6D',
    gradientEnd: '#FFC371',
};

const gradients = {
    hero: 'linear-gradient(135deg, rgba(255,95,109,0.28), rgba(255,195,113,0.12))',
    panel: 'linear-gradient(160deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))',
    glow: 'radial-gradient(circle at top, rgba(255,95,109,0.35), transparent 60%)',
};

const spacing = {
    xxs: '4px',
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
};

const radii = {
    xs: '6px',
    sm: '10px',
    md: '16px',
    lg: '24px',
    pill: '999px',
};

const shadows = {
    soft: '0 6px 20px rgba(0, 0, 0, 0.35)',
    tight: '0 4px 10px rgba(0, 0, 0, 0.25)',
    outline: '0 0 0 1px rgba(255,255,255,0.12)',
};

const typography = {
    family: `"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif`,
    sizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.375rem',
        title: '1.75rem',
        display: '2.5rem',
    },
    lineHeights: {
        tight: 1.2,
        snug: 1.35,
        relaxed: 1.6,
    },
    weights: {
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },
};

const breakpoints = {
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1280,
    xxl: 1440,
};

const layout = {
    contentMaxWidth: '1200px',
    gridMaxWidth: '1440px',
    shellPaddingMobile: '20px',
    shellPaddingDesktop: '36px',
    headerHeight: '72px',
    adRailWidth: '260px',
};

const transitions = {
    default: '200ms ease',
    snappy: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
};

const zIndex = {
    base: 1,
    header: 50,
    overlay: 80,
    modal: 120,
};

const theme = {
    colors,
    gradients,
    spacing,
    radii,
    shadows,
    typography,
    breakpoints,
    layout,
    transitions,
    zIndex,
};

export type AppTheme = typeof theme;

export default theme;
