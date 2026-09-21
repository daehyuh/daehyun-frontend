type JsonProbability = {
    items: {
        name: string,
        chance: number,
        equip: boolean,
        minQuantity?: number,
        maxQuantity?: number
    }[]
}

export default JsonProbability;
