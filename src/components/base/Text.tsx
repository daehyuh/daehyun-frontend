import React from "react";
import {Property} from "csstype";
import styled from "styled-components";

type TextProps = {
    children: string | string[]
} & StyledTextProps

type StyledTextProps = {
    color?: Property.Color
    font?: Property.Font
    fontSize?: Property.FontSize
    fontWeight?: Property.FontWeight
    width?: Property.Width
    textAlign?: Property.TextAlign
    whiteSpace?: Property.WhiteSpace
}

const StyledTitle = styled.span<StyledTextProps>`
    display: inline-block;
    width: ${({width}) => width};
    text-align: ${({textAlign}) => textAlign};
    color: ${({color, theme}) => color ?? theme.colors.textPrimary};
    font: ${({font}) => font};
    font-size: ${({fontSize, theme}) => fontSize ?? theme.typography.sizes.base};
    font-weight: ${({fontWeight, theme}) => fontWeight ?? theme.typography.weights.medium};
    letter-spacing: -0.01em;
    line-height: ${({theme}) => theme.typography.lineHeights.relaxed};
    white-space: ${({whiteSpace}) => whiteSpace};
`


function Text({children, ...styles}: TextProps) {
    return <StyledTitle {...styles}>{children}</StyledTitle>
}

export type {TextProps}
export default Text
