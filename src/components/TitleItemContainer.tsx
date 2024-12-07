import Container from "./base/Container";
import React from "react";
import Position from "./types/Position";
import Align from "./types/Align";
import Text, {TextProps} from "./base/Text";

type TitleItemContainerProps = {
    children: React.ReactNode
    title: string
    titlePosition?: Position
    align?: Align
} & Omit<TextProps, 'children'>

function TitleItemContainer({children, title, titlePosition, align = 'center', ...styles}: TitleItemContainerProps) {
    return <Container align={align}
                      flexDirection={titlePosition === 'top' || titlePosition === 'bottom' ? 'column' : "row"}
                      gap={'10px'}>
        {titlePosition === 'bottom' || titlePosition === 'right'
            ? <>
                {children}
                <Text textAlign={'left'} {...styles}>{title}</Text>
            </> : <>
                <Text textAlign={'left'} {...styles}>{title}</Text>
                {children}
            </>}
    </Container>
}

export default TitleItemContainer