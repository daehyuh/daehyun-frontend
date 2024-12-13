import {Completion, PromiseError} from "./types/index";

Promise.prototype.completion = async function <T>(completion: Completion<T, PromiseError>) {
    await (this as Promise<T>)
        .then((result) => completion.success?.(result))
        .catch(reason => completion.failure?.(
            new PromiseError("PromiseError'", reason)
        ));
};

Promise.prototype.thenMap = async function <V, U>(callback: (value: U, index: number, array: U[]) => V): Promise<V[]> {
    return (this as Promise<U[]>)
        .then((result) => result.map(callback));
}


Promise.prototype.thenMap = async function <V, U>(callback: (value: U, index: number, array: U[]) => V | null | undefined): Promise<V[]> {
    return (this as Promise<U[]>)
        .then((result) => result
            .map(callback)
            .filter((value) => value !== null && value !== undefined)
        );
}

Promise.prototype.thenUpdateIndex = async function <U>(indexKey: keyof Extract<keyof U, number>): Promise<U[]> {
    return (this as Promise<U[]>)
        .thenMap((value, index) => {
            return {
                ...value,
                [indexKey]: index
            } as U;
        });
}

Promise.prototype.completionSettledResult = async function <A>(completion: Completion<A[], PromiseError[]>,
                                                               indexKey: keyof Extract<keyof A, number> | null = null,
                                                               useReasonIndex: boolean = true): Promise<void> {
    (this as Promise<PromiseSettledResult<A>[]>)
        .then((results) => {
            const fulfilled = results.mapNotNull((result, index) => result.status === 'fulfilled' ? (indexKey ? {
                ...result.value,
                [indexKey]: index
            } : result.value) as A : null);
            const rejected: PromiseError[] = results.mapNotNull((result, index) => result.status === 'rejected' ?
                new PromiseError("PromiseRejectedError", result.reason, useReasonIndex ? index : null)
                : null);
            completion.success?.(fulfilled);
            completion.failure?.(rejected);
        })
}

export {}