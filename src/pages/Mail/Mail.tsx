import React, {useEffect, useState} from "react";
import {
    Button,
    CategoryTitle,
    Container,
    ContentLayout, Divider,
    Input,
    Layout, ResultContainer,
    Select, SelectOptionType, Text,
    TitleItemContainer
} from "@/components";
import range from "@/utils/range";
import useDevice, {DeviceType} from "@/hooks/useDevice";

type MailSelectValueType = {
    index: number,
    value: number
}

type MailSelectOptionType = SelectOptionType<MailSelectValueType>

type MailDataType = {
    deviceType: DeviceType
    currentMail: MailSelectOptionType,
    purposeMail: MailSelectOptionType,
    hermes: number,
    exchange: number,
}

type MailResultType = {
    neededRuble: number,
    neededLuna: number,
    neededCash: number,
    packages: PackageType[]
}

type PriceTableType = {
    luna: number,
    android: number,
    iOS: number
}

type PackageType = {
    luna: number,
    count: number,
    totalPrice: number,
}

function Mail() {
    const PRICE_TABLE: PriceTableType[] = [
        {luna: 42, android: 999, iOS: 1100},
        {luna: 142, android: 2990, iOS: 3300},
        {luna: 420, android: 7900, iOS: 8500},
        {luna: 1420, android: 24900, iOS: 27000},
        {luna: 4242, android: 69000, iOS: 75000},
    ];


    const SELECT_MAIL: MailSelectOptionType[] = range(42, 10002, 10).map((value, index) => ({
        label: `${value}`,
        value: {
            index: index,
            value: value
        }
    }))

    const SELECT_CURRENT_MAIL: MailSelectOptionType[] = SELECT_MAIL.slice(0, SELECT_MAIL.length - 1)

    const [SELECT_PURPOSE_MAIL, setSELECT_PURPOSE_MAIL] = useState(SELECT_MAIL.slice(1))

    const initialMailData: MailDataType = {
        deviceType: useDevice(),
        currentMail: SELECT_CURRENT_MAIL[0],
        purposeMail: SELECT_PURPOSE_MAIL[0],
        hermes: 0,
        exchange: 0
    }
    const [mailData, setMailData] = useState<MailDataType>(initialMailData)

    const initialMailResult: MailResultType = {
        neededRuble: 0,
        neededLuna: 0,
        neededCash: 0,
        packages: []
    }
    const [mailResult, setMailResult] = useState<MailResultType>(initialMailResult)

    const setMailDataWithKey = <K extends keyof MailDataType, V extends MailDataType[K]>(key: K, value: V) => {
        setMailData((prev) => {
            const newValue = {
                ...prev,
                [key]: value
            }
            if (key === 'currentMail') setSELECT_PURPOSE_MAIL(SELECT_MAIL.slice(newValue.currentMail.value.index + 1))
            const purposeMail = newValue.currentMail.value.index >= newValue.purposeMail.value.index ? SELECT_MAIL[newValue.currentMail.value.index + 1] : newValue.purposeMail
            return {
                ...newValue,
                purposeMail: purposeMail
            }
        })
    }

    // 간단한 그리디 방식으로 구현된 가격 계산 함수
    const calculatePrice = () => {
        const neededRuble = 50 * (mailData.purposeMail.value.value - (mailData.hermes * 10) - mailData.currentMail.value.value) * (mailData.currentMail.value.value + mailData.purposeMail.value.value - (mailData.hermes * 10) - 74);
        const neededLuna = Math.ceil((neededRuble * mailData.exchange / 1000000) * 1.35); // 필요한 루나 계산 (올림 처리)

        const [totalCost, _, packagesToBuy] = PRICE_TABLE
            .reverse()
            .reduce<[number, number, PackageType[]]>((acc,
                                                      {luna, iOS, android}, index) => {
                let numBundles = Math.floor(acc[1] / luna);
                if (index !== (PRICE_TABLE.length - 1) && numBundles <= 0) return acc;
                if (index === (PRICE_TABLE.length - 1) && (acc[1] - numBundles * luna) > 0) numBundles += 1;

                const cost = mailData.deviceType === "iphone" ? numBundles * iOS : numBundles * android;

                return [
                    acc[0] + cost,
                    acc[1] - numBundles * luna,
                    [...acc[2], {
                        luna: luna,
                        count: numBundles,
                        totalPrice: cost,
                    }]
                ];
            }, [0, neededLuna, new Array<PackageType>()]);

        setMailResult({
            neededRuble: neededRuble,
            neededLuna: neededLuna,
            neededCash: totalCost,
            packages: packagesToBuy,
        })
    };

    useEffect(() => {
        calculatePrice()
    }, [mailData]);

    const onCalcButtonClickHandler = () => {
        calculatePrice();
    }

    return (
        <Layout>
            <ContentLayout gap={'20px'}>
                <CategoryTitle title={"우체통 계산기"}/>
                <Container align={'centerLeft'} gap={'10px'}>
                    <TitleItemContainer title={"현재 우체통"} width={'128px'}>
                        <Select
                            width={'100px'}
                            value={mailData.currentMail}
                            options={SELECT_CURRENT_MAIL}
                            onChange={(selected) => setMailDataWithKey('currentMail', selected)}/>
                    </TitleItemContainer>
                    <TitleItemContainer title={"목표 우체통"} width={'128px'}>
                        <Select
                            width={'100px'}
                            value={mailData.purposeMail}
                            options={SELECT_PURPOSE_MAIL}
                            onChange={(selected) => setMailDataWithKey('purposeMail', selected)}/>
                    </TitleItemContainer>
                    <TitleItemContainer title={"보유 헤르메스(선택)"} width={'128px'}>
                        <Input width={'100px'}
                                value={mailData.hermes}
                               onChange={(value) => setMailDataWithKey('hermes', parseInt(value) || 0)}/>
                    </TitleItemContainer>
                    <TitleItemContainer title={"현재 환율(선택)"} width={'128px'}>
                        <Input width={'100px'}
                                value={mailData.exchange}
                               onChange={(value) => setMailDataWithKey('exchange', parseInt(value) || 0)}/>
                    </TitleItemContainer>
                </Container>

                <Divider/>

                <ResultContainer>
                    <TitleItemContainer title={"필요 루블"} align={'topLeft'} width={'100px'}>
                        <Container gap={'10px'} align={'topLeft'}>
                            <Text>{(mailResult.neededRuble / 10000).toLocaleString()}만 루블</Text>
                            <Text>({(mailResult.neededRuble).toLocaleString()} 루블)</Text>
                        </Container>
                    </TitleItemContainer>
                    <TitleItemContainer title={"필요 루나"} align={'topLeft'} width={'100px'}>
                        <Container gap={'10px'} align={'topLeft'}>
                            <Text>{(mailResult.neededLuna).toLocaleString()} 루나</Text>
                            <Text>(수수료 포함 환율)</Text>
                        </Container>
                    </TitleItemContainer>
                    <TitleItemContainer title={"필요 현금"} width={'100px'}>
                        <Text>총 {mailResult.neededCash.toLocaleString()}원</Text>
                    </TitleItemContainer>
                    <TitleItemContainer title={"구매 할 패키지"} width={'100px'} align={'topLeft'}>
                        <Container gap={'20px'}>
                            {mailResult.packages.map((item, index) => (
                                <Container key={index} gap={'4px'} align={'centerLeft'}>
                                    <Text>{item.luna.toString()} 루나 패키지 {item.count.toLocaleString()}개</Text>
                                    <Text>({item.totalPrice.toLocaleString()} 원)</Text>
                                </Container>
                            ))}
                        </Container>
                    </TitleItemContainer>
                </ResultContainer>
                <Text color={"#fc7373"} fontWeight={'bold'}>※안드로이드와 아이폰의 루나 가격이 다릅니다※</Text>
                <Divider/>
            </ContentLayout>
        </Layout>
    );
}

export default Mail;