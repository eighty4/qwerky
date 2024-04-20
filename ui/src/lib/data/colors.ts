const colors = [
    '#3cb9fc',
    '#00fa36',
    '#f3f900',
    '#ff6700',
    '#ff1493',
    '#fb33db',
    '#fa002e',
    '#0310ea',
    '#333',
    '#ccc',
    '#333',
    '#ccc',
    '#333',
    '#ccc',
    '#333',
    '#ccc',
    '#333',
    '#ccc',
]

export function getColorPalette(n: number): Array<string> {
    return n === 0 ? [] : colors.slice(0, n)
}
