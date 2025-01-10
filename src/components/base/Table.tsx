import React from "react";
import styled from "styled-components";
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
    overflow-y: auto; /* 세로 스크롤 */
    overflow-x: hidden; /* 가로 스크롤 숨기기 */
    // white-space: nowrap;
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
        background-color: ${({oddBackgroundColor}) => oddBackgroundColor};
    }

    & tr:nth-child(even) {
        background-color: ${({evenBackgroundColor}) => evenBackgroundColor};
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
    color: ${({headerColor}) => headerColor};
    background-color: ${({headerBackgroundColor}) => headerBackgroundColor};
    border-bottom: ${({headerBorderBottom}) => headerBorderBottom};

    & th {
        padding: ${({headerPadding}) => headerPadding};
    }

`

function Table({
                   children,
                   columnWidths,
                   useRankColor,
                   oddBackgroundColor = '#1e1e1e',
                   evenBackgroundColor = '#2a2a2a',
                   border = '1px solid #444',
                   maxHeight = '700px',
                   headers,
                   headerBackgroundColor = '#333',
                   headerColor = '#fff',
                   headerPadding = '12px 8px',
                   headerBorderBottom = '2px solid #aa0000'
                   ,
                   ...styles
               }: TableProps) {
    return <StyledTableContainer noAlign {...styles} border={border} maxHeight={maxHeight}>
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