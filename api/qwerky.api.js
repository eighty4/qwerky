const {chromium} = require('playwright')
const {existsSync, readFile} = require('fs')
const http = require('http')
const {join} = require('path')
const WebSocket = require('ws')

const productionMode = process.env.NODE_ENV === 'production'

const debugLog = productionMode ? () => {} : console.log

class QwerkyPage {

    id

    page

    constructor(id, page) {
        this.id = id
        this.page = page
    }

    async open(url) {
        await this.page.goto(url)
        const imageBuffer = await this.page.screenshot({fullPage: true, type: 'png'})
        const size = await this.page.viewportSize()
        const encodedImage = imageBuffer.toString('base64')
        return {image: encodedImage, size, type: 'image'}
    }

    async inspectPoint(point) {
        const element = await this.page.evaluate(point => {
            window.scrollTo(point.x - 1, point.y - 1)
            const element = document.elementFromPoint(1, 1)
            if (element) {
                const classes = []
                element.classList.forEach(c => classes.push(c))
                const text = element.textContent
                const size = {}
                const position = {}
                return {id: element.id, classes, text, size, position}
            } else {
                throw new Error(`did not find element at ${point.x}, ${point.y}`)
            }
        }, point)
        return {element, point, type: 'describe'}
    }

    async inspectSelector(selector) {
        const inspected = await this.page.$(selector)
        if (inspected) {
            const element = {
                id: '',
                classList: [],
                text: await inspected.textContent(),
                position: {x: 5, y: 5},
                size: {x: 5, y: 5}
            }
            return {element, selector, type: 'describe'}
        }
    }
}

class QwerkyApi {

    browser

    pages = {}

    port

    server

    wss

    constructor(opts) {
        this.port = (opts && opts.port) ? opts.port : parseInt(process.env.QWERKY_PORT || '4208', 10)
    }

    async start() {
        if (this.browser) {
            throw new Error()
        } else {
            this.browser = true
        }
        this.browser = await chromium.launch({headless: productionMode})
        this.server = new http.Server(requestListener())
        this.server.on('upgrade', this.handleHttpUpgrade)
        this.wss = new WebSocket.Server({noServer: true})
        this.wss.on('connection', this.handleWsConnection)
        return new Promise((res) => this.server.listen(this.port, () => {
            console.log('being qwerky @ http://localhost:' + this.port)
            res()
        }))
    }

    handleHttpUpgrade = (req, socket, head) => {
        // todo authentication
        const path = req.url.substring(req.url.lastIndexOf('/') + 1)
        switch (path) {
            case 'api':
                this.wss.handleUpgrade(req, socket, head, ws => this.wss.emit('connection', ws, req))
                break
            default:
                console.log('ws', req.method, req.url, 404)
                socket.write('HTTP/1.1 404 Not Found\r\n\r\n')
                socket.destroy()
                break
        }
    }

    handleWsConnection = (ws, req) => {
        let active = true
        ws.on('message', json => {
            const msg = JSON.parse(json)
            console.log('ws recv', msg)
            this.handleWsMessage(msg)
                .then(result => {
                    if (active && result) {
                        console.log('ws send', result.type)
                        result.id = msg.id
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

    handleWsMessage(msg) {
        switch (msg.type) {
            case 'open':
                return this.open(msg.id, msg.url)
            case 'inspect':
                if (msg.point) return this.pages[msg.id].inspectPoint(msg.point)
                if (msg.selector) return this.pages[msg.id].inspectSelector(msg.selector)
                throw new Error('bad inspect msg')
            default:
                throw new Error('bad msg type ' + msg.type)
        }
    }

    async open(id, url) {
        if (!this.pages[id]) {
            this.pages[id] = new QwerkyPage(id, await this.browser.newPage())
        }
        return await this.pages[id].open(url)
    }

    async shutdown() {
        console.log('shutting down')
        this.server.off('upgrade', this.handleHttpUpgrade)
        this.wss.off('connection', this.handleWsConnection)
        debugLog('closing ws server')
        return new Promise((res) => this.wss.close(res))
            .then(() => new Promise((res, rej) => {
                debugLog('closing http server')
                this.server.close((err) => err ? rej(err) : res())
            }))
            .then(() => (async () => {
                debugLog('closing open chrome pages')
                await Promise.all(Object.keys(this.pages).map(id => this.pages[id].close()))
                debugLog('closing chrome browser')
                await this.browser.close()
                console.log('shutdown finished')
            })())
    }
}

const requestListener = () => {
    if (process.env.QWERKY_UI === 'dev') {
        console.log('proxying qwerky ui in dev mode')
        return (req, res) => {
            console.log(req.method, req.url)
            const proxyRequest = http.request({
                port: 5309,
                host: 'localhost',
                path: req.url,
            }, proxyResponse => {
                console.log('ui proxy', req.method, req.url, proxyResponse.statusCode)
                Object.keys(proxyResponse.headers).forEach(headerName => res.setHeader(headerName, proxyResponse.headers[headerName]))
                res.flushHeaders()
                proxyResponse.on('data', (chunk) => res.write(chunk))
                proxyResponse.resume()
            })
            proxyRequest.end()
            proxyRequest.on('error', e => {
                if (e.code === 'ECONNREFUSED') {
                    console.log(`\n${e.code} error proxying qwerky ui request to http://${e.address}/${e.port} in dev mode\nIs qwerty ui:dev running?\n`)
                } else {
                    console.log(`\n${e}\n`)
                }
            })
        }
    } else {
        const filenames = ['index.html', 'qwerky.bg.js']
        let uiPaths = ['node_modules/qwerky-ui/dist', 'node_modules/qwerky-ui/dist']
        if (process.env.QWERKY_UI_PATH && process.env.QWERKY_UI_PATH.length) {
            uiPaths = [process.env.QWERKY_UI_PATH, ...uiPaths]
        }
        const originalUiPaths = [...uiPaths]
        uiPaths = uiPaths.filter(uiPath => {
            return filenames.every(filename => {
                const filePath = join(uiPath, filename)
                return existsSync(filePath)
            })
        })
        debugLog('ui found at', uiPaths.join(', '))
        if (!uiPaths.length) {
            console.log('ui not found', originalUiPaths.join(', '))
            process.exit(1)
        }
        const uiDir = uiPaths[0]
        const contentTypes = {
            html: 'text/html',
            js: 'text/javascript',
            css: 'text/css',
        }
        const contentTypeFromFilename = filename => {
            const extIndex = filename.lastIndexOf('.') + 1
            const ext = extIndex > 0 ? filename.substring(extIndex) : undefined
            if (extIndex > 0 && contentTypes[ext]) {
                return contentTypes[ext]
            } else {
                return 'application/octet-stream'
            }
        }
        return (req, res) => {
            debugLog(req.method, req.url)
            const filename = req.url.substring(1) || 'index.html'
            readFile(join(uiDir, filename), {encoding: 'utf-8'}, (err, data) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        debugLog(filename, 'not found')
                        res.writeHead(404)
                    } else {
                        console.log(filename, err.message)
                        res.writeHead(500)
                    }
                    res.end()
                } else {
                    res.writeHead(200, {
                        'Content-Type': contentTypeFromFilename(filename),
                        'Content-Length': data.length,
                    })
                    res.end(data)
                }
            })
        }
    }
}

module.exports = {
    QwerkyApi,
}

if (!productionMode) {
    console.log('starting qwerky api in dev mode')
    new QwerkyApi().start().then()
}
