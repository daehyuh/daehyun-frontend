import React from "react";
import {Property} from "csstype";
import styled from "styled-components";

type LayoutProps = {
    children: React.ReactNode;
} & StyledLayoutProps

type StyledLayoutProps = {
    scrollable?: boolean,
    padding?: Property.Padding,
    align?: Align
}

const StyledLayout = styled.div<StyledLayoutProps>`
    display: flex;
    flex-direction: column;
    width: 100%;
    box-sizing: border-box;
    overflow-y: ${({scrollable}) => scrollable ? 'auto' : 'hidden'};
    padding: ${({padding}) => padding};
    height: ${({scrollable}) => scrollable && '100%'};
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