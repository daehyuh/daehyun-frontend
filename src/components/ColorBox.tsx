import {Container, Text} from "@components/index";
import styled from "styled-components";
import {ContainerProps} from "@components/base/Container";
import {Property} from "csstype";
import {TextProps} from "@components/base/Text";

type ColorBoxProps =
    {
        hexCode: string
        useColorName?: boolean
        textColor?: Property.Color
    }
    & Omit<ContainerProps, 'children'>
    & Omit<TextProps, 'width' | 'children' | 'color'>
    & Omit<StyledColorBoxProps, 'backgroundColor'>

type StyledColorBoxProps = {
    size?: Property.Width
    backgroundColor?: Property.BackgroundColor
    colorBoxBorderRadius?: Property.BorderRadius
    colorBoxBorder?: Property.Border
}

const StyledColorBox = styled.div<StyledColorBoxProps>`
    border-radius: ${({colorBoxBorderRadius}) => colorBoxBorderRadius};
    border: ${({colorBoxBorder}) => colorBoxBorder};
    width: ${({size}) => size};
    height: ${({size}) => size};
    background-color: ${({backgroundColor}) => backgroundColor};
`

const ColorBox = ({
                      hexCode,
                      useColorName,
                      size = '20px',
                      gap = '10px',
                      colorBoxBorderRadius = '15%',
                      colorBoxBorder = 'white 1px solid',
                      flexDirection = 'row',
                      textColor,
                      font,
                      fontSize,
                      fontWeight,
                      textAlign,
                      ...props
                  }: ColorBoxProps) => {
    const hexCodeValue = hexCode.length > 0 && hexCode[0] === '#' ? hexCode : `#${hexCode}`

    return <Container flexDirection={'row'} gap={gap} {...props}>
        <StyledColorBox size={size}
                        backgroundColor={hexCodeValue}
                        colorBoxBorder={colorBoxBorder}
                        colorBoxBorderRadius={colorBoxBorderRadius}/>
        {useColorName &&
            <Text color={textColor} font={font} fontWeight={fontWeight} textAlign={textAlign}>{hexCode}</Text>}
    </Container>
}

export default ColorBox