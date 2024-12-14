import React, {useEffect, useState} from "react";
import Check from "../../assets/icons/check.svg?react"
import styled from "styled-components";
import {Property} from "csstype";

type CheckBoxProps = {
    id: string;
    value?: boolean;
    onChecked?: (isChecked: boolean) => void;
} & Omit<StyledCheckBoxLabelProps, 'isChecked'> & StyledCheckBoxIconProps

type StyledCheckBoxLabelProps = {
    isChecked?: boolean
    size?: Property.Width
    borderRadius?: Property.BorderRadius
}

type StyledCheckBoxIconProps = {
    iconSize?: Property.Width
}

const StyledCheckBoxLabel = styled.label<StyledCheckBoxLabelProps>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${({size}) => size ?? "28px"};
    height: ${({size}) => size ?? "28px"};
    border-radius: ${({borderRadius}) => borderRadius ?? "4px"};
    background-color: ${({isChecked}) => isChecked ? "#91282C" : "#3A3A3C"};
    color: ${({isChecked}) => isChecked ? "#D82F45" : "#343435"};
`

const StyledCheckBoxInput = styled.input`
    display: none;
    appearance: none;
`

const StyledCheckBoxIcon = styled(Check)<StyledCheckBoxIconProps>`
    width: ${({iconSize}) => iconSize ?? "16px"};
    height: ${({iconSize}) => iconSize ?? "16px"};
`

function CheckBox({id, value, onChecked, iconSize, ...styles}: CheckBoxProps) {
    const [isChecked, setIsChecked] = useState(value ?? false)

    useEffect(() => {
        console.log(value)
    }, [value]);

    return (<StyledCheckBoxLabel htmlFor={id} isChecked={isChecked} {...styles}>
        <StyledCheckBoxInput
            id={id}
            type="checkbox"
            value={value as any}
            onChange={(e) => {
                setIsChecked(e.target.checked)
                onChecked?.(e.target.checked)
            }}
        />
        <StyledCheckBoxIcon iconSize={iconSize}/>
    </StyledCheckBoxLabel>)
}

export default CheckBox