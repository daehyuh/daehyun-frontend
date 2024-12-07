import React, {useRef} from "react";
import Container from "./Container";
import styled from "styled-components";

type SelectOptionType = {
    title: string
    value: string | number,
}

type SelectProps = {
    options: SelectOptionType[],
    onChange?: (value: string) => void;
}

const StyledSelect = styled.select`
    width: 100%;
    color: #EAEAEA;
    background-color: transparent;
    border: none;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;

    &:focus {
        outline: none;
    }

    &::-ms-expand {
        display: none;
    }
`

function Select({options, onChange}: SelectProps) {
    const selectRef = useRef(null);

    return (
        <Container flexDirection={"row"} gap={'10px'}>
            <StyledSelect
                ref={selectRef}
                onChange={(e) => {
                    onChange?.(e.target.value)
                }}
            >
                {options.map((option, index) => (<option key={index} value={option.value}>{option.title}</option>))}
            </StyledSelect>
        </Container>
    );
}

export type {SelectOptionType}
export default Select