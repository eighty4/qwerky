import {installPlaywrightBrowsers, QwerkyApi} from '@eighty4/qwerky-api'
import {serveBuiltFiles} from './FrontendRequestListener.js'

installPlaywrightBrowsers().then(startQwerkyApi)

function startQwerkyApi() {
    const requestListener = process.env.NODE_ENV === 'production' ? serveBuiltFiles() : undefined
    new QwerkyApi({requestListener}).start().then()
}
