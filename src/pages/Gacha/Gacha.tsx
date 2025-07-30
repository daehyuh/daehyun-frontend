import React, {useState, useEffect} from "react";
import {ContentLayout, Layout, Select, SelectOptionType} from "../../components/index";
import {getCookie, setCookie} from "@/hooks/cookie";
import {CategoryTitle, Container} from "@/components";

import frogProbabillty from "@/assets/probabilities/school2025Probability";

import GradeProbability from "@/constant/GradeProbability";
import ProbabilityItem from "@/constant/ProbabilityItem";
import Table from "@components/base/Table";
import GachaTableRow from "@/pages/Gacha/components/GachaTableRow";
import GachaTableStickyRow from "@/pages/Gacha/components/GachaTableStickyRow";

type GachaSelectOptionType = SelectOptionType<keyof GradeProbability | null>;

export type GachaProbabilityItem = {
    isChecked: boolean,
    originalChance: number
} & ProbabilityItem

export type TotalProbability = {
    equip: number
}

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
        const items2 = (grade ? frogProbabillty[grade].items : []).map((item, index) => ({
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

    return (
        <Layout>
            <ContentLayout>
            <CategoryTitle title={`2025 학교대항전 업데이트 완료`}/>
                <CategoryTitle title={`장착템 확률 : ${totalProbability.equip.toFixed(4)}%`}/>
                <Container fullWidth align={'centerLeft'} gap={'20px'}>
                    <Select
                        value={selectedGradeValue}
                        options={SELECT_GRADES}
                        onChange={selectChangeHandler}/>

                    <Table fullWidth headers={['선택', '이미지', '아이템', '확률']}
                           columnWidths={['15%', '20%', '40%', '10%']} margin={'0 0 50px 0'} borderRadius={'8px'}>
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