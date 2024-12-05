import styles from './styles/Container.module.css'

function Container({children, direction, fullWidth, gap, className, alignTop, alignLeft, onClick}) {
    return <div
        className={`${styles.Container} ${direction === 'row' ? styles.DirectionRow : styles.DirectionColumn}` + (className ? ` ${className}` : '')}
        style={{
            gap: `${gap}px`, width: fullWidth ? '100%' : undefined,
            alignItems: (direction === 'row' && alignTop) || (direction !== 'row' && alignLeft) ? 'start' : 'center',
            justifyContent: (direction === 'row' && alignLeft) || (direction !== 'row' && alignTop) ? 'start' : 'center'
        }}
        onClick={onClick}
    >
        {children}
    </div>
}


export default Container