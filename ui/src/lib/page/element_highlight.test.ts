import {expect, type PlaywrightTestArgs, test} from '@playwright/test'
import {clickInPage, extractFloat, getComputedStyle, getPropertyValue, openUrl, scrollInPage} from './page.test.util'

test('page click adds element highlight', async ({page}: PlaywrightTestArgs) => {
    await openUrl(page, 'https://eighty4.tech')
    await clickInPage(page, {x: 300, y: 60})

    const h1HighlightLocator = page.locator(`.highlight:nth-of-type(${3})`)
    await h1HighlightLocator.isVisible()
    expect(await getPropertyValue(h1HighlightLocator, '--element-w')).toBe('238')
    expect(await getPropertyValue(h1HighlightLocator, '--element-h')).toBe('69')
    expect(await getPropertyValue(h1HighlightLocator, '--element-x')).toBe('256')
    expect(await getPropertyValue(h1HighlightLocator, '--element-y')).toBe('48')
    expect(await getPropertyValue(h1HighlightLocator, '--highlight-color')).toBe('#3cb9fc')

    expect(extractFloat(await getComputedStyle(h1HighlightLocator, 'width'))).toBe(172)
    expect(extractFloat(await getComputedStyle(h1HighlightLocator, 'height'))).toBe(50)
    expect(extractFloat(await getComputedStyle(h1HighlightLocator, 'top'))).toBe(31)
    expect(extractFloat(await getComputedStyle(h1HighlightLocator, 'left'))).toBe(182)
    expect(await getComputedStyle(h1HighlightLocator, 'border')).toBe('3px solid rgb(60, 185, 252)')
})

test('page scrolling maintains highlight position', async ({page}: PlaywrightTestArgs) => {
    await openUrl(page, 'https://eighty4.tech')
    await clickInPage(page, {x: 300, y: 60})

    const h1HighlightLocator = page.locator(`.highlight:nth-of-type(${3})`)
    await h1HighlightLocator.isVisible()
    expect(extractFloat(await getComputedStyle(h1HighlightLocator, 'top'))).toBe(31)

    await scrollInPage(page, -200)
    expect(extractFloat(await getComputedStyle(h1HighlightLocator, 'top'))).toBe(-169)
})
