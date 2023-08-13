import type {Page} from 'playwright'
import {Element, InspectPointData, InspectSelectorData, PageOpenedData, Point, Rect} from 'qwerky-contract'

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

export class QwerkyPage {

    constructor(private readonly id: any, private readonly page: Page) {
    }

    async open(url: string): Promise<PageOpenedData> {
        await this.page.goto(url)
        const imageBuffer = await this.page.screenshot({fullPage: true, type: 'png'})
        const size = this.page.viewportSize()
        const encodedImage = imageBuffer.toString('base64')
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
        const inspectPointInPage: (point: Point) => Element = point => {
            // @ts-ignore
            window.scrollTo(point.x - 1, point.y - 1)
            // @ts-ignore
            const element = document.elementFromPoint(1, 1)
            if (element) {
                const boundingClientRect = element.getBoundingClientRect()
                // @ts-ignore
                const {scrollX, scrollY} = window
                return {
                    id: element.id,
                    classes: [...element.classList],
                    text: element.textContent,
                    size: {height: element.clientHeight, width: element.clientWidth},
                    position: {
                        x: boundingClientRect.left + scrollX,
                        y: boundingClientRect.top + scrollY,
                    },
                }
            } else {
                throw new Error(`did not find element at ${point.x}, ${point.y}`)
            }
        }
        const element = await this.page.evaluate(inspectPointInPage, point)
        return {sessionId: this.id, element, point, messageType: 'describe'}
    }

    async inspectSelector(selector: string): Promise<InspectSelectorData | void> {
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
