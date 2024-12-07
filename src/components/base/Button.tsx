import React from "react";
import styled from "styled-components";
import {Property} from "csstype";

type ButtonProps = {
    children?: React.ReactNode;
    onClick?: () => void
} & StyledButtonProps

type StyledButtonProps = {
    hoverBackgroundColor?: Property.BackgroundColor
    backgroundColor?: Property.BackgroundColor
    borderRadius?: Property.BorderRadius
    color?: Property.Color
    border?: Property.Border
    width?: Property.Width
    height?: Property.Height
    padding?: Property.Padding
    gap?: Property.Gap
    fontSize?: Property.FontSize
    fontWeight?: Property.FontWeight
}

const StyledButton = styled.div<StyledButtonProps>`
    background-color: ${({backgroundColor}) => backgroundColor ?? '#91282C'};
    border-radius: ${({borderRadius}) => borderRadius ?? '12px'};
    color: ${({color}) => color ?? '#EAEAEA'};
    border: ${({border}) => border ?? 'none'};
    width: ${({width}) => width ?? 'auto'};
    height: ${({height}) => height};
    padding: ${({padding}) => padding ?? '12px 36px'};
    gap: ${({gap}) => gap ?? '10px'};
    font-size: ${({fontSize}) => fontSize ?? '20px'};
    cursor: pointer;
    font-style: normal;
    font-weight: ${({fontWeight}) => fontWeight ?? '700'};
    :hover {
        background-color: ${({
                                 hoverBackgroundColor,
                                 backgroundColor
                             }) => hoverBackgroundColor ?? backgroundColor ?? '#91282C'};
    }
`

const Button = ({children, onClick, ...styles}: ButtonProps) => {
    return <StyledButton onClick={onClick} {...styles}>{children}</StyledButton>
}

export default Button