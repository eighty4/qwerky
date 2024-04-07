import {expect, type Locator, type PlaywrightTestArgs, test} from '@playwright/test'

// todo test at another browser aspect ratio

test('vendors sizing variables', async ({page}: PlaywrightTestArgs) => {
    await page.goto('http://localhost:5395/')
    await page.locator('#url-input').click()
    await page.locator('#url-input').pressSequentially('https://eighty4.tech')
    await page.locator('#url-input').blur()
    await page.getByRole('button', {name: 'Click to start'}).click()
    const locator = page.locator('#page')
    await new Promise(res => setTimeout(res, 5000))
    await locator.isVisible()
    const styles = await getComputedStyles(locator)
    expect(styles.backgroundPositionY).toBe('0px')
    expect(styles.height).toBe('608px')
    expect(styles.width).toBe('960px')
    expect(await getPropertyValue(locator, '--page-img-w')).toBe('1280')
    expect(await getPropertyValue(locator, '--page-img-h')).toBe('1854')
    expect(await getPropertyValue(locator, '--page-scroll-y')).toBe('0px')
    const computedValues = await computePropertyValues(locator, [
        '--page-viewport-w',
        '--page-viewport-h',
        '--page-img-ar',
        '--page-scale-ar',
        '--page-scaled-w',
        '--page-scaled-h',
    ])
    expect(computedValues['--page-viewport-w']).toBe('960')
    expect(computedValues['--page-viewport-h']).toBe('608')
    expect(computedValues['--page-img-ar']).toBe('0.690399')
    expect(computedValues['--page-scale-ar']).toBe('0.75')
    expect(computedValues['--page-scaled-w']).toBe('960')
    expect(computedValues['--page-scaled-h']).toBe('1390.5')
})

async function getComputedStyles(locator: Locator): Promise<CSSStyleDeclaration> {
    return await locator.evaluate((pageElement) => {
        return window.getComputedStyle(pageElement)
    })
}

async function getPropertyValue(locator: Locator, property: string): Promise<string> {
    return await locator.evaluate((pageElement, property) => {
        return window.getComputedStyle(pageElement).getPropertyValue(property)
    }, property)
}

async function computePropertyValues(locator: Locator, properties: Array<string>): Promise<Record<string, string | null>> {
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
