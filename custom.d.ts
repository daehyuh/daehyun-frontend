import type {AppTheme} from '@/app/styles/theme';
import 'styled-components';

declare module '*.svg' {
    import React = require('react');

    export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
    const src: string;
    export default src;
}

declare module 'styled-components' {
    export interface DefaultTheme extends AppTheme {}
}
