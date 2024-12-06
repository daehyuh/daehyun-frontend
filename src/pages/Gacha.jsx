import React, { useState, useEffect } from "react";
import styles from "./styles/Gacha.module.css";

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
};

const setCookie = (name, value, days) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
};

function Gacha() {
    const [selectedGrade, setSelectedGrade] = useState("no");
    const [items, setItems] = useState([]);
    const [originalChances, setOriginalChances] = useState([]);
    const [checkedItems, setCheckedItems] = useState(new Set());
    const [totalEquipProbability, setTotalEquipProbability] = useState(0); // equip 확률 합계를 위한 상태 추가


    const fetchData = async (grade) => {
        try {
            const response = await fetch(`/확률/2024눈싸움/${grade}.json`);
            const data = await response.json();
            setItems(data.items || []);
            setOriginalChances(data.items.map((item) => item.chance));
        } catch (error) {
            console.error("데이터를 불러오는 데 실패했습니다:", error);
        }
    };

    useEffect(() => {
        fetchData(selectedGrade);
    }, [selectedGrade]);

    
    useEffect(() => {
        if (items.length === 0) return;
    

        const checkedProbabilitySum = Array.from(checkedItems).reduce(
            (acc, index) => acc + (originalChances[index] || 0),
            0
        );
        
        const uncheckedProbabilitySum = originalChances.reduce((acc, chance, index) => {
            if (!checkedItems.has(index)) {
                return acc + chance;
            }
            return acc;
        }, 0);
    
        const updatedItems = items.map((item, index) => {
            if (checkedItems.has(index)) {
                return { ...item, chance: 0 };
            } else {
                const originalChance = originalChances[index] || 0;
                const redistributedChance =
                    uncheckedProbabilitySum > 0
                        ? (originalChance / uncheckedProbabilitySum) * checkedProbabilitySum
                        : 0;
                        console.log(redistributedChance);
    
                return { ...item, chance: originalChance + redistributedChance };
            }
        });


    
        setItems(updatedItems);
    }, [checkedItems, items.length, originalChances]);

    useEffect(() => {
        const savedGrade = getCookie("selectedGrade");
        const savedCheckedItems = getCookie("checkedItems");

        if (savedGrade) setSelectedGrade(savedGrade);
        if (savedCheckedItems) {
            const savedCheckedItemsSet = new Set(savedCheckedItems.split(",").map(Number));
            setCheckedItems(savedCheckedItemsSet);
        }
    }, []);

    const handleGradeChange = (e) => {
        const newGrade = e.target.value;
        setSelectedGrade(newGrade);
        setCookie("selectedGrade", newGrade, 7);
    };

    const handleCheckboxChange = (e, index) => {
        const newCheckedItems = new Set(checkedItems);

        if (e.target.checked) newCheckedItems.add(index);
        else newCheckedItems.delete(index);

        setCheckedItems(newCheckedItems);
        setCookie("checkedItems", Array.from(newCheckedItems).join(","), 7);
    };


    useEffect(() => {
        const equipItems = items.filter(item => item.equip === true); // equip이 true인 아이템 필터링
        
        // tbody 체크박스가 있는 요소의 확률을 더해서 확률 합계를 계산
        const equipProbabilitySum = equipItems.reduce((acc, item) => {
            if (checkedItems.has(items.indexOf(item))) {
                return acc + 0; // 체크된 아이템은 확률을 0으로 설정
            } else {
                return acc + item.chance; // 체크되지 않은 아이템은 확률을 더함
            }
        }, 0);

        setTotalEquipProbability(equipProbabilitySum); // 확률 합계를 상태에 저장

        
    }, [checkedItems, items]);

    return (
        <div className={styles.container}>
            <h1>장착템 확률 : {totalEquipProbability.toFixed(4)}% </h1>

            <select
                className={styles.selectbox}
                value={selectedGrade}
                onChange={handleGradeChange}
            >
                <option value="no">선택해주세요</option>
                <option value="2500R">2500루블</option>
                <option value="150">150루나</option>
                <option value="750">750루나</option>
                <option value="Legend">패키지상자</option>
            </select>

            <div className={styles.gachaContainer}>
                <table className={styles.gacha}>
                    <thead>
                        <tr>
                            <th>선택</th>
                            <th>이미지</th>
                            <th>아이템</th>
                            <th>확률</th>
                        </tr>
                    </thead>
                    <tbody>
                    <tr className={styles.stickyRow}>
                <td>
                    <input
                        type="checkbox"
                        checked={checkedItems.size === items.filter(item => item.equip).length}
                        onChange={(e) => {
                            const newCheckedItems = new Set(checkedItems);
                            if (e.target.checked) {
                                items.forEach((item, index) => {
                                    if (item.equip) newCheckedItems.add(index);
                                });
                            } else {
                                items.forEach((item, index) => {
                                    if (item.equip) newCheckedItems.delete(index);
                                });
                            }
                            setCheckedItems(newCheckedItems);
                            setCookie("checkedItems", Array.from(newCheckedItems).join(","), 7);
                            setCookie("allChecked", e.target.checked, 7);
                        }}
                    />
                </td>
                <td>
                    <strong>전체 체크 박스</strong>
                </td>
                <td colSpan="2">
                    장착템 확률: {totalEquipProbability.toFixed(4)}%
                </td>
            </tr>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td>
                                
                                {item.equip && (
                                        <input
                                            type="checkbox"
                                            name="gacha"
                                            checked={checkedItems.has(index)} // 인덱스 기반 체크 상태 설정
                                            onChange={(e) => handleCheckboxChange(e, index)} // 체크박스 변경 시 처리
                                        />
                                    )}

                                </td>
                                <td>
                                    <img
                                        width={50}
                                        src={`image/Items/${item.name}.webp`}
                                        alt={item.name}
                                    />
                                </td>
                                <td>{item.name}</td>
                                <td>{item.chance.toFixed(3)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Gacha;