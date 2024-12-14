const setCookie = <T extends object> (name: string, value: T, days: number) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    console.log(value.toString())
    document.cookie = `${name}=${value.toString()}; expires=${date.toUTCString()}; path=/`;
};

export default setCookie