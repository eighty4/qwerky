import {request, type RequestListener} from 'http'
import {existsSync, readFile} from 'fs'
import {join} from 'path'

const contentTypes = {
    html: 'text/html',
    js: 'text/javascript',
    css: 'text/css',
}

export function serveBuiltFiles(): RequestListener {
    const filenames = ['index.html', 'qwerky.bg.js']
    let uiPaths = ['node_modules/qwerky-ui/dist']
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
    console.log('ui found at', uiPaths.join(', '))
    if (!uiPaths.length) {
        console.log('ui not found', originalUiPaths.join(', '))
        process.exit(1)
    }
    const uiDir = uiPaths[0]
    const contentTypeFromFilename = (filename: string) => {
        const extIndex = filename.lastIndexOf('.') + 1
        const ext = extIndex > 0 ? filename.substring(extIndex) : undefined
        if (ext && extIndex > 0 && contentTypes[ext]) {
            return contentTypes[ext]
        } else {
            return 'application/octet-stream'
        }
    }
    return (req, res) => {
        console.log(req.method, req.url)
        if (!req.url) {
            res.writeHead(400)
            res.end()
            return
        }
        const filename = req.url.substring(1) || 'index.html'
        readFile(join(uiDir, filename), {encoding: 'utf-8'}, (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    console.log(filename, 'not found')
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

export function devModeProxy(port: number): RequestListener {
    console.log(`dev mode proxying qwerky frontend from localhost:${port}`)
    return (req, res) => {
        console.log(req.method, req.url)
        const proxyRequest = request({
            port,
            host: 'localhost',
            path: req.url,
        }, proxyResponse => {
            console.log('ui proxy', req.method, req.url, proxyResponse.statusCode)
            Object.keys(proxyResponse.headers)
                .forEach(headerName => {
                    const headers = proxyResponse.headers[headerName]
                    if (headers) {
                        res.setHeader(headerName, headers)
                    }
                })
            res.flushHeaders()
            proxyResponse.on('data', (chunk) => res.write(chunk))
            proxyResponse.resume()
        })
        proxyRequest.end()
        proxyRequest.on('error', (e: any) => {
            if (e.code === 'ECONNREFUSED') {
                console.log(
                    `\n${e.code} error proxying ui request to ${e.address}/${e.port} in dev mode`,
                    '\nIs qwerty ui:dev running?\n')
            } else {
                console.log(`\n${e}\n`)
            }
        })
    }
}
