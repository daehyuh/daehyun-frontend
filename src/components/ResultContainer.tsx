import Container from "./base/Container";
import React from "react";

type ResultContainerProps = {
    children: React.ReactNode
}

function ResultContainer({children}: ResultContainerProps) {
    return <Container
        fullWidth
        align={'centerLeft'}
        backgroundColor={'#3a3a3c'}
        padding={'20px'}
        borderRadius={'4px'}
        gap={'20px'}>
        {children}
    </Container>
}

export default ResultContainer