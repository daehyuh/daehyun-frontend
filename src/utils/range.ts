const range = (s: number, e: number, step?: number): number[] => {
    return Array.from({length: (e - s) / (step || 1) + 1}, (_, i) => s + (i * (step || 1)));
}

export default range;