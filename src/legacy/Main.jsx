import { Link } from "react-router-dom";
import styles from "./styles/Main.module.css";
import Logo from '../assets/images/Logo.svg?react'

function Main() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
          <Logo className={styles.logo}/>
      </div>
      
      <img className={styles.left} src="./image/LEFT.png" alt="LEFT"/>

      <div className={styles.text}>
        <div className={styles.Big}>대현닷컴</div>
        <div className={styles.Small}>마피아42를 쉽고 간단하게</div>
        
        <Link to="/상자깡">
        <button className={styles.button}>시작하기</button>
        </Link>
      </div>
      <img className={styles.right} src="./image/RIGHT.png" alt="Right"/>
    </div>
  );
}

export default Main;