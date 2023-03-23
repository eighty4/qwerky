export async function installPlaywrightBrowsers(): Promise<void> {
    // installs all browsers (300Mb)
    // require('playwright-core/lib/server').installDefaultBrowsersForNpmInstall()

    // 'chromium' (~128Mb), 'firefox' (~75Mb) or 'webkit' (~62Mb)
    await require('playwright-core/lib/server').installBrowsersForNpmInstall(['chromium'])
}
