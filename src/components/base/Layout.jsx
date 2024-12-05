import styles from './styles/Layout.module.css'

function Layout({
                    children,
                    scrollable = true,
                    padding,
                    alignTop,
                    alignLeft
                }) {
    return <div className={`${styles.Layout} ${scrollable ? styles.ScrollableLayout : styles.DefaultLayout}`}
                style={{
                    padding: `${padding}px`,
                    alignItems: alignLeft ? 'start' : 'center',
                    justifyContent: alignTop ? 'start' : 'center'
                }}>
        {children}
    </div>
}

export default Layout