import http, {type IncomingMessage, RequestListener} from 'http'
import {type Socket} from 'net'
import {type Browser, chromium} from 'playwright'
import WebSocket, {WebSocketServer} from 'ws'
import {QwerkyConnection} from './QwerkyConnection.js'
import {QwerkyPage, type QwerkyPageProvider} from './QwerkyPage.js'

export interface QwerkyApiOpts {
    port?: number
    requestListener?: RequestListener
}

export class QwerkyApi {
    private browser?: true | Browser
    private readonly connections: Array<QwerkyConnection> = []
    private readonly port: number
    private readonly server: http.Server
    private readonly wss: WebSocketServer

    constructor(opts?: QwerkyApiOpts) {
        this.port = (opts && opts.port) ? opts.port : parseInt(process.env.QWERKY_PORT || '5394', 10)
        this.server = new http.Server(opts?.requestListener)
        this.wss = new WebSocketServer({noServer: true})
    }

    async start(): Promise<void> {
        if (this.browser) {
            throw new Error('already initialized')
        } else {
            this.browser = true
        }
        this.browser = await chromium.launch({headless: process.env.NODE_ENV === 'production'})
        this.server.on('upgrade', this.handleHttpUpgrade)
        this.wss.on('connection', this.handleWsConnection)
        return new Promise((res) => this.server.listen(this.port, () => {
            console.log(`being qwerky @ http://localhost:${this.port}`)
            res()
        }))
    }

    private handleHttpUpgrade = (req: IncomingMessage, socket: Socket, head: Buffer) => {
        if (!req.url) {
            socket.destroy()
            return
        }
        // todo authentication
        const path = req.url.substring(req.url.lastIndexOf('/') + 1)
        switch (path) {
            case 'api':
                this.wss.handleUpgrade(req, socket, head, ws => this.wss.emit('connection', ws, req))
                break
            default:
                console.log('ws', req.method, req.url, 404)
                socket.write(Buffer.from('HTTP/1.1 404 Not Found\r\n\r\n'))
                break
        }
    }

    private handleWsConnection = (ws: WebSocket, req: IncomingMessage) => {
        console.log('ws connection established', req.url)
        const ac = new QwerkyConnection(this.createQwerkyPage, ws)
        this.connections.push(ac)
        ac.on('close', () => this.connections.splice(this.connections.indexOf(ac), 1))
    }

    private createQwerkyPage: QwerkyPageProvider = async (id: any) => {
        const page = await (this.browser as Browser).newPage()
        return new QwerkyPage(id, page)
    }

    async shutdown(): Promise<void> {
        console.log('shutting down')
        this.server.off('upgrade', this.handleHttpUpgrade)
        this.wss.off('connection', this.handleWsConnection)
        console.log('closing ws server')
        return new Promise((res) => this.wss.close(res))
            .then(() => new Promise<void>((res, rej) => {
                console.log('closing http server')
                this.server.close((err) => err ? rej(err) : res())
            }))
            .then(() => (async () => {
                console.log('closing open chrome pages')
                await Promise.all(this.connections.map(connection => connection.close()))
                console.log('closing chrome browser')
                if (this.browser) {
                    await (this.browser as Browser).close()
                }
                console.log('shutdown finished')
            })())
    }
}
