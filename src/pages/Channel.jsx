import React, { useState, useEffect } from "react";
import styles from "./styles/Channel.module.css";

function Channel() {
    const [channels, setChannels] = useState([]);

    // FastAPI에서 데이터 가져오기
    const fetchChannelData = async () => {
        try {
            const response = await fetch("https://hufsnc.com/api/getChannel");
            const data = await response.json();
            setChannels(data.channels);
        } catch (error) {
            console.error("데이터를 가져오는 중 오류 발생:", error);
        }
    };

    // 컴포넌트가 마운트될 때 및 10초마다 호출
    useEffect(() => {
        fetchChannelData(); // 처음 호출
        const interval = setInterval(fetchChannelData, 10000); // 10초 간격
        return () => clearInterval(interval); // 언마운트 시 정리
    }, []);

    // 사용자 수에 따른 색상 클래스 반환
    const getUserCountClass = (userCount) => {
        if (userCount >= 2000) return styles.red;
        if (userCount >= 1000) return styles.yellow;
        return styles.green;
    };

    return (
        <div className={styles.container}>
            <p className={styles.title}>채널동접 체크</p>
            
            <div className={styles.result}>
                <div className={styles.resultarea}>
                    <ul className={styles.channelList}>
                        
                        {channels.map((channel, index) => (
                            <li key={index} className={styles.channelItem}>
                                <span className={styles.channelName}>{channel.channel_name}:</span>
                                <span className={`${styles.userCount} ${getUserCountClass(channel.user_count)}`}>
                                    {channel.user_count}명
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Channel;
