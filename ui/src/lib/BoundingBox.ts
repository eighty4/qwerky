import type {Element, Rect} from 'qwerky-contract'
import {getIndexedColor} from '$lib/colors'

export interface BoundingBox {
    color: string
    rect: Rect
}

export function buildBoundingBoxes(elements?: Array<Element>): Array<BoundingBox> | null {
    console.log(elements)
    if (!elements) {
        return null
    }
    return elements.map((element, i) => {
        return {
            color: getIndexedColor(i),
            rect: {
                x: element.position.x,
                y: element.position.y,
                w: element.size.width,
                h: element.size.height,
            }
        }
    })
}
