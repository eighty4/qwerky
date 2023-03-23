import {installPlaywrightBrowsers, QwerkyApi} from 'qwerky-api'
import {devModeProxy, serveBuiltFiles} from './FrontendRequestListener'

installPlaywrightBrowsers().then(startQwerkyApi)

function startQwerkyApi() {
    const requestListener = (process.env.NODE_ENV === 'production' ? serveBuiltFiles : devModeProxy)()
    new QwerkyApi({requestListener}).start().then()
}
