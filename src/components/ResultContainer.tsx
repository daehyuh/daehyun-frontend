import Container from "./base/Container";
import React from "react";

type ResultContainerProps = {
    children: React.ReactNode
}

function ResultContainer({children}: ResultContainerProps) {
    return <Container
        fullWidth
        align={'centerLeft'}
        variant={'surface'}
        padding={'24px'}
        borderRadius={'16px'}
        gap={'20px'}>
        {children}
    </Container>
}

export default ResultContainer
