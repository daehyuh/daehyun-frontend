const setCookie = <T extends object | string | number>(name: string, value: T, days: number) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const jsonStringValue = JSON.stringify(value)
    document.cookie = `${name}=${jsonStringValue}; expires=${date.toUTCString()}; path=/`;
};

export default setCookie