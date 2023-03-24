import {installPlaywrightBrowsers, QwerkyApi} from 'qwerky-api'
import {devModeProxy, serveBuiltFiles} from './FrontendRequestListener.js'

installPlaywrightBrowsers().then(startQwerkyApi)

function startQwerkyApi() {
    const requestListener = process.env.NODE_ENV === 'production' ? serveBuiltFiles() : devModeProxy(5395)
    new QwerkyApi({requestListener}).start().then()
}
