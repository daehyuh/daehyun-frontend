import React from "react";
import styled from "styled-components";

type ButtonProps = {
    title: string;
}

const StyledButton = styled.div`

`

const Button = ({title}: ButtonProps) => {
    return <StyledButton>{title}</StyledButton>
}

export default Button