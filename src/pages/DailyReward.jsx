import React from "react";
import styles from "./styles/DailyReward.module.css";

function DailyReward() {
    const [amount, setAmount] = React.useState(0);
    const [guildLevel, setGuildLevel] = React.useState(0);
    const [buffLevel, setBuffLevel] = React.useState(0);
    const [fame, setFame] = React.useState(false);

    const guildval = [0, 1, 2, 3, 4, 5, 6];
    const buffval = [0, 2.5, 5, 7.5, 10, 12.5, 15];

    // Handle fame input
    const handleAmountChange = (e) => {
        const value = parseFloat(e.target.value) || 0;
        setAmount(value * 100);
    };

    // Handle guild level change
    const handleGuildLevelChange = (e) => {
        setGuildLevel(parseInt(e.target.value));
    };

    // Handle buff level change
    const handleBuffLevelChange = (e) => {
        setBuffLevel(parseInt(e.target.value));
    };

    // Handle fame checkbox toggle
    const handleFameChange = (e) => {
        setFame(e.target.checked);
    };

    return (
        <div className={styles.container}>
            <p className={styles.title}>출석보상 계산기</p>
            <div className={styles.inputflex}>
                <p>명성</p>
                <input
                    type="text"
                    placeholder="명성"
                    className={styles.input}
                    onChange={handleAmountChange}
                />
            </div>

                <div>
                    <div className={styles.inputflex}>
                        <p>나의 길드 등급</p>
                        <select
                            className={styles.select}
                            value={guildLevel}
                            onChange={handleGuildLevelChange}
                        >
                            <option value="0">길드 없음</option>
                            <option value="1">우드</option>
                            <option value="2">브론즈</option>
                            <option value="3">실버</option>
                            <option value="4">골드</option>
                            <option value="5">플레티넘</option>
                            <option value="6">마스터</option>
                        </select>
                    </div>

                    <div className={styles.inputflex}>
               </div>
                    <div className={styles.inputflex}>
                        <p>동상 버프 레벨</p>
                        <select
                            className={styles.select}
                            value={buffLevel}
                            onChange={handleBuffLevelChange}
                        >
                            <option value="0">동상 없음</option>
                            <option value="1">1단계</option>
                            <option value="2">2단계</option>
                            <option value="3">3단계</option>
                            <option value="4">4단계</option>
                            <option value="5">5단계</option>
                            <option value="6">6단계</option>
                        </select>
                    </div>
                    <div className={styles.inputflex}>
                        <p>유명세</p>
                        <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={fame}
                            onChange={handleFameChange}
                        />
                    </div>
                </div>
                <div className={styles.inputflex}>
                        <div style={{ display: guildLevel === 0 ? "none" : "block" }}>
                        {/* Guild Image */}
                        <p>길드 등급</p>
                        <img
                        src={`../image/Guild/${guildLevel}.png`}
                        alt="Guild Level"
                        width={100}
                        className={styles.image}
                        />
                        </div>
                    <div style={{ display: buffLevel === 0 ? "none" : "block" }}>
                   {/* Buff Image */}
                   <p>동상 버프 레벨</p>
                   <img
                       src={`../image/statue/${buffLevel}.png`}
                       alt="Statue Buff"
                       width={100}
                       className={styles.image}
                   />
                   </div>
                </div>
            
            <div className={styles.result}>
            <div className={styles.resultarea}>
                <p>
                    {fame
                        ? Math.floor(amount +
                          (amount * (guildval[guildLevel] + buffval[buffLevel]) / 100) +
                          (amount * 3) / 100)
                        : Math.floor(
                              amount + (amount * (guildval[guildLevel] + buffval[buffLevel]) / 100)
                          )} 루블
                </p>

                <p>{Math.floor(amount / 4200)} 루나</p>
                
                </div>
            </div>
        </div>
    );
}

export default DailyReward;