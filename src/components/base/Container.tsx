import React from "react";
import styled from "styled-components";
import {Property} from "csstype";
import Align, {alignToStyle} from "../types/Align";

type ContainerProps = {
    children: React.ReactNode;
    onClick?: () => void;
} & StyledContainerProps

type StyledContainerProps = {
    fullWidth?: boolean
    align?: Align
    flexDirection?: Property.FlexDirection
    width?: Property.Width
    gap?: Property.Gap
    background?: Property.Background
    backgroundColor?: Property.BackgroundColor
    border?: Property.Border
    borderRadius?: Property.BorderRadius
    padding?: Property.Padding
    margin?: Property.Margin
    boxShadow?: Property.BoxShadow
    minHeight?: Property.MinHeight
}

const StyledContainer = styled.div<StyledContainerProps>`
    display: flex;
    height: fit-content;
    box-sizing: border-box;
    width: ${({width, fullWidth}) => fullWidth ? '100%' : width ? width : 'fit-content'};
    max-width: 100%;
    flex-direction: ${({flexDirection}) => flexDirection ?? 'column'};
    background: ${({background}) => background};
    background-color: ${({backgroundColor}) => backgroundColor};
    border: ${({border}) => border};
    border-radius: ${({borderRadius}) => borderRadius};
    padding: ${({padding}) => padding};
    margin: ${({margin}) => margin};
    gap: ${({gap}) => gap};
    box-shadow: ${({boxShadow}) => boxShadow};
    min-height: ${({minHeight}) => minHeight};
    ${({flexDirection, align}) => alignToStyle(flexDirection ?? 'column', align ?? 'center')}
`

function Container({children, onClick, ...styles}: ContainerProps) {
    return <StyledContainer
        {...styles}
        onClick={onClick}
    >
        {children}
    </StyledContainer>
}


export default Container