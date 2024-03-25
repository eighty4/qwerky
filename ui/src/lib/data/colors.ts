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

export function getIndexedColor(i: number): string {
    return colors[Math.min(i, colors.length - 1)]
}
