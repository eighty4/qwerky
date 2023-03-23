import type {Page} from 'playwright'
import type {Element, InspectPointData, InspectSelectorData, PageOpenedData, Point} from './QwerkyMessages'

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
        return {id: this.id, image: encodedImage, size, type: 'image'}
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
                const text = element.textContent
                const size = {}
                const position = {}
                return {id: element.id, classes, text, size, position}
            } else {
                throw new Error(`did not find element at ${point.x}, ${point.y}`)
            }
        }
        const element = await this.page.evaluate(inspectPointInPage, point)
        return {id: this.id, element, point, type: 'describe'}
    }

    async inspectSelector(selector): Promise<InspectSelectorData | void> {
        const inspected = await this.page.$(selector)
        if (inspected) {
            const element = {
                id: '',
                classes: [],
                text: await inspected.textContent(),
                position: {x: 5, y: 5},
                size: {x: 5, y: 5},
            }
            return {id: this.id, element, selector, type: 'describe'}
        }
    }

    async close() {
        await this.page.close()
    }
}
