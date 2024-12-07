import {Property} from "csstype";

type Align =
    'topLeft'
    | 'topCenter'
    | 'topRight'
    | 'centerLeft'
    | 'center'
    | 'centerRight'
    | 'bottomLeft'
    | 'bottomCenter'
    | 'bottomRight';

type VerticalAlign = 'top' | 'center' | 'bottom';
type HorizontalAlign = 'left' | 'center' | 'right';

const separateAlign = (align: Align): [VerticalAlign, HorizontalAlign] => {
    switch (align) {
        case 'topLeft':
            return ['top', 'left'];
        case 'topCenter':
            return ['top', 'center'];
        case 'topRight':
            return ['top', 'right'];
        case 'centerLeft':
            return ['center', 'left'];
        case 'center':
            return ['center', 'center'];
        case 'centerRight':
            return ['center', 'right'];
        case 'bottomLeft':
            return ['bottom', 'left'];
        case 'bottomCenter':
            return ['bottom', 'center'];
        case 'bottomRight':
            return ['bottom', 'right'];
    }
}

const alignToStyle = (flexDirection: Property.FlexDirection, align: Align) => {
    const [vertical, horizontal] = separateAlign(align);
    if (flexDirection == 'row' || flexDirection == 'row-reverse') {
        return `
                align-items: ${vertical == 'top' ? 'flex-start' : vertical == 'center' ? 'center' : 'flex-end'};
                justify-content: ${horizontal == 'left' ? 'flex-start' : horizontal == 'center' ? 'center' : 'flex-end'};
            `

    } else {
        return `
                align-items: ${horizontal == 'left' ? 'flex-start' : horizontal == 'center' ? 'center' : 'flex-end'};
                justify-content: ${vertical == 'top' ? 'flex-start' : vertical == 'center' ? 'center' : 'flex-end'};
            `
    }
}

export default Align
export {alignToStyle}