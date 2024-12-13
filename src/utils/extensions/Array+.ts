Array.prototype.mapNotNull = function <U, T>(callback: (value: T, index: number, array: T[]) => U | null | undefined): U[] {
    return this.map(callback).filter((value) => value !== null && value !== undefined)
}

Array.prototype.allSettled = async function <U, T>(callback: (value: T, index: number, array: T[]) => Promise<U>): Promise<PromiseSettledResult<Awaited<U>>[]> {
    return Promise.allSettled(this.map(callback))
}

export {}