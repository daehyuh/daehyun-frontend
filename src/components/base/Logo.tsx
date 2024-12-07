import React from 'react';
import styled from "styled-components";
import LogoIcon from '../../assets/images/Logo.svg?react';
import {Property} from "csstype";

type LogoProps = {} & StyledLogoProps

type StyledLogoProps = {
    size?: Property.Width
}

const StyledLogo = styled(LogoIcon)<StyledLogoProps>`
    color: #EAEAEA;
    width: ${({size}) => size ?? '36px'};
    height: ${({size}) => size ?? '36px'};
    margin: 0;
    @media (max-width: 768px) {
        width: 28px;
        height: 28px;
    }
    @media (max-width: 480px) {
        width: 25px;
        height: 25px;
    }
`

function Logo({...styles}: LogoProps) {
    return <StyledLogo {...styles}/>
}

export default Logo;