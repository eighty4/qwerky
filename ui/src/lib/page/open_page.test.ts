import {expect, type Locator, type PlaywrightTestArgs, test} from '@playwright/test'
import {computePropertyValues, getComputedStyles, getPropertyValue, openUrl, scrollInPage} from './page.test.util'

// todo test at another browser aspect ratio

test('vendors sizing variables', async ({page}: PlaywrightTestArgs) => {
    await openUrl(page, 'https://eighty4.tech')
    await expectDimensions(page.locator('#page'), {
        styles: {
            backgroundPositionY: 0,
            height: 608,
            width: 960,
        },
        variables: {
            pageWidth: 1280,
            pageHeight: 1854,
            pageScrollY: 0,
            viewportWidth: 960,
            viewportHeight: 608,
            imageAspectRatio: 0.690399,
            scaledWidth: 960,
            scaledHeight: 1390.5,
            scaleAspectRatio: 0.75,
        },
    })
})

test('scroll offsets page background image', async ({page}: PlaywrightTestArgs) => {
    await openUrl(page, 'https://eighty4.tech')
    await scrollInPage(page, -200)
    await new Promise(res => setTimeout(res, 2000))
    await expectDimensions(page.locator('#page'), {
        styles: {
            backgroundPositionY: -200,
            height: 608,
            width: 960,
        },
        variables: {
            pageWidth: 1280,
            pageHeight: 1854,
            pageScrollY: -200,
            viewportWidth: 960,
            viewportHeight: 608,
            imageAspectRatio: 0.690399,
            scaledWidth: 960,
            scaledHeight: 1390.5,
            scaleAspectRatio: 0.75,
        },
    })
})

interface PageDimensions {
    styles: {
        backgroundPositionY: number
        width: number
        height: number
    }
    variables: {
        pageWidth: number
        pageHeight: number
        pageScrollY: number
        viewportWidth: number
        viewportHeight: number
        imageAspectRatio: number
        scaleAspectRatio: number
        scaledWidth: number
        scaledHeight: number
    }
}

async function expectDimensions(locator: Locator, dimensions: PageDimensions): Promise<void> {
    const styles = await getComputedStyles(locator)
    expect(styles.backgroundPositionY).toBe(`${dimensions.styles.backgroundPositionY}px`)
    expect(styles.width).toBe(`${dimensions.styles.width}px`)
    expect(styles.height).toBe(`${dimensions.styles.height}px`)
    expect(await getPropertyValue(locator, '--page-img-w')).toBe(`${dimensions.variables.pageWidth}`)
    expect(await getPropertyValue(locator, '--page-img-h')).toBe(`${dimensions.variables.pageHeight}`)
    expect(await getPropertyValue(locator, '--page-scroll-y')).toBe(`${dimensions.variables.pageScrollY}px`)
    const computedValues = await computePropertyValues(locator, [
        '--page-viewport-w',
        '--page-viewport-h',
        '--page-img-ar',
        '--page-scale-ar',
        '--page-scaled-w',
        '--page-scaled-h',
    ])
    expect(computedValues['--page-viewport-w']).toBe(`${dimensions.variables.viewportWidth}`)
    expect(computedValues['--page-viewport-h']).toBe(`${dimensions.variables.viewportHeight}`)
    expect(computedValues['--page-img-ar']).toBe(`${dimensions.variables.imageAspectRatio}`)
    expect(computedValues['--page-scale-ar']).toBe(`${dimensions.variables.scaleAspectRatio}`)
    expect(computedValues['--page-scaled-w']).toBe(`${dimensions.variables.scaledWidth}`)
    expect(computedValues['--page-scaled-h']).toBe(`${dimensions.variables.scaledHeight}`)
}
