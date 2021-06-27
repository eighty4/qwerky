import './qwerky.styl'
import {v4} from 'uuid'

let id
const ws = new WebSocket('ws://localhost:4208/api')
ws.onopen = () => console.log('ws connected')
ws.onclose = code => console.log('ws closed', code)
ws.onmessage = ({data}) => handleWsMessage(JSON.parse(data))

function handleWsMessage(msg) {
    console.log('ws recv', msg)
    switch (msg.type) {
        case 'image':
            showPage(msg.id, msg.image, msg.size)
            break
        case 'describe':
            if (msg.point) console.log('describe', msg.point, msg.element)
            if (msg.selector) console.log('describe', msg.selector, msg.element)
    }
}

function sendWsMessage(type, msg) {
    msg.id = id
    msg.type = type
    console.log('ws send', msg)
    ws.send(JSON.stringify(msg))
}

let pageImageElement

function showPage(id, image, {width, height}) {
    pageImageElement = document.createElement('img')
    pageImageElement.src = 'data:image/png;base64,' + image
    pageImageElement.classList.add('page-image')
    pageImageElement.addEventListener('click', handlePageClick, false)
    document.body.appendChild(pageImageElement)
}

function handlePageClick(e) {
    // e.shiftKey
    // e.ctrlKey
    inspectPoint({x: e.clientX, y: e.clientY})
}

function openPage(url) {
    if (pageImageElement) {
        pageImageElement.removeEventListener('click', handlePageClick)
    }
    id = v4()
    sendWsMessage('open', {url})
}

window.inspectSelector = selector => sendWsMessage('inspect', {selector})

function inspectPoint(point) {
    sendWsMessage('inspect', {point})
}

window.showAppBox = function showAppBox() {
    const box = document.getElementById('start-box')
    box.style.display = 'block'
    box.classList.add('visible')
    const urlInput = box.getElementsByTagName('input')[0]
    const openPageKeyHandler = e => {
        if (e.key === 'Enter') {
            urlInput.removeEventListener('keyup', openPageKeyHandler)
            openPage(e.target.value)
            box.classList.remove('visible')
        }
    }
    urlInput.addEventListener('keyup', openPageKeyHandler, false)
}

setTimeout(showAppBox, 300)
