import {QwerkyApi} from 'qwerky-api'
import {devModeProxy, serveBuiltFiles} from './FrontendRequestListener'

const requestListener = (process.env.NODE_ENV === 'production' ? serveBuiltFiles : devModeProxy)()

new QwerkyApi({requestListener}).start().then()
