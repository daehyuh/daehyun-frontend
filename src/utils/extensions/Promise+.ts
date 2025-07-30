import {Completion, PromiseError} from "./types/index";

Promise.prototype.completion = async function <T>(completion: Completion<T, PromiseError>): Promise<void> {
    await (this as Promise<T>)
        .then((result) => completion.success?.(result))
        .catch(reason => completion.failure?.(
            new PromiseError("PromiseError'", reason)
        ))
        .finally(() => completion.finally?.());
};

Promise.prototype.completionSettledResult = async function <A>(completion: Completion<Array<A | null>, PromiseError[]>): Promise<void> {
    (this as Promise<PromiseSettledResult<A>[]>)
        .then((results) => {
            const fulfilled = results.map((result) => result.status === 'fulfilled' ? result.value as A : null);
            const rejected: PromiseError[] = results.mapNotNull((result, index) => result.status === 'rejected' ?
                new PromiseError("PromiseRejectedError", result.reason, index)
                : null);
            completion.success?.(fulfilled);
            if (rejected.length > 0) {
                completion.failure?.(rejected);
            }
            completion.finally?.();
        })
}

Promise.prototype.thenMap = async function <V, U>(callback: (value: U, index: number, array: U[]) => V): Promise<V[]> {
    return (this as Promise<U[]>)
        .then((result) => result.map(callback));
}

Promise.prototype.thenMapNotNull = async function <V, U>(callback: (value: U, index: number, array: U[]) => V | null | undefined): Promise<V[]> {
    return (this as Promise<U[]>)
        .then((result) => result
            .map(callback)
            .filter((value) => value !== null && value !== undefined)
        );
}

Promise.prototype.thenUpdateIndex = async function <U>(indexKey: keyof Extract<keyof U, number>, start: number | null | undefined): Promise<U[]> {
    return (this as Promise<U[]>)
        .thenMap((value, index) => {
            return {
                ...value,
                [indexKey]: (start ?? 0) + index
            } as U;
        });
}

export {}