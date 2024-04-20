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
            expect(buildBoundingBoxes(elements)).toStrictEqual([
                {
                    color: '#3cb9fc',
                    rect: {
                        x: 100,
                        y: 200,
                        w: 100,
                        h: 200,
                    },
                    stacked: {
                        x: 0,
                        y: 0,
                        w: 0,
                        h: 0,
                    },
                },
                {
                    color: '#00fa36',
                    rect: {
                        x: 150,
                        y: 250,
                        w: 20,
                        h: 20,
                    },
                    stacked: {
                        x: 0,
                        y: 0,
                        w: 0,
                        h: 0,
                    },
                },
            ])
        })

        it('stacks on x axis', () => {
            const elements: Array<Element> = [
                createElement({x: 100, y: 240}, {width: 20, height: 20}),
                createElement({x: 100, y: 250}, {width: 30, height: 20}),
                createElement({x: 125, y: 260}, {width: 40, height: 20}),
                createElement({x: 125, y: 270}, {width: 50, height: 20}),
            ]
            const boundingBoxes = buildBoundingBoxes(elements)!
            expect(boundingBoxes.map(bb => bb.stacked)).toStrictEqual([
                {x: 0, y: 0, w: 0, h: 0},
                {x: 1, y: 0, w: 0, h: 0},
                {x: 1, y: 0, w: 0, h: 0},
                {x: 2, y: 0, w: 0, h: 0},
            ])
        })

        it('stacks on y axis', () => {
            const elements: Array<Element> = [
                createElement({x: 100, y: 240}, {width: 20, height: 20}),
                createElement({x: 110, y: 240}, {width: 20, height: 30}),
                createElement({x: 120, y: 250}, {width: 20, height: 40}),
                createElement({x: 130, y: 250}, {width: 20, height: 50}),
            ]
            const boundingBoxes = buildBoundingBoxes(elements)!
            expect(boundingBoxes.map(bb => bb.stacked)).toStrictEqual([
                {x: 0, y: 0, w: 0, h: 0},
                {x: 0, y: 1, w: 0, h: 0},
                {x: 0, y: 1, w: 0, h: 0},
                {x: 0, y: 2, w: 0, h: 0},
            ])
        })

        it('stacks on x axis + width', () => {
            const elements: Array<Element> = [
                createElement({x: 100, y: 240}, {width: 30, height: 20}),
                createElement({x: 110, y: 250}, {width: 20, height: 20}),
                createElement({x: 120, y: 260}, {width: 30, height: 20}),
                createElement({x: 130, y: 270}, {width: 20, height: 20}),
            ]
            const boundingBoxes = buildBoundingBoxes(elements)!
            expect(boundingBoxes.map(bb => bb.stacked)).toStrictEqual([
                {x: 0, y: 0, w: 0, h: 0},
                {x: 0, y: 0, w: 1, h: 0},
                {x: 0, y: 0, w: 1, h: 0},
                {x: 0, y: 0, w: 2, h: 0},
            ])
        })

        it('stacks on y axis + height', () => {
            const elements: Array<Element> = [
                createElement({x: 100, y: 240}, {width: 20, height: 20}),
                createElement({x: 110, y: 250}, {width: 20, height: 10}),
                createElement({x: 120, y: 260}, {width: 20, height: 40}),
                createElement({x: 130, y: 270}, {width: 20, height: 30}),
            ]
            const boundingBoxes = buildBoundingBoxes(elements)!
            expect(boundingBoxes.map(bb => bb.stacked)).toStrictEqual([
                {x: 0, y: 0, w: 0, h: 0},
                {x: 0, y: 0, w: 0, h: 1},
                {x: 0, y: 0, w: 0, h: 1},
                {x: 0, y: 0, w: 0, h: 2},
            ])
        })
    })
})
