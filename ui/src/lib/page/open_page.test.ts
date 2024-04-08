import {expect, type Locator, test} from '@playwright/test'
import {
    clickInPage,
    computePropertyValues,
    extractFloat,
    getComputedStyle,
    getPropertyValue,
    openUrl,
    scrollInPage,
} from './page.test.util'

// todo test at another browser aspect ratio

test('vendors sizing variables', async ({page}, testInfo) => {
    await openUrl(page, 'https://eighty4.tech')
    await expectDimensions(page.locator('#page'), {
        styles: {
            backgroundPositionY: 0,
            width: 928,
            height: 592,
            top: 64,
            left: 32,
        },
        variables: {
            pageWidth: 1280,
            pageHeight: 1854,
            pageScrollY: 0,
            viewportWidth: 928,
            viewportHeight: 592,
            imageAspectRatio: testInfo.project.name === 'firefox' ? 0.683333 : 0.690399,
            scaledWidth: 928,
            scaledHeight: 1344,
            scaleAspectRatio: testInfo.project.name === 'firefox' ? 0.733333 : 0.725,
        },
    })
})

test('scroll offsets page background image', async ({page}, testInfo) => {
    await openUrl(page, 'https://eighty4.tech')
    await scrollInPage(page, -200)
    await new Promise(res => setTimeout(res, 2000))
    await expectDimensions(page.locator('#page'), {
        styles: {
            backgroundPositionY: -200,
            width: 928,
            height: 592,
            top: 64,
            left: 32,
        },
        variables: {
            pageWidth: 1280,
            pageHeight: 1854,
            pageScrollY: -200,
            viewportWidth: 928,
            viewportHeight: 592,
            imageAspectRatio: testInfo.project.name === 'firefox' ? 0.683333 : 0.690399,
            scaledWidth: 928,
            scaledHeight: 1344,
            scaleAspectRatio: testInfo.project.name === 'firefox' ? 0.733333 : 0.725,
        },
    })
})

test('scroll to bottom page edge offsets api calc click position', async ({page}) => {
    await openUrl(page, 'https://eighty4.tech')
    await scrollInPage(page, -800)
    await clickInPage(page, {x: 300, y: 500})
    await page.locator('#panel').getByText('.project.velcro').isVisible()
})

interface PageDimensions {
    styles: {
        backgroundPositionY: number
        width: number
        height: number
        top: number
        left: number
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
    expect(await getComputedStyle(locator, 'backgroundPositionY')).toBe(`${dimensions.styles.backgroundPositionY}px`)
    expect(await getComputedStyle(locator, 'width')).toBe(`${dimensions.styles.width}px`)
    expect(await getComputedStyle(locator, 'height')).toBe(`${dimensions.styles.height}px`)
    expect(await getComputedStyle(locator, 'top')).toBe(`${dimensions.styles.top}px`)
    expect(await getComputedStyle(locator, 'left')).toBe(`${dimensions.styles.left}px`)
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
    expect(extractFloat(computedValues['--page-scaled-h'])).toBe(dimensions.variables.scaledHeight)
}
