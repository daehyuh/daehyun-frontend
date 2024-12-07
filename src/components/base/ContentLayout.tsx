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
    align-items: start;
    width: ${({width}) => width ?? '88%'};
    gap: ${({gap}) => gap};
`

function ContentLayout({children, width, gap}: ContentBoxProps) {
    return (
        <StyledContentLayout width={width} gap={gap}>
            {children}
        </StyledContentLayout>
    );
}

export default ContentLayout