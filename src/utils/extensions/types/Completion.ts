type Completion <T, E> = {
    success?: (result: T) => void
    failure?: (error: E) => void
    finally?: () => void
};

export type {Completion}