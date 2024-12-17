import styles from "@/legacy/styles/ColorRank.module.css";
import React from "react";
import styled from "styled-components";
import {Property} from "csstype";

type SpinnerProps = {
    isLoading: boolean
} & StyledSpinnerProps

type StyledSpinnerProps = {
    size?: Property.Width
    thickness?: Property.BorderWidth
    color?: Property.BorderColor
    backgroundColor?: Property.BorderColor
}

const StyledSpinnerContainer = styled.div<StyledSpinnerProps>`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 50px;
`


const StyledSpinner = styled.div<StyledSpinnerProps>`
    border: ${({thickness}) => thickness} solid ${({backgroundColor}) => backgroundColor};
    border-top: ${({thickness}) => thickness} solid #3498db;
    border-radius: 50%;
    animation: spin 2s linear infinite;
    width: ${({size}) => size};
    height: ${({size}) => size}; /* Adjust this based on your design */

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

`


const Spinner = ({
                     isLoading,
                     size = '50px',
                     thickness = '8px',
                     color = '#3498db',
                     backgroundColor = '#f3f3f3'
                 }: SpinnerProps) => {
    return isLoading ? <StyledSpinnerContainer>
        <StyledSpinner size={size} thickness={thickness} color={color} backgroundColor={backgroundColor}/>
    </StyledSpinnerContainer> : <></>
}

export default Spinner;