import React, {useEffect, useMemo, useState} from "react";
import styled from "styled-components";
import {ContentLayout, Layout, Select, SelectOptionType} from "../../components/index";
import {getCookie, setCookie} from "@/hooks/cookie";
import {CategoryTitle, Container, Text} from "@/components";
import Input from "@/components/base/Input";

import probabillty from "@/assets/probabilities/snowballFightProbability";

import GradeProbability from "@/constant/GradeProbability";
import ProbabilityItem from "@/constant/ProbabilityItem";
import Table from "@components/base/Table";
import GachaTableRow from "@/pages/Gacha/components/GachaTableRow";
import GachaTableStickyRow from "@/pages/Gacha/components/GachaTableStickyRow";
import Button from "@/components/base/Button";

type GachaSelectOptionType = SelectOptionType<keyof GradeProbability | null>;

export type GachaProbabilityItem = {
    isChecked: boolean,
    originalChance: number
} & ProbabilityItem

export type TotalProbability = {
    equip: number
}

const SimulationCard = styled(Container)`
    gap: ${({theme}) => theme.spacing.md};
    border-radius: ${({theme}) => theme.radii.lg};
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surface};
    padding: ${({theme}) => theme.spacing.lg};
`;

const SimulationHeader = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing.xs};
`;

const SimulationTitle = styled.div`
    display: inline-flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing.sm};
    font-weight: ${({theme}) => theme.typography.weights.bold};
    color: ${({theme}) => theme.colors.textPrimary};
    font-size: ${({theme}) => theme.typography.sizes.lg};
`;

const SimulationActions = styled.div`
    display: flex;
    gap: ${({theme}) => theme.spacing.sm};
    flex-wrap: wrap;
    align-items: center;
`;

const ResultList = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: ${({theme}) => theme.spacing.sm};
    min-width: 700px;

    @media (min-width: ${({theme}) => theme.breakpoints.md}px) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    @media (min-width: ${({theme}) => theme.breakpoints.lg}px) {
        grid-template-columns: repeat(5, minmax(0, 1fr));
        min-width: 840px;
    }
`;

const ResultScroll = styled.div`
    width: 100%;
    overflow-x: auto;
    padding-bottom: 4px;
`;

const ResultItem = styled.div`
    display: grid;
    grid-template-columns: 48px 1fr;
    gap: ${({theme}) => theme.spacing.sm};
    align-items: center;
    padding: ${({theme}) => `${theme.spacing.sm}`};
    border-radius: ${({theme}) => theme.radii.md};
    background: ${({theme}) => theme.colors.surfaceMuted};
    border: 1px solid ${({theme}) => theme.colors.border};
`;

const ResultChance = styled.span`
    color: ${({theme}) => theme.colors.textSecondary};
    font-size: ${({theme}) => theme.typography.sizes.sm};
    display: block;
`;

const ResultName = styled.span`
    font-weight: ${({theme}) => theme.typography.weights.semibold};
    color: ${({theme}) => theme.colors.textPrimary};
    display: block;
`;

const ResultImage = styled.img`
    width: 48px;
    height: 48px;
    object-fit: contain;
    border-radius: ${({theme}) => theme.radii.sm};
    background: ${({theme}) => theme.colors.surface};
    border: 1px solid ${({theme}) => theme.colors.border};
`;

const IconBadge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: ${({theme}) => theme.radii.pill};
    background: ${({theme}) => theme.colors.surfaceMuted};
    border: 1px solid ${({theme}) => theme.colors.border};
    font-size: 18px;
