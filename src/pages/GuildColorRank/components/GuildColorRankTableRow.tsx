import React from "react";
import {Property} from "csstype";
import styled from "styled-components";
import {Container, Text} from "@/components";

type GuildColorRankTableRowProps = {
    rankGuild: RankGuild
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

function renderGuildColorRankRow(rankGuild: RankGuild) {
    const initialHexCodeValue = rankGuild.initial_color.length > 0 && rankGuild.initial_color[0] === '#' ? rankGuild.initial_color : `#${rankGuild.initial_color}`
    const backgroundHexColorValue = rankGuild.initial_background_color.length > 0 && rankGuild.initial_background_color[0] === '#' ? rankGuild.initial_background_color : `#${rankGuild.initial_background_color}`

    return <>
        <td>
            {rankGuild.rank}위
        </td>
        <td>{rankGuild.guild_name}<br/>({rankGuild.guild_point}GP)</td>
        <td>
            <Container fullWidth gap={'10px'}>
                <div
                    style={{
                        backgroundColor: backgroundHexColorValue,
                        width: '50px',
                        height: '20px',
                        borderRadius: '4px',
                        padding: '4px 0',
                    }}
                >
                    <span style={{color: initialHexCodeValue}}>
                        {rankGuild.guild_initial}
                    </span>
                </div>
                <Text color={'white'}>{backgroundHexColorValue}</Text>
            </Container>
        </td>
        <td>{rankGuild.initial_background_closeness > 90 ? "✅"+rankGuild.initial_background_closeness:rankGuild.initial_background_closeness}</td>
    </>;
}

const GuildColorRankTableRow = ({
                                    rankGuild,
                                    backgroundColor,
                                    borderBottomColor = '#444',
                                    hoverBackgroundColor = '#222',
                                    color = 'white',
                                    height = '75px',
                                }: GuildColorRankTableRowProps) => {

    return <StyledTableRow borderBottomColor={borderBottomColor} hoverBackgroundColor={hoverBackgroundColor}
                           color={color} height={height}>
        <td style={{backgroundColor: backgroundColor}}>
            {renderGuildColorRankRow(rankGuild)}
        </td>
    </StyledTableRow>
}

export default GuildColorRankTableRow;