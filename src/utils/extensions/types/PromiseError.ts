export class PromiseError extends Error {
    index: number | null
    name: string
    message: string

    constructor(name: string, reason: string, index: number | null = null) {
        super()
        this.name = name
        this.index = index
        this.message = reason
    }
}