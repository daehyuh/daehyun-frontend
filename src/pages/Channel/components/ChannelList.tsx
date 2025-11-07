import React from "react";
import ChannelType from "@/constant/ChannelType";
import styled from "styled-components";
import {Property} from "csstype";


type ChannelListProps = {
    channel: ChannelType;
    onClick?: (channel: ChannelType) => void;
} & Omit<StyledChannelUserCountProps, 'userCount'>

const StyledChannelLi = styled.li`
    list-style: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 72px;
    padding: 16px 24px;
    border-radius: 16px;
    background: ${({theme}) => theme.colors.surfaceMuted};
    border: 1px solid ${({theme}) => theme.colors.border};
    box-shadow: ${({theme}) => theme.shadows.soft};
    gap: 24px;
`

const StyledChannelName = styled.span`
    flex: 1;
    display: inline-flex;
    align-items: center;
    font-size: 1.1rem;
    font-weight: 600;
    color: ${({theme}) => theme.colors.textPrimary};
`;

type StyledChannelUserCountProps = {
    userCount: number;
    fixedColor?: Property.Color
}

const StyledChannelUserCount = styled.span<StyledChannelUserCountProps>`
    font-weight: bold;
    color: ${({fixedColor, userCount}) =>  fixedColor ? fixedColor : userCount >= 2000 ? '#D82F45' : userCount >= 1000 ? '#FABF47' : '#36B688'};
`

const ChannelList = ({channel, fixedColor}: ChannelListProps) => {
    return <StyledChannelLi>
        <StyledChannelName>{channel.channel_name}</StyledChannelName>
        <StyledChannelUserCount
            fixedColor={fixedColor}
            userCount={channel.user_count}
        >
            {channel.user_count.toLocaleString()} 명
        </StyledChannelUserCount>
    </StyledChannelLi>
}

export default ChannelList;
