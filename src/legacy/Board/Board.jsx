import React from "react";
import styles from "../styles/Board.module.css";
import { useNavigate } from "react-router-dom";

function Board() {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>유저 게시판 (테스트중)</h1>


        <div className={styles.boardcontainer}>
        <table className={styles.boardtable}>
            <thead>
                <tr>
                    <th>글번호</th>
                    <th>제목</th>
                    <th>작성자</th>
                    <th>작성일</th>
                    <th>조회</th>
                    <th>좋아요</th>
                </tr>
            </thead>
            <tbody>
                <tr onClick={() => navigate(`/유저게시판/1`)}>
                    <td>1</td>
                    <td>마피아42 세계관 및 인물관계 분석(마피아팀) [7]</td>
                    <td>휴민티</td>
                    <td>2024.11.16.</td>
                    <td>570</td>
                    <td>39</td>
                </tr>
                <tr onClick={() => navigate(`/유저게시판/2`)}>
                    <td>2</td>
                    <td>추측배신의 섬 간호사는 정사 이야기인가? [23]</td>
                    <td>휴민티</td>
                    <td>2024.11.18.</td>
                    <td>336</td>
                    <td>22</td>
                </tr>
                <tr onClick={() => navigate(`/유저게시판/3`)}>
                    <td>3</td>
                    <td>현 배심 4위가 쓰는 공략글 (배심 쓰기 좋은 캐릭터) [21]</td>
                    <td>히히히히히히</td>
                    <td>2024.11.19.</td>
                    <td>502</td>
                    <td>20</td>
                </tr>
            </tbody>
        </table>
    </div>

    </div>
    )
}

export default Board;