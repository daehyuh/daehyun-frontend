import React from "react";
import {Property} from "csstype";
import RankUser from "@/constant/RankUser";
import styled from "styled-components";
import ColorBox from "@components/ColorBox";
import {Container, Text} from "@/components";

type ColorRankTableRowProps = {
    rankUser: RankUser
    backgroundColor?: Property.BackgroundColor
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

const ColorRankTableRow = ({
                               rankUser,
                               backgroundColor,
                               borderBottomColor = '#444',
                               hoverBackgroundColor = '#222',
                               color = 'white',
                               height = '50px',
                           }: ColorRankTableRowProps) => {
    const hexCodeValue = rankUser.color.length > 0 && rankUser.color[0] === '#' ? rankUser.color : `#${rankUser.color}`

    return <StyledTableRow borderBottomColor={borderBottomColor} hoverBackgroundColor={hoverBackgroundColor}
                           color={color} height={height}>
        <td style={{backgroundColor: backgroundColor}}>
            {rankUser.rank}위
        </td>
        <td>{rankUser.nickname}</td>
        <td>
            <Container fullWidth flexDirection={'row'} gap={'10px'}>
                <div
                    style={{
                        backgroundColor: hexCodeValue,
                        width: '20px',
                        height: '20px',
                        border: 'white 1px solid',
                        borderRadius: '15%'
                    }}
                />

                <Text color={'white'}>{hexCodeValue}</Text>
            </Container>
        </td>
        <td>{rankUser.closeness}</td>
    </StyledTableRow>
}

export default ColorRankTableRow;