import React from "react";
import styled from "styled-components";
import ReactSelect from "react-select";
import {Property} from "csstype";

type SelectOptionType<T> = {
    label: string
    value: T,
}

type SelectProps <T>  = {
    value: SelectOptionType<T>
    options: SelectOptionType<T>[],
    onChange?: (value: SelectOptionType<T>) => void;
} & StyledSelectProps

type StyledSelectProps = {
    width?: Property.Width
}

const StyledSelect = styled(ReactSelect)<StyledSelectProps>`
    flex: 1;
    width: ${({width}) => width ?? '60%'};
    font-size: ${({theme}) => theme.typography.sizes.sm};

    .Select__control {
        background-color: ${({theme}) => theme.colors.surfaceMuted};
        border: 1px solid ${({theme}) => theme.colors.border};
        border-radius: ${({theme}) => theme.radii.md};
        padding: 0 ${({theme}) => theme.spacing.sm};
        min-height: 44px;
        display: flex;
        align-items: center;
        transition: border ${({theme}) => theme.transitions.default}, box-shadow ${({theme}) => theme.transitions.default};
        cursor: pointer;
    }

    .Select__control--is-focused {
        border-color: ${({theme}) => theme.colors.accent};
        box-shadow: 0 0 0 1px ${({theme}) => theme.colors.accent};
    }

    .Select__value-container {
        padding: 0;
    }

    .Select__single-value {
        color: ${({theme}) => theme.colors.textPrimary};
    }

    .Select__placeholder {
        color: ${({theme}) => theme.colors.textSecondary};
    }

    .Select__indicator {
        color: ${({theme}) => theme.colors.textSecondary};
    }

    .Select__menu {
        margin-top: ${({theme}) => theme.spacing.xs};
        background-color: ${({theme}) => theme.colors.surface};
        border: 1px solid ${({theme}) => theme.colors.border};
        border-radius: ${({theme}) => theme.radii.md};
        box-shadow: ${({theme}) => theme.shadows.soft};
        position: absolute;
        z-index: 50;
    }

    .Select__menu-list {
        max-height: 200px;
    }

    .Select__option {
        padding: ${({theme}) => theme.spacing.sm};
        color: ${({theme}) => theme.colors.textSecondary};
        border-radius: ${({theme}) => theme.radii.sm};
    }

    .Select__option--is-focused,
    .Select__option--is-selected {
        background-color: ${({theme}) => theme.colors.surfaceHighlight};
        color: ${({theme}) => theme.colors.textPrimary};
    }
`

function Select<T>({value, options, onChange, ...styles}: SelectProps<T>) {
    return (
        <StyledSelect
            classNamePrefix="Select"
            unstyled={true}
            value={value}
            options={options}
            {...styles}
            onChange={(selected) => {
                onChange?.(selected as SelectOptionType<T>)
            }}
        />
    );
}

export type {SelectOptionType}
export default Select
