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
    const getItemImage = (name: string, extension: 'webp' | 'png' | 'gif' = 'webp') =>
        `image/Items/${name.replace(': ', '')}.${extension}`;

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
                    src={getItemImage(item.name)}
                    alt={item.name.replace(': ', '')}
                    onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        const currentExtension = (target.dataset.extension as 'webp' | 'png' | 'gif' | undefined) ?? 'webp';

                        if (currentExtension === 'webp') {
                            target.dataset.extension = 'png';
                            target.src = getItemImage(item.name, 'png');
                            return;
                        }

                        if (currentExtension === 'png') {
                            target.dataset.extension = 'gif';
                            target.src = getItemImage(item.name, 'gif');
                            return;
                        }

                        target.style.visibility = 'hidden';
                    }}
                    data-extension="webp"
                />
            </Container>
        </td>
        <td>{item.name}</td>
        <td>{item.chance.toFixed(3)}%</td>
    </StyledTableRow>
}

export default GachaTableRow;
