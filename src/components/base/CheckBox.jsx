import React, {useState} from "react";
import styles from "./styles/CheckBox.module.css";
import Container from "./Container.jsx";
import Check from "../../assets/icons/check.svg?react"

function CheckBox({id, title, value, onChecked}) {
    const [isChecked, setIsChecked] = useState(value ?? false)
    return (<label htmlFor={id}
                   className={styles.CheckBox + " " + (isChecked ? styles.CheckedCheckBox : styles.DefaultCheckBox)}>
        <input
            id={id}
            type="checkbox"
            value={value}
            onChange={(e) => {
                setIsChecked(e.target.checked)
                onChecked?.(e.target.checked)
            }}
            className={styles.CheckBoxInput}
        />
        <Check className={styles.CheckBoxIcon}/>
    </label>)
}

export default CheckBox