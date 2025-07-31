import React from "react";
import {Property} from "csstype";
import styled from "styled-components";
import {Container, Text} from "@/components";
import RankUser from "@/constant/RankUser";
import RankGuild from "@/constant/RankGuild";

type CommonTableRowProps = {
    type: "user" | "guild";
    data: RankUser | RankGuild;
    backgroundColor?: Property.BackgroundColor;
    borderBottomColor?: Property.BorderColor;
    hoverBackgroundColor?: Property.BackgroundColor;
    color?: Property.Color;
    height?: Property.Height;
};

const StyledTableRow = styled.tr<{
    color?: Property.Color;
    height?: Property.Height;
    hoverBackgroundColor?: Property.BackgroundColor;
    borderBottomColor?: Property.BorderColor;
}>`
    border-bottom: 1px solid ${({borderBottomColor}) => borderBottomColor};
    transition: background-color 0.2s;
    color: ${({color}) => color};
    height: ${({height}) => height};
    &:hover {
        background-color: ${({hoverBackgroundColor}) => hoverBackgroundColor};
    }
`;

function renderUserRow(rankUser: RankUser) {
    const hexCodeValue = rankUser.color.length > 0 && rankUser.color[0] === '#' ? rankUser.color : `#${rankUser.color}`;
    return <>
        <td>{rankUser.rank}위</td>
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
        <td>{rankUser.closeness > 90 ? "✅"+rankUser.closeness:rankUser.closeness}</td>
    </>;
}

function renderGuildRow(rankGuild: RankGuild) {
    const initialHexCodeValue = rankGuild.initial_color.length > 0 && rankGuild.initial_color[0] === '#' ? rankGuild.initial_color : `#${rankGuild.initial_color}`;
    const backgroundHexColorValue = rankGuild.initial_background_color.length > 0 && rankGuild.initial_background_color[0] === '#' ? rankGuild.initial_background_color : `#${rankGuild.initial_background_color}`;
    return <>
        <td>{rankGuild.rank}위</td>
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

const CommonTableRow = ({
    type,
    data,
    backgroundColor,
    borderBottomColor = '#444',
    hoverBackgroundColor = '#222',
    color = 'white',
    height = '50px',
}: CommonTableRowProps) => {
    return (
        <StyledTableRow borderBottomColor={borderBottomColor} hoverBackgroundColor={hoverBackgroundColor}
                        color={color} height={height} style={{backgroundColor: backgroundColor}}>
            {type === "user"
                ? renderUserRow(data as RankUser)
                : renderGuildRow(data as RankGuild)}
        </StyledTableRow>
    );
};

export default CommonTableRow;