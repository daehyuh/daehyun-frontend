import React, { useState, useEffect } from "react";
import styles from "./styles/Ads.module.css";

function Ads() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentIndex2, setCurrentIndex2] = useState(0);

    const [ads, setAds] = useState([]);
    const [ads2, setAds2] = useState([]);

    // api 가져와서 ads에 저장
    useEffect(() => {
        fetch("https://hufsnc.com/api/ad1")
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setAds(data.ad);
            });
            
            fetch("https://hufsnc.com/api/ad2")
            .then((res) => res.json())
            .then((data) => {
                setAds2(data.ad);
            });
    }, []);


 

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, 3000); // 3초마다 첫 번째 광고 변경
    return () => clearInterval(interval);
  }, [ads.length]);

  useEffect(() => {
    const interval2 = setInterval(() => {
      setCurrentIndex2((prevIndex) => (prevIndex + 1) % ads2.length);
    }, 5000); // 5초마다 두 번째 광고 변경
    return () => clearInterval(interval2);
  }, [ads2.length]);

  return (
    <>
      <div className={styles.adContainer}>
        <div className={styles.ad}>{
                <img
                            src={`../ad/${ads[currentIndex]}`}
                            alt="광고"
                            style={{ width: "100%", height: "auto", display: "flex", 
                            justifyContent: "center", 
                            alignItems: "center", }}
                    />
          }</div>
      </div>
      {/* <div className={styles.adContainer}>
        <div className={styles.ad}>{ads2[currentIndex2]}</div>
      </div> */}
        <a className={styles.alink} href="https://open.kakao.com/o/sWIax8Vc">대현닷컴 홍보문의 링크</a>

    </>
  );
}

export default Ads;
