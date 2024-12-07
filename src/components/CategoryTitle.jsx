import styles from './styles/CategoryTitle.module.css'
import Container from "./base/Container.tsx";

function CategoryTitle({title}) {
    return (
        <h1 className={styles.CategoryTitle}>{title}</h1>
    );

}

export default CategoryTitle;