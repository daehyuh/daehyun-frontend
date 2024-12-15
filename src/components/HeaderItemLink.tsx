import {Link} from "react-router-dom";
import React from "react";
import styled from "styled-components";

type HeaderItemLinkProps = {
    path?: string;
    href: string;
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

function HeaderItemLink({path, href, title}: HeaderItemLinkProps) {
    if (path === '/') {
        path = href;
        href = '/상자깡';
    }
    return (<StyledLink to={href} isActive={path === href}>
        {title}
    </StyledLink>)
}

export default HeaderItemLink