import React from "react";
import styled from "styled-components";
import ReactSelect from "react-select";
import {Property} from "csstype";

type SelectOptionType = {
    label: string
    value: string | number,
}

type SelectProps = {
    value: SelectOptionType
    options: SelectOptionType[],
    onChange?: (value: SelectOptionType) => void;
} & StyledSelectProps

type StyledSelectProps = {
    width?: Property.Width
}

const StyledSelect = styled(ReactSelect)<StyledSelectProps>`
    flex: 1;
    width: ${({width}) => width ?? '60%'};
    color: #EAEAEA;
    background-color: #3a3a3c;
    border: 1px solid #7c7c7d;
    border-radius: 4px;
    padding: 4px 12px;
    cursor: pointer;
    caret-color: transparent;
    
    .Select__menu {
        color: #3c3d3e;
        left: 0;
        width: 100%;
        background-color: #3A3A3C;
        padding: 4px 4px;
        border: 1px solid #7c7c7d;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
        z-index: 100;
       
    }
    
    .Select__menu-list {
        overflow-y: scroll;
        max-height: 160px;
    }
    
    .Select__option {
        padding: 8px 4px 4px 4px;
        color: #DCDCDC;
    }
    
    .Select__option: hover {
        background-color: #4a4a4a;
        border-radius: 4px;
        border-bottom: none;
        max-height: 100px;
    }
    
    
    .Select__indicator-separator {
        height: 1px;
        background-color: blue;
    }
`

function Select({value, options, onChange, ...styles}: SelectProps) {
    return (
        <StyledSelect
            classNamePrefix="Select"
            unstyled={true}
            value={value}
            options={options}
            {...styles}
            onChange={(selected) => {
                onChange?.(selected as SelectOptionType)
            }}
        />
    );
}

export type {SelectOptionType}
export default Select



