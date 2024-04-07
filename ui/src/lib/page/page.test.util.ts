import type {Locator, Page} from '@playwright/test'

export async function openUrl(page: Page, url: string): Promise<void> {
    await page.goto('http://localhost:5395/')
    await page.locator('#url-input').click()
    await page.locator('#url-input').pressSequentially(url)
    await page.locator('#url-input').blur()
    await page.getByRole('button', {name: 'Click to start'}).click()
    await page.locator('#page').isVisible()
}

export async function clickInPage(page: Page, point: {x: number, y: number}): Promise<void> {
    await page.locator('#page').evaluate((pageElement, point: { x: number, y: number }) => {
        pageElement.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            clientX: point.x,
            clientY: point.y + pageElement.getBoundingClientRect().top,
        }))
    }, point)
}

export async function scrollInPage(page: Page, scrollY: number): Promise<void> {
    await page.locator('#page').evaluate((pageElement, scrollY) => {
        const rect = pageElement.getBoundingClientRect()
        const downClientX = rect.left + (rect.width / 2)
        const downClientY = rect.top + (rect.height / 2)
        pageElement.dispatchEvent(new MouseEvent('mousedown', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: downClientX,
            clientY: downClientY,
        }))
        pageElement.dispatchEvent(new MouseEvent('mousemove', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: downClientX,
            clientY: downClientY + (scrollY / 2),
        }))
        pageElement.dispatchEvent(new MouseEvent('mousemove', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: downClientX,
            clientY: downClientY + scrollY,
        }))
        pageElement.dispatchEvent(new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: downClientX,
            clientY: downClientY + scrollY,
        }))
    }, scrollY)
}

export async function getComputedStyles(locator: Locator): Promise<CSSStyleDeclaration> {
    return await locator.evaluate((pageElement) => {
        return window.getComputedStyle(pageElement)
    })
}

export async function getPropertyValue(locator: Locator, property: string): Promise<string> {
    return await locator.evaluate((pageElement, property) => {
        return window.getComputedStyle(pageElement).getPropertyValue(property)
    }, property)
}

export async function computePropertyValues(locator: Locator, properties: Array<string>): Promise<Record<string, string | null>> {
    const result = await locator.evaluate((pageElement, properties) => {
        const result: Record<string, string | null> = {}
        for (const key of properties) {
            const div = document.createElement('div')
            pageElement.appendChild(div)
            div.style.position = 'fixed'
            div.style.top = `var(${key})`
            result[key] = window.getComputedStyle(div).top
            if (result[key] === '64px') {
                div.style.top = `calc(1px * var(${key}))`
                result[key] = window.getComputedStyle(div).top
            }
            if (result[key] === '64px') {
                result[key] = null
            }
            div.remove()
        }
        return result
    }, properties)
    for (const property of Object.keys(result)) {
        if (result[property]?.endsWith('px')) {
            result[property] = result[property]!.substring(0, result[property]!.length - 2)
        }
    }
    return result
}
