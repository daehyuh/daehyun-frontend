import React from "react";
import styled from "styled-components";
import {Property} from "csstype";

type AProps = {
    children?: React.ReactNode;
    href?: string
} & StyledAProps

type StyledAProps = {
    hoverBackgroundColor?: Property.BackgroundColor
    backgroundColor?: Property.BackgroundColor
    borderRadius?: Property.BorderRadius
    border?: Property.Border
    width?: Property.Width
    height?: Property.Height
    padding?: Property.Padding
    gap?: Property.Gap
}

const StyledA = styled.a<StyledAProps>`
    position: relative;
    box-sizing: border-box;
    background-color: ${({backgroundColor}) => backgroundColor ?? '#91282C'};
    border-radius: ${({borderRadius}) => borderRadius ?? '12px'};
    border: ${({border}) => border ?? 'none'};
    width: ${({width}) => width ?? 'auto'};
    height: ${({height}) => height};
    padding: ${({padding}) => padding ?? '12px 36px'};
    gap: ${({gap}) => gap ?? '10px'};
`

const A = ({children, href, ...styles}: AProps) => {
    return <StyledA href={href} {...styles}>{children}</StyledA>
}

export default A