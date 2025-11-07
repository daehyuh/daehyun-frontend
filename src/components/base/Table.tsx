import React from "react";
import styled, {useTheme} from "styled-components";
import {Container} from "@/components";
import {Property} from "csstype";
import {ContainerProps} from "@components/base/Container";

type TableProps = {
    children?: React.ReactNode
} & Omit<ContainerProps, 'align' | 'noAlign'> & StyledTableProps & TableHeaderProps

type StyledTableProps = {
    maxHeight?: Property.MaxHeight
    columnWidths?: Property.Width[]
    oddBackgroundColor?: Property.BackgroundColor
    evenBackgroundColor?: Property.BackgroundColor
    useRankColor?: boolean;
}

const StyledTableContainer = styled(Container)`
    overflow-y: auto;
    overflow-x: hidden;
    border-radius: ${({theme}) => theme.radii.lg};
    background: ${({theme}) => theme.colors.surface};
`

const StyledTable = styled.table<StyledTableProps>`
    box-sizing: border-box;
    border-collapse: collapse;
    text-align: center;
    height: fit-content;
    width: 100%;

    ${({columnWidths}) =>
            columnWidths?.map((width, index) => `& th:nth-child(${index + 1}), & td:nth-child(${index + 1}) {width: ${width};}`)
    }
    & tr:nth-child(odd) {
        background-color: ${({oddBackgroundColor, theme}) => oddBackgroundColor ?? theme.colors.surfaceMuted};
    }

    & tr:nth-child(even) {
        background-color: ${({evenBackgroundColor, theme}) => evenBackgroundColor ?? theme.colors.surface};
    }

    ${({useRankColor}) => useRankColor && `
    & tbody tr:nth-child(1) td:nth-child(1) {
        background-color: #f7c83b;
    }

    & tbody tr:nth-child(2) td:nth-child(1) {
        background-color: #cbc9c9;
    }

    & tbody tr:nth-child(3) td:nth-child(1) {
        background-color: #e8763b;
    }`}
`

type TableHeaderProps = {
    headers: string[]
} & StyledTableHeaderProps

type StyledTableHeaderProps = {
    headerColor?: Property.Color
    headerBackgroundColor?: Property.BackgroundColor
    headerPadding?: Property.Padding
    headerBorderBottom?: Property.BorderBottom
}

const StyledTableHead = styled.thead<StyledTableHeaderProps>`
    color: ${({headerColor, theme}) => headerColor ?? theme.colors.textPrimary};
    background-color: ${({headerBackgroundColor, theme}) => headerBackgroundColor ?? theme.colors.surfaceElevated};
    border-bottom: ${({headerBorderBottom, theme}) => headerBorderBottom ?? `2px solid ${theme.colors.accent}`};

    & th {
        padding: ${({headerPadding}) => headerPadding ?? '12px 8px'};
        ${({theme}) => `
            font-weight: ${theme.typography.weights.medium};
            font-size: ${theme.typography.sizes.sm};
        `}
    }
`

function Table({
                   children,
                   columnWidths,
                   useRankColor,
                   oddBackgroundColor,
                   evenBackgroundColor,
                   maxHeight = '700px',
                   headers,
                   headerBackgroundColor,
                   headerColor,
                   headerPadding,
                   headerBorderBottom,
                   ...styles
               }: TableProps) {
    const theme = useTheme();
    const resolvedBorder = styles.border ?? `1px solid ${theme.colors.border}`;

    return <StyledTableContainer
        noAlign
        {...styles}
        border={resolvedBorder}
        maxHeight={maxHeight}
    >
        <StyledTable columnWidths={columnWidths}
                     oddBackgroundColor={oddBackgroundColor}
                     evenBackgroundColor={evenBackgroundColor}
                     useRankColor={useRankColor}>
            <StyledTableHead headerBackgroundColor={headerBackgroundColor}
                             headerColor={headerColor}
                             headerPadding={headerPadding}
                             headerBorderBottom={headerBorderBottom}>
                <tr>
                    {headers.map((value, index) => (
                        <th key={index}>{value}</th>
                    ))}
                </tr>
            </StyledTableHead>
            {children}
        </StyledTable>
    </StyledTableContainer>
}

export default Table
