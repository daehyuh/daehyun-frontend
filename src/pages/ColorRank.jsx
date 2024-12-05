import React, {useState, useEffect} from "react";
import styles from "./styles/ColorRank.module.css";
import fetchRank from "../apis/fetchRank";
import fetchTime from "../apis/fetchTime";

function ColorRank() {
    // Loading 상태 변수 추가
    const [loading, setLoading] = useState(true);

    // 데이터를 저장할 상태 변수
    const [items, setItems] = useState([]);
    const [searchItems, setSearchItems] = useState('');

    const [time, setTime] = useState('');

    // 이스터에그 리스트 추가
    let easterEgg = {
        "주히": "f7cbcb",
        "대현": "FF0000"
    }

    // API 호출을 통해 데이터를 가져오는 함수
    const fetchData = async () => {
        fetchTime((time) => {
            setTime(time.colortime)
        })
        fetchRank((rankUsers) => {
            setItems(rankUsers)
            setLoading(false);
        })
    };

    // 컴포넌트가 처음 렌더링될 때 데이터를 불러오는 effect
    useEffect(() => {
        fetchData();
    }, []);

    // 검색어 입력 change 이벤트 핸들러
    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchItems(value);
    };

    // 검색어에 맞는 항목만 필터링
    const filteredItems = items.filter(item =>
        item.nickname.toLowerCase().includes(searchItems.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>검닉 랭킹</h1>
            <div>
                <h2>최후의 반론에서 댓글을 달면, 랭킹에 자동으로 추가됩니다.</h2>
                <h3>최근 갱신일 {time}</h3>
                <div className={styles.lastAtag}>
                    <a style={{color: "red"}} href="https://mafia42.com/#/community/lastDiscussion/lastShow/1007550">최후의
                        반론 링크</a>
                </div>
                {/* <img
                            src={`../image/comment.PNG`}
                            alt="comment"
                            style={{ width: "100%", height: "auto", margin: "0 0 10px 0" }}
                    /> */}
            </div>
            <div className={styles.inputflex}>
                <input
                    type="text"
                    placeholder="유저 검색"
                    className={styles.input}
                    value={searchItems}
                    onChange={handleInputChange}
                />
            </div>

            {/* 로딩 상태에 따른 표시 */}
            {loading ? (
                <div className={styles.loadingSpinner}>
                    <div className={styles.spinner}></div>
                </div>
            ) : (
                <div className={styles.ColorRankContainer}>
                    <table className={styles.ColorRank}>
                        <thead>
                        <tr>
                            <th>랭킹</th>
                            <th>이름</th>
                            <th>색상(Hex)</th>
                            <th>점수</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredItems.map((item, index) => (
                            <tr key={index + 1} data-name={item.nickname}>
                                {/* 주히 데이터일때 색변경 */}

                                <td style={easterEgg[item.nickname] ? {backgroundColor: `#${easterEgg[item.nickname]}`} : null}>{item.rank}위</td>


                                <td>{item.nickname}</td>
                                <td className={styles.inputflex}>
                                    <div
                                        className={styles.colorblock}
                                        style={{backgroundColor: `#${item.color}`}}
                                    ></div>
                                    {item.color}
                                </td>
                                <td>{item.closeness}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ColorRank;
