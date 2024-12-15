import React from "react";
import {Property} from "csstype";
import styled from "styled-components";
import {CheckBox, Container} from "@/components";
import {TotalProbability} from "@/pages/Gacha/Gacha";
import align from "@components/types/Align";

type GachaTableStickyRowProps = {
    value: boolean
    totalProbability: TotalProbability
    onChecked?: (isChecked: boolean) => void
} & StyledTableRowProps

type StyledTableRowProps = {
    color?: Property.Color
    height?: Property.Height
    borderBottomColor?: Property.BorderColor
}

const StyledTableRow = styled.tr<StyledTableRowProps>`
    position: sticky;
    top: 0; /* 테이블의 최상단에 고정 */
    z-index: 1;

    border-bottom: 1px solid ${({borderBottomColor}) => borderBottomColor};
    transition: background-color 0.2s;
    color: ${({color}) => color};
    height: ${({height}) => height};
`

const GachaTableStickyRow = ({
                                 value,
                                 totalProbability,
                                 borderBottomColor = '#444',
                                 color = 'white',
                                 height = '50px',
                                 onChecked,
                             }: GachaTableStickyRowProps) => {

    const onCheckedHandler = (isChecked: boolean) => {
        onChecked?.(isChecked)
    }

    return <StyledTableRow borderBottomColor={borderBottomColor}
                           color={color}
                           height={height}>
        <td>
            <Container fullWidth>
                <CheckBox id={"GachaSticky"} value={value} onChecked={onCheckedHandler}/>
            </Container>
        </td>
        <td>
            <strong>전체 체크 박스</strong>
        </td>
        <td colSpan={2}>
            장착템 확률: {totalProbability.equip.toFixed(4)}%
        </td>
    </StyledTableRow>
}

export default GachaTableStickyRow;