import {describe, expect, it} from 'vitest'
import {Element, Point, Size} from '@eighty4/qwerky-contract'
import {buildBoundingBoxes} from '$lib/data/BoundingBox'

function createElement(position: Point, size: Size): Element {
    return {
        tagName: 'div',
        id: '',
        classes: [],
        text: null,
        size,
        position,
    }
}

describe('BoundingBox', () => {
    describe('buildBoundingBoxes', () => {
        it('maps element positions to bounding boxes', () => {
            const elements: Array<Element> = [
                createElement({x: 100, y: 200}, {width: 100, height: 200}),
                createElement({x: 150, y: 250}, {width: 20, height: 20}),
            ]
            const boundingBoxes = buildBoundingBoxes(elements)!
            expect(boundingBoxes[0].rect).toStrictEqual({
                x: elements[0].position.x,
                y: elements[0].position.y,
                w: elements[0].size.width,
                h: elements[0].size.height,
            })
            expect(boundingBoxes[0].stacked).toStrictEqual({x: 1, y: 1, w: 0, h: 0})
            expect(boundingBoxes[1].rect).toStrictEqual({
                x: elements[1].position.x,
                y: elements[1].position.y,
                w: elements[1].size.width,
                h: elements[1].size.height,
            })
            expect(boundingBoxes[1].stacked).toStrictEqual({x: 1, y: 1, w: 0, h: 0})
        })

        it.skip('stacks on x axis', () => {
            const elements: Array<Element> = [
                createElement({x: 100, y: 240}, {width: 20, height: 20}),
                createElement({x: 100, y: 250}, {width: 30, height: 20}),
                createElement({x: 125, y: 260}, {width: 40, height: 20}),
                createElement({x: 125, y: 270}, {width: 50, height: 20}),
            ]
            const boundingBoxes = buildBoundingBoxes(elements)!
            expect(boundingBoxes.map(bb => bb.stacked)).toStrictEqual([
                {x: 1, y: 1, w: 0, h: 0},
                {x: 2, y: 1, w: 0, h: 0},
                {x: 2, y: 1, w: 0, h: 0},
                {x: 3, y: 1, w: 0, h: 0},
            ])
        })

        it.skip('stacks on y axis', () => {
            const elements: Array<Element> = [
                createElement({x: 100, y: 240}, {width: 20, height: 20}),
                createElement({x: 110, y: 240}, {width: 20, height: 30}),
                createElement({x: 120, y: 250}, {width: 20, height: 40}),
                createElement({x: 130, y: 250}, {width: 20, height: 50}),
            ]
            const boundingBoxes = buildBoundingBoxes(elements)!
            expect(boundingBoxes.map(bb => bb.stacked)).toStrictEqual([
                {x: 1, y: 1, w: 0, h: 0},
                {x: 1, y: 2, w: 0, h: 0},
                {x: 1, y: 2, w: 0, h: 0},
                {x: 1, y: 3, w: 0, h: 0},
            ])
        })

        it.skip('stacks on x axis + width', () => {
            const elements: Array<Element> = [
                createElement({x: 100, y: 240}, {width: 30, height: 20}),
                createElement({x: 110, y: 250}, {width: 20, height: 20}),
                createElement({x: 120, y: 260}, {width: 30, height: 20}),
                createElement({x: 130, y: 270}, {width: 20, height: 20}),
            ]
            const boundingBoxes = buildBoundingBoxes(elements)!
            expect(boundingBoxes.map(bb => bb.stacked)).toStrictEqual([
                {x: 1, y: 1, w: 0, h: 0},
                {x: 1, y: 1, w: 1, h: 0},
                {x: 1, y: 1, w: 1, h: 0},
                {x: 1, y: 1, w: 2, h: 0},
            ])
        })

        it.skip('stacks on y axis + height', () => {
            const elements: Array<Element> = [
                createElement({x: 100, y: 240}, {width: 20, height: 20}),
                createElement({x: 110, y: 250}, {width: 20, height: 10}),
                createElement({x: 120, y: 260}, {width: 20, height: 40}),
                createElement({x: 130, y: 270}, {width: 20, height: 30}),
            ]
            const boundingBoxes = buildBoundingBoxes(elements)!
            expect(boundingBoxes.map(bb => bb.stacked)).toStrictEqual([
                {x: 1, y: 1, w: 0, h: 0},
                {x: 1, y: 1, w: 0, h: 1},
                {x: 1, y: 1, w: 0, h: 1},
                {x: 1, y: 1, w: 0, h: 2},
            ])
        })
    })
})
