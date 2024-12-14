import {Completion, PromiseError} from "src/utils/extensions/types";

declare global {
    interface Array<T> {
        mapNotNull<U>(callback: (value: T, index: number, array: T[]) => U | null | undefined): U[]

        allSettled<U>(callback: (value: T, index: number, array: T[]) => Promise<U>): Promise<PromiseSettledResult<Awaited<U>>[]>
    }

    interface Promise<T> {
        completion(completion: Completion<T, PromiseError>): Promise<void>;

        completionSettledResult: T extends PromiseSettledResult<(infer A)>[] ? (completion: Completion<Array<A | null>, PromiseError[]>) => Promise<void> : never;

        thenUpdateIndex: T extends (infer U)[] ? (indexKey: keyof Extract<keyof U, number>, start: number | null | undefined = null) => Promise<U[]> : never;
        thenMap: T extends (infer U)[] ? <V>(callback: (value: U,
                                                        index: number,
                                                        array: U[]) => V) => Promise<V[]> : never;
        thenMapNotNull: T extends (infer U)[] ? <V>(callback: (value: U,
                                                               index: number,
                                                               array: U[]) => V | null | undefined) => Promise<V[]> : never;
    }
}

export {}