import Container from "./base/Container.jsx";
import styles from "./styles/ResultContainer.module.css";
import React from "react";

// position: left top right
function ResultContainer({children}) {
    return <Container className={styles.ResultContainer} alignLeft gap={20}>
        {children}
    </Container>
}

export default ResultContainer