import styles from "@/pages/styles/Channel.module.css";
import React from "react";
import ChannelType from "@/constant/ChannelType";
import styled from "styled-components";


type ChannelListProps = {
    channel: ChannelType;
    onClick?: (channel: ChannelType) => void;
}

const StyledChannelLi = styled.li`
    list-style: none;
    display: flex;
    gap: 20px;
    align-items: center;
    background-color: #3e3e3e;
    border-radius: 10px;
    padding: 15px 20px; /* padding 조정 */
    color: #fff;
    font-size: 1.2rem;
    font-weight: bold;
    box-shadow: inset 0 -3px 0 #1e1e1e, 0 2px 6px rgba(0, 0, 0, 0.2);
    position: relative;
    overflow: hidden;
`

type StyledChannelUserCountProps = {
    userCount: number;
}

const StyledChannelUserCount = styled.span<StyledChannelUserCountProps>`
    font-weight: bold;
    color: ${props => props.userCount >= 2000 ? 'red' : props.userCount >= 1000 ? 'yellow' : 'green'};
`

const ChannelList = ({channel}: ChannelListProps) => {
    return <StyledChannelLi>
        <span style={{color: "#ffffff", flex: 1}}>{channel.channel_name}:</span>
        <StyledChannelUserCount
            userCount={channel.user_count}
        >
            {channel.user_count}명
        </StyledChannelUserCount>
    </StyledChannelLi>
}

export default ChannelList;