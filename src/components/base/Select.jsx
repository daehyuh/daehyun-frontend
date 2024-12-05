import React, {useRef} from "react";
import styles from "./styles/Select.module.css";
import Container from "./Container.jsx";

// options: [{value: string, title: string}]
function Select({options, onChange, className}) {
    const selectRef = useRef(null);

    const onClick = () => {
        // console.log( selectRef.current.onClick)
    }

    return (
        <Container direction={"row"} gap={10} className={styles.SelectContainer + " " + (className ? className : '')}
                   onClick={onClick}>
            <select
                ref={selectRef}
                className={styles.Select}
                onChange={(e) => {
                    onChange?.(e.target.value)
                }}
            >
                {options.map((option, index) => (<option key={index} value={option.value}>{option.title}</option>))}
            </select>
        </Container>
    );
}

export default Select