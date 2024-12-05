import styles from "./styles/Button.module.css"

const Button = ({title}) => {
    return <div className={styles.Button}>{title}</div>
}

export default Button