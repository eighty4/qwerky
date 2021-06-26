const {chromium} = require('playwright');

(async () => {
    const browser = await chromium.launch()
    const page = await browser.newPage()
    await page.goto('https://alistapart.com/articles')
    const image = await page.screenshot({type: 'png'})
    const encodedImage = image.toString('base64')
    console.log(encodedImage)
    console.log('fuzzy pickles')
})()