`;

function Gacha() {
    const SELECT_GRADES: GachaSelectOptionType[] = [
        {label: '선택해주세요', value: null},
        {label: '2500루블', value: '2500R'},
        {label: '150루나', value: '150'},
        {label: '750루나', value: '750'},
        {label: '패키지상자', value: 'Legend'}
    ]

    const [selectedGradeValue, setSelectedGradeValue] = useState(SELECT_GRADES[0]);
    const [items, setItems] = useState<GachaProbabilityItem[]>([]);
    const [totalProbability, setTotalProbability] = useState<TotalProbability>({
        equip: 0
    })
    const [simResults, setSimResults] = useState<ProbabilityItem[]>([]);
    const [simError, setSimError] = useState<string | null>(null);
    const [simCount, setSimCount] = useState<number>(1);

    const availableItems = useMemo(
        () => items.filter(item => item.chance > 0),
        [items]
    );

    useEffect(() => {
        const savedGrade = getCookie<GachaSelectOptionType>("selectedGrade");
        if (savedGrade) setSelectedGradeValue(savedGrade ?? SELECT_GRADES[0]);
        fetchItems(savedGrade?.value ?? null);
    }, []);

    const selectChangeHandler = (value: GachaSelectOptionType) => {
        setSelectedGradeValue(value)
        setCookie<GachaSelectOptionType>("selectedGrade", value, 7);
        fetchItems(value.value)
    }

    const fetchItems = (grade: keyof GradeProbability | null) => {
        const savedCheckedItems = getCookie("checkedItems");
        
        const savedCheckedItemsSet2 = new Set(savedCheckedItems ? savedCheckedItems.split(",").map(Number) : []);
        const items2 = (grade ? probabillty[grade].items : []).map((item, index) => ({
            ...item,
            isChecked: savedCheckedItemsSet2.has(index),
            originalChance: item.chance
        }))

        setItemsWithCalculation(items2)
    }

    const setItemsWithCalculation = (items: GachaProbabilityItem[]) => {
        setItems(() => {
            const [checkedProbabilitySum, uncheckedProbabilitySum] = items.reduce((acc, item) => {
                if (item.isChecked) {
                    acc[0] += item.originalChance;
                } else {
                    acc[1] += item.originalChance;
                }
                return acc;
            }, [0, 0]);

            const newItems = items.map((item) => {
                const redistributedChance = uncheckedProbabilitySum > 0 ? (item.originalChance / uncheckedProbabilitySum) * checkedProbabilitySum : 0;
                return {
                    ...item,
                    chance: item.isChecked ? 0 : item.originalChance + redistributedChance
                }
            })
            const equipItems = newItems.filter(item => item.equip);
            const equipProbabilitySum = equipItems.reduce((acc, item) => acc + item.chance, 0);
            setTotalProbability({
                equip: equipProbabilitySum
            });
            return newItems
        })
    }

    const checkedItemsHandler = (index: number, isChecked: boolean) => {
        const newItems = [...items];
        newItems[index].isChecked = isChecked
        setItemsWithCalculation(newItems);
        const cookieValue = newItems
            .mapNotNull((item, index) => item.isChecked ? index : null)
            .join(",")
        setCookie("checkedItems", cookieValue, 7);
    }

    const checkedAllItemsHandler = (isChecked: boolean) => {
        const newItems = items
            .map(item => ({...item, isChecked: item.equip ? isChecked : item.isChecked}))
        setItemsWithCalculation(newItems);
        const cookieValue = newItems
            .mapNotNull((item, index) => item.isChecked ? index : null)
            .join(",")
        setCookie("checkedItems", cookieValue, 7);
    }

    const getItemImage = (name: string) =>
        `image/Items/${name.replace(': ', '')}.webp`;

    const simulateDraw = () => {
        setSimError(null);

        if (!selectedGradeValue.value) {
            setSimError("상자를 먼저 선택해주세요.");
            return;
        }

        const count = Math.min(10, Math.max(1, simCount || 1));
        const candidates = availableItems;
        const totalChance = candidates.reduce((sum, item) => sum + item.chance, 0);

        if (candidates.length === 0 || totalChance <= 0) {
            setSimError("선택된 아이템이 없어 시뮬레이션을 진행할 수 없어요.");
            return;
        }

        const picks: ProbabilityItem[] = [];

        for (let i = 0; i < count; i++) {
            const roll = Math.random() * totalChance;
            let acc = 0;
            let picked: ProbabilityItem | null = null;
            for (const item of candidates) {
                acc += item.chance;
                if (roll <= acc) {
                    picked = item;
                    break;
                }
            }
            picks.push(picked ?? candidates[candidates.length - 1]);
        }

        setSimResults(picks.slice(0, 10));
        setSimCount(count);
    }

    return (
        <Layout>
            <ContentLayout>
            <div style={{marginBottom: 0}}>
                <CategoryTitle title={`2025 눈싸움 확률 적용`}/>
            </div>
                <SimulationCard fullWidth>
                    <SimulationHeader>
                        <SimulationTitle>
                            <IconBadge aria-hidden="true">🎲</IconBadge>
                            뽑기 시뮬레이션
                        </SimulationTitle>
                        <Text color={'#A4A9C3'} fontSize={'0.95rem'}>
                            체크된 아이템은 시뮬레이션에서도 제외됩니다.
                        </Text>
                    </SimulationHeader>
                    <SimulationActions>
                        <Select
                            value={selectedGradeValue}
                            options={SELECT_GRADES}
                            onChange={selectChangeHandler}
                            width={'180px'}/>
                        <Input
                            type="number"
                            value={simCount}
                            onChange={(value) => setSimCount(() => {
                                const num = Number(value);
                                if (Number.isNaN(num)) return 1;
                                return Math.min(10, Math.max(1, num));
                            })}
                            placeholder="1~10"
                            width="120px"
                        />
                        <Button onClick={simulateDraw} padding={'12px 20px'}>
                            뽑기 돌리기
                        </Button>
                    </SimulationActions>
                    {simError && <Text color={'#FF6B6B'}>{simError}</Text>}
                    <ResultScroll>
                        <ResultList>
                            {simResults.length === 0 && (
                                <Text color={'#A4A9C3'}>아직 시뮬레이션 결과가 없습니다.</Text>
                            )}
                            {simResults.map((item, idx) => (
                                <ResultItem key={`${item.name}-${idx}`}>
                                    <ResultImage
                                        src={getItemImage(item.name)}
                                        alt={item.name}
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
                                        }}
                                    />
                                    <div>
                                        <ResultName>{idx + 1}. {item.name}</ResultName>
                                        <ResultChance>{item.chance.toFixed(3)}%</ResultChance>
                                    </div>
                                </ResultItem>
                            ))}
                        </ResultList>
                    </ResultScroll>
                </SimulationCard>
                <Container fullWidth align={'centerLeft'} gap={'20px'}>
                    <Select
                        value={selectedGradeValue}
                        options={SELECT_GRADES}
                        onChange={selectChangeHandler}
                        width={'160px'}/>

                    <Table fullWidth headers={['선택', '이미지', '아이템', '확률']}
                           columnWidths={['15%', '20%', '40%', '10%']} margin={'0 0 50px 0'} borderRadius={'8px'} maxHeight={'1200px'}>
                        <tbody>
                        <GachaTableStickyRow totalProbability={totalProbability}
                                             value={items.every(item => !item.equip || item.isChecked)}
                                             onChecked={checkedAllItemsHandler}/>
                        {items.map((item, index) => (
                            <GachaTableRow key={index} value={item.isChecked} index={index} item={item} onChecked={checkedItemsHandler}/>
                        ))}
                        </tbody>
                    </Table>
                </Container>
            </ContentLayout>
        </Layout>
    );
}

export default Gacha;
