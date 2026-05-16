type PaginatedResponse<T> = {
    content?: T[]
    items?: T[]
    number?: number
    page?: number
    size?: number
    totalPages?: number
    totalElements?: number
    first?: boolean
    last?: boolean
    numberOfElements?: number
    empty?: boolean
}

export type RankApiResult<T> = T[] | PaginatedResponse<T>

export type RankPagination = {
    page: number
    size: number
    totalPages: number
    totalElements: number
    hasPrevious: boolean
    hasNext: boolean
}

export default PaginatedResponse
