import type {Page} from 'playwright'
import {Element, InspectPointData, InspectSelectorData, PageOpenedData, Point, Size} from 'qwerky-contract'

export class QwerkyPage {
    private readonly id: any
    private readonly page: Page

    constructor(id, page) {
        this.id = id
        this.page = page
    }

    async open(url: string): Promise<PageOpenedData> {
        await this.page.goto(url)
        const imageBuffer = await this.page.screenshot({fullPage: true, type: 'png'})
        const size = await this.page.viewportSize()
        const encodedImage = imageBuffer.toString('base64')
        return new PageOpenedData(this.id, encodedImage, size)
    }

    async inspectPoint(point): Promise<InspectPointData> {
        const inspectPointInPage: (point: Point) => Element = point => {
            // @ts-ignore
            window.scrollTo(point.x - 1, point.y - 1)
            // @ts-ignore
            const element = document.elementFromPoint(1, 1)
            if (element) {
                const classes: Array<string> = []
                element.classList.forEach(c => classes.push(c))
                const size = new Size(element.clientHeight, element.clientWidth)
                const boundingClientRect = element.getBoundingClientRect()
                // @ts-ignore
                const position = new Point(boundingClientRect.left + window.scrollX, boundingClientRect.top + window.scrollY)
                return new Element(element.id, classes, element.textContent, size, position)
            } else {
                throw new Error(`did not find element at ${point.x}, ${point.y}`)
            }
        }
        const element = await this.page.evaluate(inspectPointInPage, point)
        return {sessionId: this.id, element, point, messageType: 'describe'}
    }

    async inspectSelector(selector): Promise<InspectSelectorData | void> {
        const inspected = await this.page.$(selector)
        if (inspected) {
            const element = {
                id: '',
                classes: [],
                text: await inspected.textContent(),
                position: {x: 5, y: 5},
                size: {height: 5, width: 5},
            }
            return new InspectSelectorData(this.id, selector, element)
        }
    }

    async close() {
        await this.page.close()
    }
}
