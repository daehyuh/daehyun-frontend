import {Completion, PromiseError} from "../../utils/extensions/types";

type MergeResult<T> = { [P in keyof T]: T[P] | null }

const mergeAPI = async <T extends { [key: string]: Promise<any> } | {}>(values: T,
                                                                        completion: Completion<MergeResult<T>, PromiseError[]>) => {
    const keyValues = Object.entries(values) as [keyof T, T[keyof T]][];
    const usedKeys = keyValues.map(([key]) => key);
    const usedValues = keyValues.map(([_, value]) => value);
    return await Promise.allSettled(usedValues)
        .completionSettledResult({
            success: (results) => {
                const mappedResults = results.reduce((acc, value, index) => {
                    return {
                        ...acc,
                        [usedKeys[index]]: value
                    }
                }, {} as MergeResult<T>);
                completion.success?.(mappedResults);
            },
            failure: completion.failure
        })
}

export default mergeAPI;