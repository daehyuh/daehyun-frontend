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
}

const StyledTitle = styled.span<StyledTextProps>`
    width: ${({width}) => width};
    text-align: ${({textAlign}) => textAlign};
    color: ${({color}) => color ?? '#EAEAEA'};
    font: ${({font}) => font};
    font-size: ${({fontSize}) => fontSize};
    font-weight: ${({fontWeight}) => fontWeight};
`


function Text({children, ...styles}: TextProps) {
    return <StyledTitle {...styles}>{children}</StyledTitle>
}

export type {TextProps}
export default Text
