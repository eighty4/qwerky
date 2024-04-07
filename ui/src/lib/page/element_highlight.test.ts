import {expect, type PlaywrightTestArgs, test} from '@playwright/test'
import {clickInPage, getComputedStyles, getPropertyValue, openUrl, scrollInPage} from './page.test.util'

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

    const styles = await getComputedStyles(h1HighlightLocator)
    expect(styles.width).toBe('178.5px')
    expect(styles.aspectRatio).toBe('238 / 69')
    expect(styles.top).toBe('36px')
    expect(styles.left).toBe('192px')
    expect(styles.border).toBe('3px solid rgb(60, 185, 252)')
})

test('page scrolling maintains highlight position', async ({page}: PlaywrightTestArgs) => {
    await openUrl(page, 'https://eighty4.tech')
    await clickInPage(page, {x: 300, y: 60})

    const h1HighlightLocator = page.locator('.highlight-2')
    await h1HighlightLocator.isVisible()
    expect((await getComputedStyles(h1HighlightLocator)).top).toBe('36px')

    await scrollInPage(page, -200)
    expect((await getComputedStyles(h1HighlightLocator)).top).toBe('-164px')
})
