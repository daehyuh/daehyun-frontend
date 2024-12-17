import React, {useEffect, useState} from "react";
import styles from "@/legacy/styles/Discipline.module.css";
import {CategoryTitle, ContentLayout, Layout} from "@components/index";
import {Container, Divider, Input, ResultContainer, Text, TitleItemContainer} from "@/components";

function Discipline() {
    const [amount, setAmount] = React.useState(0);
    const [result, setResult] = useState(0);

    const amountChangeHandler = (value: string) => {
        setAmount(parseInt(value) || 0);
    }

    useEffect(() => {
        setResult(Math.round(20 + Math.sqrt(amount) * 1.2))
    }, [amount]);

    return (
        <Layout>
            <ContentLayout gap={'20px'}>
                <CategoryTitle title={"권엽 계산기"}/>
                <Container>
                    <TitleItemContainer title={"명성"}>
                        <Input value={amount} onChange={amountChangeHandler}/>
                    </TitleItemContainer>
                </Container>
                <Divider/>
                <ResultContainer>
                    <TitleItemContainer title={"권엽 차감 명성"} width={'100px'}>
                        <Text>{result.toString()}</Text>
                    </TitleItemContainer>
                </ResultContainer>
                <Divider/>
            </ContentLayout>
        </Layout>
    )
}

export default Discipline;