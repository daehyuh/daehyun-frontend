import React, { useEffect } from "react";
import styles from "../styles/Mail.module.css";

function Mail() {
  const priceTable = [
    { luna: 42, price: 999, price2:1100 },
    { luna: 142, price: 2990, price2:3300 },
    { luna: 420, price: 7900, price2:8500 },
    { luna: 1420, price: 24900, price2:27000 },
    { luna: 4242, price: 69000, price2:75000 },
  ];

  // 상태 변수들
  const [price, setPrice] = React.useState(42); // 현재 루나
  const [price2, setPrice2] = React.useState(1002); // 목표 루나
  const [ruble, setRuble] = React.useState(0); // 루블
  const [hermes, setHermes] = React.useState(0); // 보유 헤르메스
  const [nowExchange, setNowExchange] = React.useState(1100); // 환율
  const [totalCost, setTotalPrice] = React.useState(0); // 총 가격
  const [packageCounts, setPackageCounts] = React.useState([]); // 패키지 갯수

  // 아이폰으로 들어왔는지 안드로이드로 들어왔는지 구분
  const userAgent = navigator.userAgent.toLowerCase();

// 간단한 그리디 방식으로 구현된 가격 계산 함수
const calculatePrice = () => {
  let requiredLuna = Math.ceil((ruble * nowExchange / 1000000)*1.35); // 필요한 루나 계산 (올림 처리)
  let totalCost = 0;
  let counts = [];
  
  if (userAgent.includes("iphone") || userAgent.includes("ipad") || userAgent.includes("ipod")) {
    for (let i = priceTable.length - 1; i >= 0; i--) {
      const { luna, price, price2 } = priceTable[i];
      const numBundles = Math.floor(requiredLuna / luna); // 현재 패키지로 구매할 수 있는 갯수
  
      if (numBundles > 0) {
        totalCost += numBundles * price2; // 총 가격 계산
        requiredLuna -= numBundles * luna; // 남은 루나 갱신
  
        counts.push({
          luna,
          count: numBundles,
          totalPrice: numBundles * price2,
        });
      }
    }
  
    if (requiredLuna > 0) {
      const { luna, price2 } = priceTable[0]; // 최저 패키지 사용
      totalCost += price2;
      counts.push({
        luna,
        count: 1,
        totalPrice: price2,
      });
    }
    
} else {
  for (let i = priceTable.length - 1; i >= 0; i--) {
    const { luna, price, price2 } = priceTable[i];
    const numBundles = Math.floor(requiredLuna / luna); // 현재 패키지로 구매할 수 있는 갯수

    if (numBundles > 0) {
      totalCost += numBundles * price; // 총 가격 계산
      requiredLuna -= numBundles * luna; // 남은 루나 갱신

      counts.push({
        luna,
        count: numBundles,
        totalPrice: numBundles * price,
      });
    }
  }

  if (requiredLuna > 0) {
    const { luna, price } = priceTable[0]; // 최저 패키지 사용
    totalCost += price;
    counts.push({
      luna,
      count: 1,
      totalPrice: price,
    });
  }
}

  setPackageCounts(counts);
  setTotalPrice(totalCost);
};


  // onClick 이벤트 핸들러
  const onClick = () => {
    const calculatedRuble = 50 * (Number(price2)-hermes*10 - Number(price)) * (Number(price) + Number(price2)-hermes*10 - 74); // 루블 계산    
    setRuble(calculatedRuble); // 루블 업데이트
  };

  // 루블이 업데이트될 때마다 가격 계산
  useEffect(() => {
    if (ruble > 0) {
      calculatePrice(); // 루블이 업데이트되면 가격 계산
    }
  }, [ruble, nowExchange]); // ruble과 nowExchange 값이 변경될 때마다 calculatePrice 호출


  // 옵션 목록 생성
  const options = [];
  for (let i = 42; i <= 10002; i += 10) {
    options.push(i);
  }

  return (
    <div className={styles.container}>
      <p className={styles.title}>우체통 계산기</p>

      <div className={styles.inputflex}>
        <p>현재 우체통</p>
        <select
          onChange={(e) => setPrice(e.target.value)}
          className={styles.selectbox}
          id="mail1"
        >
          {options.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      
      <div className={styles.inputflex}>
        <p>목표 우체통</p>
        <select
          onChange={(e) => setPrice2(e.target.value)}
          className={styles.selectbox}
          id="mail2"
          defaultValue="1002"
        >
          {options.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      
      <div className={styles.inputflex}>
        <p>보유 헤르메스(선택)</p>
        <input
          type="text"
          className={styles.input}
          value={hermes}
          onChange={(e) => setHermes(e.target.value)}
        ></input>
      </div>

      <div className={styles.inputflex}>
        <p>현재환율(선택)</p>
        <input
          type="text"
          className={styles.input}
          value={nowExchange}
          onChange={(e) => setNowExchange(e.target.value)}
        ></input>
      </div>

      <div className={styles.inputflex}>
        <button className={styles.button} onClick={onClick}>
          계산 하기
        </button>
      </div>

      <div className={styles.result}>
        <div className={styles.resultarea}>
          <div className={styles.flex}>
            <div>
              <p>필요 루블</p>
            </div>
            <div>
              <p>{ruble / 10000}만 루블<br/>({ruble} 루블)</p>
            </div>
          </div>

          <div className={styles.flex}>
            <div>
              <p>필요 루나</p>
            </div>
            <div>
              <p>{Math.floor((ruble * nowExchange / 1000000)*1.35)} 루나<br/>(수수료 포함 환율)</p>
            </div>
          </div>

          <div className={styles.flex}>
            <div>
              <p>필요 현금</p>
            </div>
            <div>
              <p>총 {totalCost} 원</p>
            </div>
          </div>
          
          {/* 각 패키지 갯수 출력 */}
          <div className={styles.flex}>
            <div>
              <p>구매할 패키지</p>
            </div>
            <div>
              {packageCounts.map((item, index) => (
                <p key={index}>
                  {item.luna} 루나 패키지 {item.count}개 <br/> ({item.totalPrice} 원)
                </p>
              ))}
            </div>
          </div>
        </div>
        <div>
          <h3>※안드로이드와 아이폰의 루나 가격이 다릅니다※</h3>
        </div>
      </div>
    </div>
  );
}

export default Mail;