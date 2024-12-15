if (process.env.NODE_ENV === 'development') {
    const originalError = console.error;
    console.error = (...args) => {
        if (args[0] && args[0].includes('If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase')) {
            return;
        }
        originalError(...args);
    };

    const originalWarn = console.warn;
    console.warn = (...args) => {
        if (args[0] && args[0].includes('it looks like an unknown prop')) {
            return;
        }
        originalWarn(...args);
    };
}