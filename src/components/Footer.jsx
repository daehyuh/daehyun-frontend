import styles from "./styles/Footer.module.css";
import Layout from "./base/Layout.jsx";

function Footer() {
    return (
        <div className={styles.foot}>
            <div>
                <p>대현닷컴<br/>© 2021</p>
                <p>쓰리이디엇츠 · 대표 강대현</p>
                <p>사업자 등록번호 868-18-02199</p>
                <p>contact@collecti.me · 010-7712-2413</p>
            </div>
            <div>
                <a href="privacy.html">이용약관</a> <br></br>
                <a href="terms.html">개인정보 처리방침</a>
            </div>
        </div>
    );
}

export default Footer;