import React from 'react';
import {Property} from "csstype";
import styled from "styled-components";

type ContentBoxProps = {
    children: React.ReactNode;
} & StyledContentLayoutProps

type StyledContentLayoutProps = {
    width?: Property.Width
    gap?: Property.Gap
}

const StyledContentLayout = styled.div<StyledContentLayoutProps>`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    max-width: ${({width}) => width ?? '100%'};
    gap: ${({gap, theme}) => gap ?? theme.spacing.lg};
`;

function ContentLayout({children, width, gap}: ContentBoxProps) {
    return (
        <StyledContentLayout width={width} gap={gap}>
            {children}
        </StyledContentLayout>
    );
}

export default ContentLayout
