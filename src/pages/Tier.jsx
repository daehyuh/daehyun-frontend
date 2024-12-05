import React from 'react';
import styles from './styles/Tier.module.css';
import {useState} from 'react';
import Select from "../components/base/Select.jsx";
import CategoryTitle from "../components/CategoryTitle.jsx";
import Input from "../components/base/Input.jsx";
import CheckBox from "../components/base/CheckBox.jsx";
import Container from "../components/base/Container.jsx";
import Layout from "../components/base/Layout.jsx";
import ContentBox from "../components/base/ContentBox.jsx";
import Divider from "../components/base/Divider.jsx";
import TitleItem from "../components/TitleItem.jsx";
import ResultContainer from "../components/ResultContainer.jsx";

function Tier() {
    const SELECT_TIERS = [{title: '6티어', value: 6}, {title: '5티어', value: 5}]

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
        const calculated4To5 = (((calculatedNeedCard) / 4) + tier.tier4) / 5 * 500000 * sale;

        const defaultCost = (tier.selectedTier === 6 ? 1000000 : 500000) * sale;
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
    const setTierValue = (tier, value) => {
        const v = Number(value)
        const newTierValue = isNaN(v) ? 0 : v;
        setTier((prevState) => ({
            selectedTier: prevState.selectedTier,
            sale: prevState.sale,
            tier3: tier === 3 ? newTierValue : prevState.tier3,
            tier4: tier === 4 ? newTierValue : prevState.tier4,
            tier5: tier === 5 ? newTierValue : prevState.tier5
        }));
    }

    const selectChangeHandler = (value) => {
        setTier({selectedTier: Number(value), ...initialTierStateValue});
    }

    const onSaleCheckBoxCheckHandler = (checked) => {
        setTier({sale: checked, ...tier});
    }

    const onCalcButtonClickHandler = () => {
        calcCost();
    }

    const onResetButtonClickHandler = () => {
        reset();
    }

    return (
        <Layout>
            <ContentBox gap={20}>
                <CategoryTitle title="티어 계산기"/>
                <Container alignLeft gap={32}>
                    <Select className={styles.TierSelect} options={SELECT_TIERS} onChange={selectChangeHandler}/>
                    <Container alignLeft gap={10}>
                        <TitleItem title={"소지 중인 3티어 카드 수"}>
                            <Input
                                className={styles.TierInput}
                                value={tier.tier3}
                                onChange={(value) => {
                                    setTierValue(3, value)
                                }}/>
                        </TitleItem>
                        <TitleItem title={"소지 중인 4티어 카드 수"}>
                            <Input
                                className={styles.TierInput}
                                value={tier.tier4}
                                onChange={(value) => {
                                    setTierValue(4, value)
                                }}/>
                        </TitleItem>
                        {tier.selectedTier === 6 && <TitleItem title={"소지 중인 5티어 카드 수"}>
                            <Input
                                className={styles.TierInput}
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
                    <Container direction={"row"} gap={20}>
                        <button className={styles.button}
                                onClick={onCalcButtonClickHandler}>계산하기
                        </button>

                        <button className={styles.resetbutton}
                                onClick={onResetButtonClickHandler}>초기화
                        </button>
                    </Container>
                </Container>
                <Divider/>
                <ResultContainer>
                    <TitleItem title={"필요 3티어 카드 수"} titleClassName={styles.TierResultTitle}>
                        <span className={styles.TierResultText}>
                            {cost.needCard.toLocaleString()} 개
                        </span>
                    </TitleItem>
                    <TitleItem title={"3티어 → 4티어 강화비용"} titleClassName={styles.TierResultTitle}>
                        <span className={styles.TierResultText}>
                            {cost.costOf3To4.toLocaleString()} 루블
                        </span>
                    </TitleItem>
                    <TitleItem title={"4티어 → 5티어 강화비용"} titleClassName={styles.TierResultTitle}>
                        <span className={styles.TierResultText}>
                            {cost.costOf4To5.toLocaleString()} 루블
                        </span>
                    </TitleItem>
                    <TitleItem title={"6티어까지 총 강화비용수"} alignTop titleClassName={styles.TierResultTitle}>
                        <Container alignLeft>
                        <span className={styles.TierResultText}>
                            {cost.totalCost.toLocaleString()} 루블
                        </span>
                            <br/>
                            (6티어 1장 강화비용 100만루블)
                        </Container>
                    </TitleItem>
                </ResultContainer>
                <Divider/>
            </ContentBox>
        </Layout>
    )
}

export default Tier;