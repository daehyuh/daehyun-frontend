import {Link} from "react-router-dom";
import React from "react";
import styled from "styled-components";

type HeaderItemLinkProps = {
    path: string;
    hrefs: string[];
    title?: string;
}

type StyledLinkProps = {
    isActive: boolean;
}

const StyledLink = styled(Link)<StyledLinkProps>`
    color: white;
    text-align: center;
    margin: 0;
    border-bottom: ${({isActive}) => isActive && 'solid 3px white'};
    padding-bottom: ${({isActive}) => isActive && '8px'};
`

function HeaderItemLink({path, hrefs, title}: HeaderItemLinkProps) {
    return (<StyledLink to={hrefs.at(0) ?? ""} isActive={hrefs.some(e => e === path)}>
        {title}
    </StyledLink>)
}

export default HeaderItemLink