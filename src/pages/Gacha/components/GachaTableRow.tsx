import React from "react";
import {Property} from "csstype";
import styled from "styled-components";
import {CheckBox, Container} from "@/components";
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
    border-bottom: 1px solid ${({borderBottomColor, theme}) => borderBottomColor ?? theme.colors.border};
    transition: background-color ${({theme}) => theme.transitions.default};
    color: ${({color, theme}) => color ?? theme.colors.textPrimary};
    height: ${({height}) => height ?? '50px'};

    &:hover {
        background-color: ${({hoverBackgroundColor, theme}) => hoverBackgroundColor ?? theme.colors.surfaceHighlight};
    }
`

const GachaTableRow = ({
                           index,
                           item,
                           value,
                           borderBottomColor,
                           hoverBackgroundColor,
                           color,
                           height,
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
            <Container fullWidth align={'center'}>
                <img
                    width={50}
                    style={{display: 'block'}}
                    src={`image/Items/${item.name.replace(': ', '')}.webp`}
                    alt={item.name.replace(': ', '')}
                />
            </Container>
        </td>
        <td>{item.name}</td>
        <td>{item.chance.toFixed(3)}%</td>
    </StyledTableRow>
}

export default GachaTableRow;
