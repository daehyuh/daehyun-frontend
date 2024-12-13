type Completion <T, E> = {
    success?: (result: T) => void
    failure?: (error: E) => void
};

export type {Completion}