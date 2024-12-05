import styles from './styles/ContentBox.module.css'
function ContentBox({children, gap}) {
    return (
        <div className={styles.ContentBox} style={{gap: `${gap}px`}}>
            {children}
        < /div>
    );
}

export default ContentBox;