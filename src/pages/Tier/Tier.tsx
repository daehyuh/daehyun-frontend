import React, { useState } from 'react';
import {
    Select,
    SelectOptionType,
    Input,
    CheckBox,
    Container,
    Layout,
    ContentLayout,
    Divider,
    CategoryTitle,
    TitleItemContainer,
    ResultContainer,
    Button,
    Text
} from "@/components";

function Tier() {
    const SELECT_TIERS: SelectOptionType<number>[] = [{ label: '6티어', value: 6 }, { label: '5티어', value: 5 }];
    const [selectedTierValue, setSelectedTierValue] = useState(SELECT_TIERS[0]);

    const initialTierStateValue = {
        selectedTier: 6,
        sale: false,
        tier3: 0,
        tier4: 0,
        tier5: 0
    };
    const [tier, setTier] = useState(initialTierStateValue);

    const initialCostStateValue = {
        needCard: 120,
        costOf3To4: 3000000,
        costOf4To5: 3000000,
        totalCost: 7000000
    };
    const [cost, setCost] = useState(initialCostStateValue);

const calcCost = () => {
    const sale = tier.sale ? 0.9 : 1;

    if (tier.selectedTier === 6) {
        const needTier5 = Math.max(6 - tier.tier5, 0);
        const needTier4 = Math.max(needTier5 * 5 - tier.tier4, 0);
        const needTier3 = Math.max(needTier4 * 4 - tier.tier3, 0);
        

        console.log('needTier3:', needTier3, 'needTier4:', needTier4, 'needTier5:', needTier5);
        
        // const costOf3To4 = Math.ceil((needTier3) / 4) * 100000 * sale;

        const costOf3To4 = Math.ceil((120 - (tier.tier4*4 + tier.tier5*20)) / 4 * 100000 * sale);
        const costOf4To5 = Math.ceil(30 - (tier.tier5*5)) / 5  * 500000 * sale;
        const defaultCost = 1000000 * sale;
        const totalCost = costOf3To4 + costOf4To5 + defaultCost;

        console.log('costOf3To4:', costOf3To4, 'costOf4To5:', costOf4To5, 'defaultCost:', defaultCost, 'totalCost:', totalCost);

        setCost({
            needCard: needTier3,
            costOf3To4 : costOf3To4,
            costOf4To5 : costOf4To5,
            totalCost : totalCost
        });
    } else {
        const needTier4 = Math.max(5 - tier.tier4, 0);
        const needTier3 = Math.max(20 - tier.tier4 * 4, 0);
        

        const costOf3To4 = Math.ceil((20 - (tier.tier4*4)) / 4 * 100000 * sale);
        const defaultCost = 500000 * sale;
        const totalCost = costOf3To4 + defaultCost;
        console.log('needTier3:', needTier3, 'needTier4:', needTier4);
        console.log('costOf3To4:', costOf3To4, 'defaultCost:', defaultCost, 'totalCost:', totalCost);
        setCost({
            needCard: needTier3,
            costOf3To4 : costOf3To4,
            costOf4To5: 0,
            totalCost : totalCost
        });
    }
};


    const setInitialCalcCost = (selectedTier: number) => {
    const sale = tier.sale ? 0.9 : 1;

    if (selectedTier === 6) {
        const needTier5 = 6;
        const needTier4 = needTier5 * 5;
        const needTier3 = needTier4 * 4;

        const costOf3To4 = Math.ceil(needTier3 / 4) * 100000 * sale;
        const costOf4To5 = Math.ceil(needTier4 / 5) * 500000 * sale;
        const defaultCost = 1000000 * sale;

        const totalCost = costOf3To4 + costOf4To5 + defaultCost;

        setCost({
            needCard: needTier3,
            costOf3To4,
            costOf4To5,
            totalCost
        });
    } else {
        const needTier4 = 5;
        const needTier3 = needTier4 * 4;

        const costOf3To4 = Math.ceil(needTier3 / 4) * 100000 * sale;
        const costOf4To5 = 0;
        const defaultCost = 500000 * sale;

        const totalCost = costOf3To4 + defaultCost;

        setCost({
            needCard: needTier3,
            costOf3To4,
            costOf4To5,
            totalCost
        });
    }
};


    const reset = () => {
        setTier(prev => {
            setInitialCalcCost(prev.selectedTier);
            return { ...initialTierStateValue, selectedTier: prev.selectedTier, sale: prev.sale };
        });
    };

    // MARK: - Event Handlers
    const setTierValue = (tierNum: number, value: string) => {
        const numberValue = Number(value);
        const newTierValue = isNaN(numberValue) ? 0 : numberValue;
        setTier(prev => ({
            ...prev,
            tier3: tierNum === 3 ? newTierValue : prev.tier3,
            tier4: tierNum === 4 ? newTierValue : prev.tier4,
            tier5: tierNum === 5 ? newTierValue : prev.tier5
        }));
    };

    const selectChangeHandler = (value: SelectOptionType<number>) => {
        const numberValue = value.value;
        setSelectedTierValue(value);
        setTier(prev => ({ ...initialTierStateValue, selectedTier: numberValue, sale: prev.sale }));
        setInitialCalcCost(numberValue);
    };

    const onSaleCheckBoxCheckHandler = (checked: boolean) => {
        setTier(prev => ({ ...prev, sale: checked }));
    };

    const onCalcButtonClickHandler = () => {
        calcCost();
    };

    const onResetButtonClickHandler = () => {
        reset();
    };

    return (
        <Layout>
            <ContentLayout gap={'20px'}>
                <CategoryTitle title="티어 계산기" />
                <Container align={'centerLeft'} gap={'32px'}>
                    <Select
                        value={selectedTierValue}
                        options={SELECT_TIERS}
                        onChange={selectChangeHandler}
                    />
                    <Container align={'centerLeft'} gap={'10px'}>
                        <TitleItemContainer title={"소지 중인 3티어 카드 수"}>
                            <Input value={tier.tier3} onChange={(value) => setTierValue(3, value)} />
                        </TitleItemContainer>
                        <TitleItemContainer title={"소지 중인 4티어 카드 수"}>
                            <Input value={tier.tier4} onChange={(value) => setTierValue(4, value)} />
                        </TitleItemContainer>
                        {tier.selectedTier === 6 && (
                            <TitleItemContainer title={"소지 중인 5티어 카드 수"}>
                                <Input value={tier.tier5} onChange={(value) => setTierValue(5, value)} />
                            </TitleItemContainer>
                        )}
                        <TitleItemContainer title={"10% 할인 테두리 적용"} titlePosition={'right'}>
                            <CheckBox
                                id={"saleCheckBox"}
                                value={tier.sale}
                                onChecked={onSaleCheckBoxCheckHandler}
                            />
                        </TitleItemContainer>
                    </Container>
                    <Container flexDirection={"row"} gap={'20px'}>
                        <Button onClick={onCalcButtonClickHandler}>계산하기</Button>
                        <Button onClick={onResetButtonClickHandler} backgroundColor={'#3a3a3c'}>초기화</Button>
                    </Container>
                </Container>
                <Divider />
                <ResultContainer>
                    <TitleItemContainer width={'160px'} title={"필요 3티어 카드 수"}>
                        <Text>{cost.needCard.toLocaleString()} 개</Text>
                    </TitleItemContainer>
                    <TitleItemContainer width={'160px'} title={"3티어 → 4티어 강화비용"}>
                        <Text>{cost.costOf3To4.toLocaleString()} 루블</Text>
                    </TitleItemContainer>
                    {tier.selectedTier === 6 && (
                        <TitleItemContainer width={'160px'} title={"4티어 → 5티어 강화비용"}>
                            <Text>{cost.costOf4To5.toLocaleString()} 루블</Text>
                        </TitleItemContainer>
                    )}
                    <TitleItemContainer width={'160px'} align={'topLeft'}
                        title={`${tier.selectedTier}티어까지 총 강화비용수`}>
                        <Container align={'centerLeft'} gap={'10px'}>
                            <Text>{cost.totalCost.toLocaleString()} 루블</Text>
                            <Text>
                                {tier.selectedTier === 6
                                    ? '(6티어 1장 강화비용 100만루블)'
                                    : '(5티어 1장 강화비용 50만루블)'}
                            </Text>
                        </Container>
                    </TitleItemContainer>
                </ResultContainer>
                <Divider />
            </ContentLayout>
        </Layout>
    );
}

export default Tier;
