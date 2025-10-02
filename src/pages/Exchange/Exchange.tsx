import React, {useState} from "react";
import {
    CategoryTitle,
    Container,
    ContentLayout, Divider, Input,
    Layout, ResultContainer,
    Select,
    SelectOptionType, Text,
    TitleItemContainer
} from "@/components";

type ExchangeSelectOptionType = SelectOptionType<number>;
type ExchangeData = {
    type: ExchangeSelectOptionType;
    exchange: number;
    amount: number;
}
type ExchangeResult = {
    exchanged: number
}

function Exchange() {
    const SELECT_TYPE: ExchangeSelectOptionType[] = [
        {label: "루나", value: 1},
        {label: "루블", value: 2},
    ]

    const initialExchangeData: ExchangeData = {
        type: SELECT_TYPE[0],
        exchange: 0,
        amount: 0,
    }
    const [exchangeData, setExchangeData] = useState<ExchangeData>(initialExchangeData);

    const [exchangeResult, setExchangeResult] = useState<ExchangeResult>({exchanged: 0})

    const setExchangeDataWithResult = <K extends keyof ExchangeData, V extends ExchangeData[K]>(key: K, value: V) => {
        setExchangeData((prev) => {
            const next = {
                ...prev,
                [key]: value
            }
            onExchange(next)
            return next
        })
    }
    const typeSelectChangeHandler = (type: ExchangeSelectOptionType) => {
        setExchangeDataWithResult('type', type)
    }

    const amountChangeHandler = (amount: string) => {
        setExchangeDataWithResult('amount', parseFloat(amount) || 0)
    }

    const exchangeChangeHandler = (exchange: string) => {
        setExchangeDataWithResult('exchange', parseFloat(exchange) || 0)
    }

    const onExchange = (data: ExchangeData) => {
        const v = data.type.value === 1 ? Math.ceil(Number(data.amount) / Number(data.exchange) * 1000000) : Math.ceil(Number(data.amount) * Number(data.exchange) / 1000000 * 135 / 100)
        const exchanged = isNaN(v) ? 0 : v
        setExchangeResult({exchanged: exchanged})
    }


    return (
        <Layout>
            <ContentLayout gap={'20px'}>
                <CategoryTitle title={"환율 계산기"}/>
                <Container gap={'16px'} align={'centerLeft'}>
                    <Select value={exchangeData.type}
                            options={SELECT_TYPE}
                            onChange={typeSelectChangeHandler}
                            width={'160px'}
                    />
                    <TitleItemContainer title={exchangeData.type.value === 1 ? "구매 루나" : "구매 루블"} width={'180px'}>
                        <Input value={exchangeData.amount}
                               onChange={amountChangeHandler}
                               width={'160px'}/>
                    </TitleItemContainer>
                    <TitleItemContainer title={"현재 환율"} width={'180px'}>
                        <Input value={exchangeData.exchange}
                               onChange={exchangeChangeHandler}
                               width={'160px'}/>
                    </TitleItemContainer>
                </Container>
                <Divider/>
                <ResultContainer>
                    <Container align={'centerLeft'} gap={'10px'}>
                        <TitleItemContainer title={exchangeData.type.value === 1 ? "지불 루블" : "지불 루나"} width={'180px'}>
                            <Text> {exchangeResult.exchanged.toString()}{exchangeData.type.value === 1 ? "루블" : "루나"} </Text>
                        </TitleItemContainer>
                        {exchangeData.type.value === 2 && <Text>(수수료포함)</Text>}
                    </Container>
                </ResultContainer>
                <Divider/>
            </ContentLayout>
        </Layout>
    );
}

export default Exchange;
