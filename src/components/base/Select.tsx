import React from "react";
import styled from "styled-components";
import ReactSelect from "react-select";

type SelectOptionType = {
    label: string
    value: string | number,
}

type SelectProps = {
    value: SelectOptionType
    options: SelectOptionType[],
    onChange?: (value: SelectOptionType) => void;
}

const StyledSelect = styled(ReactSelect)`
    flex: 1;
    width: 60%;
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
    }
    
    .Select__option {
        padding: 8px 4px 4px 4px;
        color: #DCDCDC;
    }
    
    .Select__option: hover {
        background-color: #4a4a4a;
        border-radius: 4px;
        border-bottom: none;
    }
    
    .Select__indicator-separator {
        height: 1px;
        background-color: blue;
    }
`

function Select({value, options, onChange}: SelectProps) {
    return (
        <StyledSelect
            classNamePrefix="Select"
            unstyled={true}
            value={value}
            options={options}
            onChange={(selected) => {
                onChange?.(selected as SelectOptionType)
            }}
        />
    );
}

export type {SelectOptionType}
export default Select