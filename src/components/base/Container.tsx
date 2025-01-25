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
    noAlign?: boolean
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
    maxHeight?: Property.MaxHeight
    overflow?: Property.Overflow
}

const StyledContainer = styled.div<StyledContainerProps>`
    position: relative;
    display: flex;
    height: fit-content;
    box-sizing: border-box;
    margin-bottom: 10px;
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
    max-height: ${({maxHeight}) => maxHeight};
    overflow: ${({overflow}) => overflow};
    ${({flexDirection, align, noAlign}) => !noAlign && alignToStyle(flexDirection ?? 'column', align ?? 'center')}
    
    ::-webkit-scrollbar {
        height: 8px; /* 세로 스크롤바 높이 */
    }

    ::-webkit-scrollbar-track {
        background: #3A3A3C;
    }

    ::-webkit-scrollbar-thumb {
        background: #7C7C7D;
        border-radius: 4px;
    }
`

function Container({children, onClick, ...styles}: ContainerProps) {
    return <StyledContainer
        {...styles}
        onClick={onClick}
    >
        {children}
    </StyledContainer>
}

export type {ContainerProps}
export default Container