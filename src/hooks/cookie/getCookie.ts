const getCookie = <T = string>(name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        const value = (parts.pop() ?? '').split(";").shift()
        return value ? JSON.parse(value) as T : null
    }
    return null;
};

export default getCookie