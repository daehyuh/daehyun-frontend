import Container from "./base/Container.jsx";
import styles from "./styles/TitleItem.module.css";
import React from "react";

// position: left top right
function TitleItem({title, titleClassName, titlePosition, children, alignTop}) {
    return <Container className={styles.TitleItem}
                      alignTop={alignTop}
                      direction={titlePosition === 'top' || titlePosition === 'bottom' ? 'column' : "row"} gap={10}>
        {titlePosition === 'bottom' || titlePosition === 'right'
            ? <>
                {children}
                <span className={titleClassName}>{title}</span>
            </> : <>
                <span className={titleClassName}>{title}</span>
                {children}
            </>}
    </Container>
}

export default TitleItem