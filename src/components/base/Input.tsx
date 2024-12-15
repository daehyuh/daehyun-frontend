import React, {HTMLInputTypeAttribute} from "react";
import Container from "./Container";
import styled from "styled-components";
import {Property} from "csstype";

type InputProps = {
    type?: HTMLInputTypeAttribute;
    value: number | string;
    placeholder?: string;
    onChange?: (value: string) => void;
} & Omit<StyledInputContainerProps, 'isFocused'> & StyledInputProps

type StyledInputContainerProps = {
    isFocused: boolean
    width?: Property.Width
    backgroundColor?: Property.BackgroundColor
    focusedBorderColor?: Property.BorderColor
    borderColor?: Property.BorderColor
    padding?: Property.Padding
    borderRadius?: Property.BorderRadius
}

type StyledInputProps = {
    color?: Property.Color
    placeholderColor?: Property.Color
}

const StyledInputContainer = styled(Container)<StyledInputContainerProps>`
    flex-direction: row;
    justify-content: center;
    background-color: #3a3a3c;
    width: ${({width}) => width ?? undefined};
    border-width: ${({isFocused}) => isFocused ? '2px' : '1px'};
    border-style: solid;
    border-color: ${({
                         isFocused,
                         focusedBorderColor,
                         borderColor
                     }) => isFocused ? focusedBorderColor ?? '#EAEAEA' : (borderColor ?? '#7c7c7d')};
    padding: ${({padding}) => padding ?? '8px 12px'};
    border-radius: ${({borderRadius}) => borderRadius ?? '4px'};
    margin: ${({isFocused}) => isFocused ? 0 : '1px'};
`

const StyledInput = styled.input<StyledInputProps>`
    flex: 1;
    width: 100%;
    background-color: transparent;
    border: none;
    padding: 0;
    color: ${({color}) => color ?? '#EAEAEA'};
    outline: none;

    &::placeholder {
        color: ${({placeholderColor}) => placeholderColor ?? '#7C7C7D'};
    }
;
`

function Input({type = 'text', width,  value, placeholder, onChange}: InputProps) {
    const [isFocused, setIsFocused] = React.useState(false)

    return <StyledInputContainer isFocused={isFocused} width={width}>
        <StyledInput
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
                onChange?.(e.target.value)
            }}
            onFocus={() => {
                setIsFocused(true)
            }}
            onBlur={() => {
                setIsFocused(false)
            }}
        />
    </StyledInputContainer>
}

export default Input