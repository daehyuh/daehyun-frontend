import React from "react";
import styled from "styled-components";

type CategoryTitleProps = {
    title: string
}

const StyledCategoryTitle = styled.h1`
    font-size: 30px;
    font-weight: bold;
    color: #EAEAEA;
    margin-bottom: 1rem;
    border-left: 4px solid;
    padding-left: 10px;`

function CategoryTitle({title}: CategoryTitleProps) {
    return (
        <StyledCategoryTitle>{title}</StyledCategoryTitle>
    );

}

export default CategoryTitle;