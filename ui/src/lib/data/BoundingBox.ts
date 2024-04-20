import type {Element, Rect} from '@eighty4/qwerky-contract'

export interface BoundingBox {
    rect: Rect
    stacked: Rect
}

export function buildBoundingBoxes(elements: Array<Element> | undefined): Array<BoundingBox> | null {
    if (!elements) {
        return null
    }
    const stacking = {x: 1, y: 1, w: 0, h: 0}
    const boundingBoxes: Array<BoundingBox> = new Array<BoundingBox>(elements.length)
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i]
        // const previous = i === 0 ? null : elements[i - 1]
        boundingBoxes[i] = {
            rect: {
                x: element.position.x,
                y: element.position.y,
                w: element.size.width,
                h: element.size.height,
            },
            stacked: stacking,
            // stacked: {
            //     x: !!previous && element.position.x === previous.position.x ? ++stacking.x : stacking.x,
            //     y: !!previous && element.position.y === previous.position.y ? ++stacking.y : stacking.y,
            //     w: !!previous && (element.position.x + element.size.width) === (previous.position.x + previous.size.width) ? ++stacking.w : stacking.w,
            //     h: !!previous && (element.position.y + element.size.height) === (previous.position.y + previous.size.height) ? ++stacking.h : stacking.h,
            // },
        }
    }
    return boundingBoxes
}
