/// <reference types="vite-plugin-svgr/client" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_ADSENSE_SLOT_INLINE?: string;
    readonly VITE_ADSENSE_SLOT_RAIL?: string;
    readonly VITE_SHOW_AD_LAYOUT?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

const BASE_URL = import.meta.env.BASE_URL || '/';
