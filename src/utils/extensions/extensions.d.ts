import {Completion, PromiseError} from "src/utils/extensions/types";

declare global {
    interface Array<T> {
        mapNotNull<U>(callback: (value: T, index: number, array: T[]) => U | null | undefined): U[]
        allSettled<U>(callback: (value: T, index: number, array: T[]) => Promise<U>): Promise<PromiseSettledResult<Awaited<U>>[]>
    }

    interface Promise<T> {
        completion(completion: Completion<T, PromiseError>): Promise<void>;

        completionSettledResult: T extends PromiseSettledResult<(infer A)>[] ? (completion: Completion<A[], PromiseError[]>,
                                                                                indexKey: keyof Extract<keyof A, number> | null,
                                                                                useReasonIndex: boolean) => Promise<void> : never;

        thenUpdateIndex: T extends (infer U)[] ? (indexKey: Extract<keyof U, number>) => Promise<U> : never;
        thenMap: T extends (infer U)[] ? <V>(callback: (value: U,
                                                        index: number,
                                                        array: U[]) => V) => Promise<V[]> : never;
        thenMapNotNull: T extends (infer U)[] ? <V>(callback: (value: U,
                                                               index: number,
                                                               array: U[]) => V | null | undefined) => Promise<V[]> : never;
    }
}

export {}