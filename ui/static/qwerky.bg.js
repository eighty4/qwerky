(() => {
    const colors = [
        '#3cb9fc',
        '#00fa36',
        '#f3f900',
        '#ff6700',
        '#ff1493',
        '#fb33db',
        '#fa002e',
        '#0310ea',
    ]

    let shapeCounter = 0

    let drawnWindowSize = {}

    const shapes = document.getElementById('shapes')

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        } : null
    }

    function randomPoint() {
        const xOverflow = window.innerWidth * .1
        const xRange = window.innerWidth * 1.2
        const yOverflow = window.innerHeight * .1
        const yRange = window.innerHeight * 1.2
        return {
            x: Math.floor(Math.random() * xRange - xOverflow),
            y: Math.floor(Math.random() * yRange - yOverflow),
        }
    }

    function randomShape() {
        const p1 = randomPoint()
        const p2 = randomPoint()
        const top = p1.y < p2.y ? p1.y : p2.y
        const left = p1.x < p2.x ? p1.x : p2.x
        const width = Math.max(50, Math.abs(p1.x - p2.x))
        const height = Math.max(50, Math.abs(p1.y - p2.y))
        return {top, left, width, height}
    }

    function showRandomBox(hex) {
        showBox(hex, randomShape())
    }

    function showRandomCircle(hex) {
        const circle = randomShape()
        delete circle.height
        if (circle.width === 50) {
            showRandomCircle(hex)
        } else {
            showCircle(hex, circle)
        }
    }

    function showBox(hex, shape) {
        shapes.appendChild(createShapeElement(hex, shape))
    }

    function showCircle(hex, shape) {
        const circle = createShapeElement(hex, shape)
        circle.style.borderRadius = Math.floor(shape.width / 2) + 'px'
        shapes.appendChild(circle)
    }

    function createShapeElement(hex, shape) {
        const shapeElement = document.createElement('div')
        const rgb = hexToRgb(hex)
        shapeElement.style.boxShadow = `
        inset 0 0 0 1px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, .5),
        inset 0 0 0 2px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, .25),
        0 0 0 1px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, .3),
        0 0 0 2px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, .15)
        `
        shapeElement.style.border = '1px solid ' + hex
        shapeElement.style.position = 'fixed'
        shapeElement.style.top = shape.top + 'px'
        shapeElement.style.left = shape.left + 'px'
        shapeElement.style.width = shape.width + 'px'
        shapeElement.style.height = (shape.height || shape.width) + 'px'
        shapeElement.style.transform = 'scale(0)'
        shapeElement.animate([
            {
                transform: 'scale(0)'
            },
            {
                transform: 'scale(1)'
            },
        ], {
            duration: 300,
            delay: 25 * shapeCounter++,
            fill: 'forwards',
        })
        return shapeElement
    }

    function redraw() {
        Array.from(shapes.children).forEach(shape => shape.remove())
        draw()
    }

    function draw() {
        shapeCounter = 0
        colors.forEach(showRandomBox)
        colors.forEach(showRandomCircle)
        drawnWindowSize = {
            width: window.innerWidth,
            height: window.innerHeight,
        }
    }

    function checkRedraw(prev, next) {
        if (prev !== next) {
            const numerator = Math.min(prev, next)
            const denominator = Math.max(prev, next)
            if (numerator / denominator < .8) {
                return true
            }
        }
        return false
    }

    function checkRedrawOnResize() {
        if (checkRedraw(drawnWindowSize.width, window.innerWidth)
            || checkRedraw(drawnWindowSize.height, window.innerHeight)) {
            redraw()
        }
    }

    draw()

    function debounce(func, wait, immediate) {
        let timeout
        return function () {
            const context = this, args = arguments
            const later = function () {
                timeout = null
                if (!immediate) func.apply(context, args)
            }
            const callNow = immediate && !timeout
            clearTimeout(timeout)
            timeout = setTimeout(later, wait)
            if (callNow) func.apply(context, args)
        }
    }

    window.addEventListener('resize', debounce(checkRedrawOnResize, 200))
})()
