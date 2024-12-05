import styles from './styles/Input.module.css'
import React from "react";
import Container from "./Container.jsx";

function Input({title, value, placeholder, onChange, className}) {
    const [isFocused, setIsFocused] = React.useState(false)

    return <Container direction={'row'} gap={10}
                      className={styles.InputContainer
                          + (className ? ` ${className}` : '')
                          + (isFocused ? ` ${styles.FocusedInputContainer}` : '')}>
        <input type="text"
               className={styles.Input}
               placeholder={placeholder}
               value={value}
               onChange={(e) => {
                   onChange?.(e.target.value)
               }}
               onFocus={() => {
                   setIsFocused(true)
               }}
               onBlur={() => {
                   setIsFocused(false)
               }}
        />
    </Container>
}

export default Input