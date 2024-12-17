import React from "react";
import styles from "../styles/BoardDetail.module.css";
import { useParams, useNavigate } from "react-router-dom";

function BoardDetail() {
    const { id } = useParams(); // URL에서 id를 가져옴
    const navigate = useNavigate();

    console.log(id); // URL에서 가져온 id 값 출력

     // 더미 데이터 (상세 데이터)
     const posts = {
        1: { title: "마피아42 세계관 및 인물관계 분석(마피아팀) [7]", content: "마피아42는 독특한 세계관을 가진 게임입니다...", author: "휴민티", date: "2024.11.16.", views: 570, likes: 39 },
        2: { title: "추측)배신의 섬 간호사는 정사 이야기인가? [23]", content: "배신의 섬 간호사 이야기에 대해...", author: "휴민티", date: "2024.11.18.", views: 336, likes: 22 },
        3: { title: "현 배심 4위가 쓰는 공략글 (배심 쓰기 좋은 캐릭터) [21]", content: "배심 캐릭터 공략에 대해 작성해보았습니다...", author: "히히히히히히", date: "2024.11.19.", views: 502, likes: 20 },
    };
    
    const post = posts[id]; // 해당 ID에 맞는 게시글 데이터 가져오기
    if (!post) {
        return <div>게시글을 찾을 수 없습니다.</div>;
    }

 return (
        <div className={styles.container}>
            <button onClick={() => navigate(-1)} className={styles.backButton}>← 뒤로가기</button>
            <h2>{post.title}</h2>
            <div className={styles.info}>
                <p><strong>작성자:</strong> {post.author}</p>
                <p><strong>작성일:</strong> {post.date}</p>
                <p><strong>조회수:</strong> {post.views}</p>
                <p><strong>좋아요:</strong> {post.likes}</p>
            </div>
            <p className={styles.content}>{post.content}</p>
        </div>
    );
}

export default BoardDetail;