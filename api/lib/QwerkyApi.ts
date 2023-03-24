import http, {type IncomingMessage, RequestListener} from 'http'
import {type Socket} from 'net'
import {type Browser, chromium} from 'playwright'
import {Server as WebSocketServer, type WebSocket} from 'ws'
import {type ApiRequest, type ApiResponse, InspectPoint, InspectSelector} from 'qwerky-contract'
import {QwerkyPage} from './QwerkyPage'

export interface QwerkyApiOpts {
    port?: number
    requestListener?: RequestListener
}

export class QwerkyApi {
    private browser?: true | Browser
    private readonly pages: Record<string, QwerkyPage> = {}
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

    handleHttpUpgrade = (req: IncomingMessage, socket: Socket, head: Buffer) => {
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

    handleWsConnection = (ws: WebSocket, req: IncomingMessage) => {
        console.log('ws connection established', req.url)
        let active = true
        ws.on('message', (json: string) => {
            const msg = JSON.parse(json)
            console.log('ws recv', msg)
            this.handleWsMessage(msg)
                .then((result) => {
                    if (active && result) {
                        console.log('ws send', result.messageType)
                        ws.send(JSON.stringify(result))
                    }
                })
                .catch(e => console.log('error handling msg', e.message, msg))
        })
        ws.on('close', code => {
            console.log('ws close', code)
            active = false
        })
    }

    async handleWsMessage(msg: ApiRequest): Promise<ApiResponse | void> {
        switch (msg.messageType) {
            case 'open':
                if (!this.pages[msg.sessionId]) {
                    this.pages[msg.sessionId] = new QwerkyPage(msg.sessionId, await (this.browser as Browser).newPage())
                }
                return this.pages[msg.sessionId].open(msg.url)
            case 'inspect':
                if (msg['point']) return this.pages[msg.sessionId].inspectPoint((msg as InspectPoint).point)
                if (msg['selector']) return this.pages[msg.sessionId].inspectSelector((msg as InspectSelector).selector)
                throw new Error('bad inspect msg')
            default:
                throw new Error(`bad msg type ${msg['type']}`)
        }
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
                await Promise.all(Object.keys(this.pages).map(id => this.pages[id].close()))
                console.log('closing chrome browser')
                if (this.browser) {
                    await (this.browser as Browser).close()
                }
                console.log('shutdown finished')
            })())
    }
}
