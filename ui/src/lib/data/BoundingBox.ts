import type {Element, Rect} from '@eighty4/qwerky-contract'
import {getIndexedColor} from '$lib/data/colors'

export interface BoundingBox {
    color: string
    index: number
    rect: Rect
}

export function buildBoundingBoxes(elements: Array<Element>): Array<BoundingBox> {
    return elements.map<BoundingBox>((element, i) => {
        return {
            color: getIndexedColor(i),
            index: i,
            rect: {
                x: element.position.x,
                y: element.position.y,
                w: element.size.width,
                h: element.size.height,
            },
        }
    })
}
