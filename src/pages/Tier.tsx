import React, {useEffect} from 'react';
import {useState} from 'react';
import {
    Select,
    CategoryTitle,
    Input,
    CheckBox,
    Container,
    Layout,
    ContentLayout,
    Divider,
    TitleItem,
    ResultContainer, SelectOptionType
} from "../components/index.ts";

function Tier() {
    const SELECT_TIERS: SelectOptionType[] = [{title: '6티어', value: 6}, {title: '5티어', value: 5}]

    const initialTierStateValue = {
        selectedTier: 6,
        sale: false,
        tier3: 0,
        tier4: 0,
        tier5: 0
    }
    const [tier, setTier] = useState(initialTierStateValue);

    const initialCostStateValue = {
        needCard: 120,
        costOf3To4: 3000000,
        costOf4To5: 3000000,
        totalCost: 7000000
    }
    const [cost, setCost] = useState(initialCostStateValue);

    const calcCost = () => {
        // 필요한 3티어 카드 수 계산
        let calculatedNeedCard = 20 - tier.tier3 - (tier.tier4 * 4)
        if (tier.selectedTier === 6) {
            calculatedNeedCard += 100 - (tier.tier5 * 20)
        }
        calculatedNeedCard = Math.max(calculatedNeedCard, 0);

        const sale = tier.sale ? 0.9 : 1;
        // 3티어 → 4티어 강화비용 계산
        const calculated3To4 = (calculatedNeedCard + tier.tier3) / 4 * 100000 * sale;
        // 4티어 → 5티어 강화비용 계산
        const calculated4To5 = tier.selectedTier === 6 ? (((calculatedNeedCard) / 4) + tier.tier4) / 5 * 500000 * sale : 0;

        const defaultCost = (tier.selectedTier === 6 ? 1000000 : 500000) * sale;
        const calculatedTotalCost = calculated3To4 + calculated4To5 + defaultCost;

        setCost({
            needCard: calculatedNeedCard,
            costOf3To4: calculated3To4,
            costOf4To5: calculated4To5,
            totalCost: calculatedTotalCost
        })
    }

    const setInitialCalcCost = (selectedTier: number) => {
        const calculatedNeedCard = initialCostStateValue.needCard
        const sale = tier.sale ? 0.9 : 1;
        const calculated3To4 = (calculatedNeedCard) / 4 * 100000 * sale;
        const calculated4To5 = selectedTier === 6 ? ((calculatedNeedCard) / 4) / 5 * 500000 * sale : 0;
        const defaultCost = (selectedTier === 6 ? 1000000 : 500000) * sale;
        const calculatedTotalCost = calculated3To4 + calculated4To5 + defaultCost;
        setCost({
            needCard: calculatedNeedCard,
            costOf3To4: calculated3To4,
            costOf4To5: calculated4To5,
            totalCost: calculatedTotalCost
        })
    }

    const reset = () => {
        setTier(initialTierStateValue);
        setCost(initialCostStateValue);
    }

    // MARK: - Event Handlers
    const setTierValue = (tier: number, value: string) => {
        const numberValue = Number(value)
        const newTierValue = isNaN(numberValue) ? 0 : numberValue;
        setTier((prevState) => ({
            selectedTier: prevState.selectedTier,
            sale: prevState.sale,
            tier3: tier === 3 ? newTierValue : prevState.tier3,
            tier4: tier === 4 ? newTierValue : prevState.tier4,
            tier5: tier === 5 ? newTierValue : prevState.tier5
        }));
    }

    const selectChangeHandler = (value: string) => {
        const numberValue = Number(value)
        const {selectedTier, ...tierStateValue} = initialTierStateValue
        setTier({selectedTier: numberValue, ...tierStateValue});
        setInitialCalcCost(numberValue)
    }

    const onSaleCheckBoxCheckHandler = (checked: boolean) => {
        setTier(prevState => ({...prevState, sale: checked}));
    }

    const onCalcButtonClickHandler = () => {
        calcCost();
    }

    const onResetButtonClickHandler = () => {
        reset();
    }

    return (
        <Layout>
            <ContentLayout gap={'20px'}>
                <CategoryTitle title="티어 계산기"/>
                <Container align={'centerLeft'} gap={'32px'}>
                    <Select
                            options={SELECT_TIERS}
                            onChange={selectChangeHandler}/>
                    <Container align={'centerLeft'} gap={'10px'}>
                        <TitleItem title={"소지 중인 3티어 카드 수"}>
                            <Input

                                value={tier.tier3}
                                onChange={(value) => {
                                    setTierValue(3, value)
                                }}/>
                        </TitleItem>
                        <TitleItem title={"소지 중인 4티어 카드 수"}>
                            <Input

                                value={tier.tier4}
                                onChange={(value) => {
                                    setTierValue(4, value)
                                }}/>
                        </TitleItem>
                        {tier.selectedTier === 6 && <TitleItem title={"소지 중인 5티어 카드 수"}>
                            <Input

                                value={tier.tier5}
                                onChange={(value) => {
                                    setTierValue(5, value)
                                }}/>
                        </TitleItem>}
                        <TitleItem title={"10% 할인 테두리 적용"} titlePosition={'right'}>
                            <CheckBox id={"saleCheckBox"}
                                      value={tier.sale}
                                      onChecked={onSaleCheckBoxCheckHandler}/>
                        </TitleItem>
                    </Container>
                    <Container flexDirection={"row"} gap={'20px'}>
                        <button
                                onClick={onCalcButtonClickHandler}>계산하기
                        </button>

                        <button
                                onClick={onResetButtonClickHandler}>초기화
                        </button>
                    </Container>
                </Container>
                <Divider/>
                <ResultContainer>
                    <TitleItem title={"필요 3티어 카드 수"}>
                        <span >
                            {cost.needCard.toLocaleString()} 개
                        </span>
                    </TitleItem>
                    <TitleItem title={"3티어 → 4티어 강화비용"}>
                        <span >
                            {cost.costOf3To4.toLocaleString()} 루블
                        </span>
                    </TitleItem>
                    {tier.selectedTier === 6 &&
                        <TitleItem title={"4티어 → 5티어 강화비용"}>
                        <span>
                            {cost.costOf4To5.toLocaleString()} 루블
                        </span>
                        </TitleItem>}
                    <TitleItem title={`${tier.selectedTier === 6 ? '6' : '5'}티어까지 총 강화비용수`} >
                        <Container align={'centerLeft'} gap={'10px'}>
                        <span >
                            {cost.totalCost.toLocaleString()} 루블
                        </span>
                            {tier.selectedTier === 6 ? '(6티어 1장 강화비용 100만루블)' : '(5티어 1장 강화비용 50만루블)'}
                        </Container>
                    </TitleItem>
                </ResultContainer>
                <Divider/>
            </ContentLayout>
        </Layout>
    )
}

export default Tier;