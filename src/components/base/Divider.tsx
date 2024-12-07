import React from "react";
import {Property} from "csstype";
import styled from "styled-components";

type DividerProps = { } & StyledDividerProps

type StyledDividerProps = {
    dividerColor?: Property.BackgroundColor
    padding?: Property.Padding
}

const StyledDivider = styled.div<StyledDividerProps>`
    width: 100%;
    box-sizing: border-box;
    height: 2px;
    background-color: ${({dividerColor}) => dividerColor ?? '#91282C'} ;
    padding: ${({padding}) => padding};
`

function Divider({padding}:DividerProps) {
    return (
        <StyledDivider padding={padding}/>
    );
}

export default Divider