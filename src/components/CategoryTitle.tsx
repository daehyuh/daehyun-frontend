import React from "react";
import styled from "styled-components";

type CategoryTitleProps = {
    title: string
    description?: string
}

const TitleWrapper = styled.div`
    width: 100%;
    margin-bottom: ${({theme}) => theme.spacing.lg};
`;

const StyledCategoryTitle = styled.h2`
    position: relative;
    font-size: clamp(1.35rem, 2vw, 1.85rem);
    font-weight: ${({theme}) => theme.typography.weights.bold};
    color: ${({theme}) => theme.colors.textPrimary};
    margin: 0 0 ${({theme}) => theme.spacing.xs};
    padding-left: ${({theme}) => theme.spacing.lg};
    text-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);

    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 6px;
        height: 70%;
        border-radius: ${({theme}) => theme.radii.pill};
        background: linear-gradient(180deg, ${({theme}) => theme.colors.accent}, ${({theme}) => theme.colors.accentAlt});
        box-shadow: 0 0 25px rgba(255, 95, 109, 0.45);
    }
`;

const TitleDescription = styled.p`
    margin: 0;
    color: ${({theme}) => theme.colors.textSecondary};
    font-size: ${({theme}) => theme.typography.sizes.sm};
`;

function CategoryTitle({title, description}: CategoryTitleProps) {
    return (
        <TitleWrapper>
            <StyledCategoryTitle>{title}</StyledCategoryTitle>
            {description && <TitleDescription>{description}</TitleDescription>}
        </TitleWrapper>
    );
}

export default CategoryTitle;
