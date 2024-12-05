import {Link} from "react-router-dom";
import styles from "./styles/HeaderItemLink.module.css";
import React from "react";

function HeaderItemLink({path, href, title}) {
    return (<Link
        to={href}
        className={`${styles.headerItemLink} ${path === href ? styles.active : styles.inactive}`}>
        {title}
    </Link>)
}

export default HeaderItemLink