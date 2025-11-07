import React from "react";
import {Property} from "csstype";
import styled from "styled-components";
import Align, {alignToStyle} from "../types/Align";

type LayoutProps = {
    children: React.ReactNode;
} & StyledLayoutProps

type StyledLayoutProps = {
    scrollable?: boolean,
    padding?: Property.Padding,
    align?: Align,
    gap?: Property.Gap
}

const StyledLayout = styled.div<StyledLayoutProps>`
    display: flex;
    flex-direction: column;
    width: 100%;
    box-sizing: border-box;
    position: relative;
    overflow-y: ${({scrollable}) => scrollable ? 'auto' : 'visible'};
    padding: ${({padding}) => padding};
    gap: ${({gap, theme}) => gap ?? theme.spacing.lg};
    height: ${({scrollable}) => scrollable && '100%'};
    ${({align}) => alignToStyle('column', align ?? 'centerLeft')}
`

function Layout({
                    children,
                    ...styles
                }: LayoutProps) {
    return <StyledLayout {...styles}>
        {children}
    </StyledLayout>
}

export default Layout
