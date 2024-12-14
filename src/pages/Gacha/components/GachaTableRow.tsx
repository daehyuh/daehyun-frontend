import React from "react";
import {Property} from "csstype";
import RankUser from "@/constant/RankUser";
import styled from "styled-components";
import {CheckBox, Container, Input, Text} from "@/components";
import {GachaProbabilityItem} from "@/pages/Gacha/Gacha";

type GachaTableRowProps = {
    index: number
    value: boolean
    item: GachaProbabilityItem
    onChecked?: (index: number, isChecked: boolean) => void
} & StyledTableRowProps

type StyledTableRowProps = {
    color?: Property.Color
    height?: Property.Height
    hoverBackgroundColor?: Property.BackgroundColor
    borderBottomColor?: Property.BorderColor
}

const StyledTableRow = styled.tr<StyledTableRowProps>`
    border-bottom: 1px solid ${({borderBottomColor}) => borderBottomColor};
    transition: background-color 0.2s;
    color: ${({color}) => color};
    height: ${({height}) => height};

    &:hover {
        background-color: ${({hoverBackgroundColor}) => hoverBackgroundColor};
    }
`

const GachaTableRow = ({
                           index,
                           item,
                           value,
                           borderBottomColor = '#444',
                           hoverBackgroundColor = '#222',
                           color = 'white',
                           height = '50px',
                           onChecked,
                       }: GachaTableRowProps) => {

    const onCheckedHandler = (isChecked: boolean) => {
        onChecked?.(index, isChecked)
    }

    return <StyledTableRow borderBottomColor={borderBottomColor}
                           hoverBackgroundColor={hoverBackgroundColor}
                           color={color}
                           height={height}>
        <td>
            {item.equip && (
                <Container fullWidth>
                    <CheckBox id={`GachaRow${index}`} value={value} onChecked={onCheckedHandler}/>
                </Container>
            )}
        </td>
        <td>
            <img
                width={50}
                src={`image/Items/${item.name}.webp`}
                alt={item.name}
            />
        </td>
        <td>{item.name}</td>
        <td>{item.chance.toFixed(3)}%</td>
    </StyledTableRow>
}

export default GachaTableRow;