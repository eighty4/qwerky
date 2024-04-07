import {expect, type PlaywrightTestArgs, test} from '@playwright/test'
import {clickInPage, getComputedStyle, getPropertyValue, openUrl, scrollInPage} from './page.test.util'

test('page click adds element highlight', async ({page}: PlaywrightTestArgs) => {
    await openUrl(page, 'https://eighty4.tech')
    await clickInPage(page, {x: 300, y: 60})

    const h1HighlightLocator = page.locator('.highlight-2')
    await h1HighlightLocator.isVisible()
    expect(await getPropertyValue(h1HighlightLocator, '--element-w')).toBe('238')
    expect(await getPropertyValue(h1HighlightLocator, '--element-h')).toBe('69')
    expect(await getPropertyValue(h1HighlightLocator, '--element-x')).toBe('256')
    expect(await getPropertyValue(h1HighlightLocator, '--element-y')).toBe('48')
    expect(await getPropertyValue(h1HighlightLocator, '--highlight-color')).toBe('#3cb9fc')

    expect(await getComputedStyle(h1HighlightLocator, 'width')).toBe('178.5px')
    expect(await getComputedStyle(h1HighlightLocator, 'aspectRatio')).toBe('238 / 69')
    expect(await getComputedStyle(h1HighlightLocator, 'top')).toBe('36px')
    expect(await getComputedStyle(h1HighlightLocator, 'left')).toBe('192px')
    expect(await getComputedStyle(h1HighlightLocator, 'border')).toBe('3px solid rgb(60, 185, 252)')
})

test('page scrolling maintains highlight position', async ({page}: PlaywrightTestArgs) => {
    await openUrl(page, 'https://eighty4.tech')
    await clickInPage(page, {x: 300, y: 60})

    const h1HighlightLocator = page.locator('.highlight-2')
    await h1HighlightLocator.isVisible()
    expect(await getComputedStyle(h1HighlightLocator, 'top')).toBe('36px')

    await scrollInPage(page, -200)
    expect(await getComputedStyle(h1HighlightLocator, 'top')).toBe('-164px')
})
