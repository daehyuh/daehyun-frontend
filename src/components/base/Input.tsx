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
    width: ${({width}) => width ?? 'auto'};
    background-color: ${({backgroundColor, theme}) => backgroundColor ?? theme.colors.surfaceMuted};
    border: ${({isFocused, focusedBorderColor, borderColor, theme}) => isFocused
            ? `1px solid ${focusedBorderColor ?? theme.colors.accent}`
            : `1px solid ${borderColor ?? theme.colors.border}`};
    padding: ${({padding, theme}) => padding ?? `${theme.spacing.xs} ${theme.spacing.md}`};
    border-radius: ${({borderRadius, theme}) => borderRadius ?? theme.radii.md};
    transition: border-color ${({theme}) => theme.transitions.default}, background-color ${({theme}) => theme.transitions.default};
`

const StyledInput = styled.input<StyledInputProps>`
    flex: 1;
    width: 100%;
    background-color: transparent;
    border: none;
    padding: 0;
    color: ${({color, theme}) => color ?? theme.colors.textPrimary};
    outline: none;
    font-size: ${({theme}) => theme.typography.sizes.base};

    &::placeholder {
        color: ${({placeholderColor, theme}) => placeholderColor ?? theme.colors.textSecondary};
    }
;
`

function Input({type = 'text', width, value, placeholder, onChange, ...styles}: InputProps) {
    const [isFocused, setIsFocused] = React.useState(false)

    return <StyledInputContainer isFocused={isFocused} width={width} {...styles}>
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
