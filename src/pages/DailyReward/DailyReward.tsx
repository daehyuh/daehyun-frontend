import React, {useEffect, useState} from "react";
import {
    CategoryTitle,
    Container,
    ContentLayout,
    Layout,
    SelectOptionType,
    TitleItemContainer
} from "@components/index";
import {CheckBox, Divider, Input, ResultContainer, Select, Text} from "@/components";

type DailyRewardValueImage = {
    value: number | null
    image: string | null
}

type DailyRewardGuildSelectOptionType = SelectOptionType<DailyRewardValueImage>;
type DailyRewardBuffSelectOptionType = SelectOptionType<DailyRewardValueImage>;

type DailyRewardData = {
    amount: number
    guildLevel: DailyRewardGuildSelectOptionType
    buffLevel: DailyRewardBuffSelectOptionType
    fame: boolean
}

type DailyRewardResult = {
    ruble: number
    luna: number
}

function DailyReward() {
    const SELECT_GUILD: DailyRewardGuildSelectOptionType[] = [
        {label: "길드 없음", value: {value: null, image: null}},
        {label: "우드", value: {value: 1, image: "1"}},
        {label: "브론즈", value: {value: 2, image: "2"}},
        {label: "실버", value: {value: 3, image: "3"}},
        {label: "골드", value: {value: 4, image: "4"}},
        {label: "플레티넘", value: {value: 5, image: "5"}},
        {label: "마스터", value: {value: 6, image: "6"}},
    ]

    const SELECT_BUFF: DailyRewardBuffSelectOptionType[] = [
        {label: "동상 없음", value: {value: null, image: null}},
        {label: "1단계", value: {value: 2.5, image: "1"}},
        {label: "2단계", value: {value: 5, image: "2"}},
        {label: "3단계", value: {value: 7.5, image: "3"}},
        {label: "4단계", value: {value: 10, image: "4"}},
        {label: "5단계", value: {value: 12.5, image: "5"}},
        {label: "6단계", value: {value: 15, image: "6"}},
    ]


    const initialDailyRewardData: DailyRewardData = {
        amount: 0,
        guildLevel: SELECT_GUILD[0],
        buffLevel: SELECT_BUFF[0],
        fame: false
    }
    const [dailyRewardData, setDailyRewardData] = useState<DailyRewardData>(initialDailyRewardData);

    const initialDailyRewardResult: DailyRewardResult = {
        ruble: 0,
        luna: 0
    }
    const [dailyRewardResult, setDailyRewardResult] = useState<DailyRewardResult>(initialDailyRewardResult);

    const setDailyRewardDataWithKey = <K extends keyof DailyRewardData, V extends DailyRewardData[K]>(key: K, value: V) => {
        setDailyRewardData((prev) => ({...prev, [key]: value}));
    }

    const amountChangeHandler = (value: string) => {
        const amount = parseFloat(value) || 0;
        setDailyRewardDataWithKey("amount", amount);
    }

    const guildChangeHandler = (value: DailyRewardGuildSelectOptionType) => {
        setDailyRewardDataWithKey('guildLevel', value)
    }

    const buffChangeHandler = (value: DailyRewardBuffSelectOptionType) => {
        setDailyRewardDataWithKey('buffLevel', value)
    }

    const fameCheckedHandler = (isChecked: boolean) => {
        setDailyRewardDataWithKey("fame", isChecked)
    }

    useEffect(() => {
        const {amount, guildLevel, buffLevel, fame} = dailyRewardData;
        const amountValue = amount * 100
        const ruble = Math.floor(amountValue +
            (amountValue * ((guildLevel.value.value ?? 0) + (buffLevel.value.value ?? 0)) / 100) +
            (fame ? ((amountValue * 3) / 100) : 0))
        const luna = Math.floor(amount/42)
        setDailyRewardResult({ruble: ruble, luna: luna})
    }, [dailyRewardData]);
    
    return (
        <Layout>
            <ContentLayout gap={'20px'}>
                <CategoryTitle title={"출석보상 계산기"}/>

                <Container gap={'14px'} align={'centerLeft'}>
                    <TitleItemContainer title={"명성"} width={'100px'}>
                        <Input
                            value={dailyRewardData.amount}
                            placeholder={"명성"}
                            onChange={amountChangeHandler}
                            width={'160px'}/>
                    </TitleItemContainer>
                    <TitleItemContainer title={"나의 길드 등급"} width={'100px'}>
                        <Select value={dailyRewardData.guildLevel}
                                options={SELECT_GUILD}
                                onChange={guildChangeHandler}
                                width={'160px'}
                        />
                    </TitleItemContainer>

                    <TitleItemContainer title={"동상 버프 레벨"} width={'100px'}>
                        <Select value={dailyRewardData.buffLevel}
                                options={SELECT_BUFF}
                                onChange={buffChangeHandler}
                                width={'160px'}
                        />
                    </TitleItemContainer>

                    <TitleItemContainer title={"유명세"} width={'100px'}>
                        <CheckBox id={"fameCheckBox"}
                                  value={dailyRewardData.fame}
                                  onChecked={fameCheckedHandler}
                        />
                    </TitleItemContainer>
                </Container>


                <Container flexDirection={'row'} gap={'20px'} margin={'0 0 10px 0'}>
                    {dailyRewardData.guildLevel.value.image &&
                        <Container gap={'10px'}>
                            <Text>길드 등급</Text>
                            <img
                                src={`../image/Guild/${dailyRewardData.guildLevel.value.image}.png`}
                                alt="Guild Level"
                                width={100}
                            />
                        </Container>}
                    {dailyRewardData.buffLevel.value.image &&
                        <Container gap={'10px'}>
                            <Text>동상 버프 레벨</Text>
                            <img
                                src={`../image/statue/${dailyRewardData.buffLevel.value.image}.png`}
                                alt="Guild Level"
                                width={100}
                            />
                        </Container>}
                </Container>

                <Divider/>
                <ResultContainer>
                    <Container flexDirection={'row'} gap={'20px'}>
                        <Text>
                            {dailyRewardResult.ruble.toString()} 루블
                        </Text>
                        <Text>
                            {dailyRewardResult.luna.toString()} 루나
                        </Text>
                    </Container>
                </ResultContainer>
                <Divider/>
            </ContentLayout>
        </Layout>
    );
}

export default DailyReward;