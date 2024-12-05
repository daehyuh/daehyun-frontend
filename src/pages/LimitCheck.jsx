import React, {useEffect} from "react";
import styles from "./styles/LimitCheck.module.css";
import fetchTime from "../apis/fetchTime";
import fetchUserGameData from "../apis/fetchUserGameData";

function LimitCheck() {
    const [nickname, setNickname] = React.useState("");

    // api 조회
    const [time, setTime] = React.useState("");
    const [game, setGame] = React.useState(null);

    useEffect(() => {
        // api 조회
        fetchTime((time) => {
            setTime(time.gametime)
        })
    }, []);

    const [notFound, setNotFound] = React.useState(false);

    const getGame = () => {
        fetchUserGameData(nickname, (data) => {
            setNotFound(data.today_games === null);
            setGame(data.today_games);
        })
    }

    return (
        <>
            <div className={styles.container}>
                <p className={styles.title}>획초 체크</p>
                <div>
                    <h2>최후의 반론서 댓글을 달면, 랭킹에 자동으로 추가됩니다.</h2>
                    <h3>최근 갱신일 {time}</h3>
                    <div className={styles.lastAtag}>
                        <a style={{color: "red"}}
                           href="https://mafia42.com/#/community/lastDiscussion/lastShow/1007550">최후의 반론 링크</a>
                    </div>
                    {/* <img
                            src={`../image/comment.PNG`}
                            alt="comment"
                            style={{ width: "100%", height: "auto", margin: "0 0 10px 0" }}
                    /> */}
                </div>

                <div style={{margin: "10px 0 20px 0"}} className={styles.inputflex}>
                    <input step={{width: "20%"}} type="textbox" placeholder="닉네임" className={styles.input}
                           value={nickname} onChange={(e) => setNickname(e.target.value)}/>
                    <input type="button" value="검색"
                           onClick={getGame}
                    />

                </div>

                <div className={styles.result}>
                    <div className={styles.resultarea}>
                        {notFound ? <p>유저를 찾을 수 없습니다.</p> :
                            <>
                                <div className={styles.inputflex}>
                                    <p>오늘 플레이한 게임</p>
                                    <p>{game}판</p>
                                </div>

                                <div className={styles.inputflex}>
                                    <p>획초여부</p>
                                    <p>{game >= 31 ? "획초" : "미획초"}</p>
                                </div>
                            </>

                        }
                        <p>랭크게임 구분은 되어있지 않습니다.</p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default LimitCheck;
