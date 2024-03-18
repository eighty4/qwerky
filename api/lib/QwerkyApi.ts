import http, {type IncomingMessage, type RequestListener} from 'node:http'
import type {Socket} from 'node:net'
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
        this.port = opts?.port ?? parseInt(process.env.QWERKY_PORT || '5394', 10)
        this.server = new http.Server(opts?.requestListener ?? ((req, res) => {
            res.statusCode = 404
            res.end()
        }))
        this.wss = new WebSocketServer({noServer: true})
    }

    async start(): Promise<void> {
        if (this.browser) {
            throw new Error('already initialized')
        } else {
            this.browser = true
        }
        this.browser = await chromium.launch({
            headless: process.env.NODE_ENV === 'production',
            handleSIGTERM: false,
            handleSIGHUP: false,
            handleSIGINT: false,
        })
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
        console.debug('QwerkyApi.handleWsConnection', req.url)
        const connection = new QwerkyConnection(this.createQwerkyPage, ws)
        this.connections.push(connection)
        connection.on('close', () => this.removeWsConnection(connection))
    }

    private removeWsConnection(connection: QwerkyConnection) {
        console.debug('QwerkyApi.removeWsConnection')
        this.connections.splice(this.connections.indexOf(connection), 1)
    }

    private createQwerkyPage: QwerkyPageProvider = async (id: any) => {
        console.debug('QwerkyApi.createQwerkyPage')
        const page = await (this.browser as Browser).newPage()
        return new QwerkyPage(id, page)
    }
}
