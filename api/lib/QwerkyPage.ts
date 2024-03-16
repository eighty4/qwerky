import {EventEmitter} from 'node:events'
import type {Page} from 'playwright'
import {
    type Element,
    type InspectPointData,
    InspectSelectorData,
    PageOpenedData,
    type Point,
    type Rect,
    type Size,
} from 'qwerky-contract'

export type QwerkyPageProvider = (id: any) => Promise<QwerkyPage>

const ariaRoles = [
    'alert', 'alertdialog', 'application', 'article', 'banner', 'blockquote', 'button', 'caption', 'cell', 'checkbox',
    'code', 'columnheader', 'combobox', 'complementary', 'contentinfo', 'definition', 'deletion', 'dialog', 'directory',
    'document', 'emphasis', 'feed', 'figure', 'form', 'generic', 'grid', 'gridcell', 'group', 'heading', 'img',
    'insertion', 'link', 'list', 'listbox', 'listitem', 'log', 'main', 'marquee', 'math', 'meter', 'menu', 'menubar',
    'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation', 'none', 'note', 'option', 'paragraph',
    'presentation', 'progressbar', 'radio', 'radiogroup', 'region', 'row', 'rowgroup', 'rowheader', 'scrollbar',
    'search', 'searchbox', 'separator', 'slider', 'spinbutton', 'status', 'strong', 'subscript', 'superscript',
    'switch', 'tab', 'table', 'tablist', 'tabpanel', 'term', 'textbox', 'time', 'timer', 'toolbar', 'tooltip', 'tree',
    'treegrid', 'treeitem',
]

export declare interface QwerkyPage {
    on(event: 'close', listener: () => void): this
}

export class QwerkyPage extends EventEmitter {

    constructor(private readonly id: any, private readonly page: Page) {
        super()
        this.page.on('close', () => this.emit('close'))
    }

    async open(url: string): Promise<PageOpenedData> {
        await this.page.goto(url)
        const imageBuffer = await this.page.screenshot({fullPage: true, type: 'png'})
        const encodedImage = imageBuffer.toString('base64')
        const size = await this.page.evaluate((): Size => {
            return {
                // @ts-ignore
                width: document.body.scrollWidth,
                // @ts-ignore
                height: document.body.scrollHeight,
            }
        })
        return new PageOpenedData(this.id, encodedImage, size)
    }

    async scrapeBoundingBoxes(): Promise<Array<Rect>> {
        const start = Date.now()
        const locators = (await Promise.all(ariaRoles.map(ariaRole => this.page.getByRole(ariaRole as any).all()))).flat()
        const boundingBoxes = (await Promise.all(locators.map(locator => locator.boundingBox())))
        console.log(Date.now() - start)
        return boundingBoxes
            .filter(bb => bb !== null)
            .map(bb => ({h: bb!.height, w: bb!.width, x: bb!.x, y: bb!.y}))
    }

    async inspectPoint(point: Point): Promise<InspectPointData> {
        const inspectPointInPage: (point: Point) => Array<Element> = point => {
            // @ts-ignore
            window.scrollTo(0, point.y - 1)
            const elements: Array<Element> = []
            // @ts-ignore
            for (const element of document.elementsFromPoint(point.x, 1)) {
                if (element.tagName === 'BODY') {
                    break
                }
                const boundingClientRect = element.getBoundingClientRect()
                // @ts-ignore
                const {scrollX, scrollY} = window
                elements.push({
                    tagName: element.tagName,
                    id: element.id,
                    classes: [...element.classList],
                    text: element.textContent,
                    size: {height: element.clientHeight, width: element.clientWidth},
                    position: {
                        x: boundingClientRect.left + scrollX,
                        y: boundingClientRect.top + scrollY,
                    },
                })
            }
            return elements
        }
        const elements = await this.page.evaluate(inspectPointInPage, point)
        if (process.env.NODE_ENV !== 'production') {
            await this.addDebugMarker(point)
        }
        return {sessionId: this.id, elements, point, messageType: 'describe'}
    }

    async addDebugMarker(point: Point) {
        await this.page.evaluate((point) => {
            // @ts-ignore
            const div = document.createElement('div')
            div.style.width = '5px'
            div.style.height = '5px'
            div.style.background = 'hotpink'
            div.style.position = 'absolute'
            div.style.top = (point.y - 2) + 'px'
            div.style.left = (point.x - 2) + 'px'
            // @ts-ignore
            document.body.appendChild(div)
        }, point)
    }

    async inspectSelector(selector: string): Promise<InspectSelectorData> {
        // todo implement
        const inspected = await this.page.$(selector)
        if (inspected) {
            const element = {
                tagName: '',
                id: '',
                classes: [],
                text: await inspected.textContent(),
                position: {x: 5, y: 5},
                size: {height: 5, width: 5},
            }
            return new InspectSelectorData(this.id, selector, [element])
        }
        return new InspectSelectorData(this.id, selector, [])
    }

    async close() {
        console.debug('QwerkyPage.close')
        if (this.page && !this.page.isClosed()) {
            await this.page.close()
        }
    }
}
