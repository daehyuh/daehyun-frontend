const BASE_URL = "https://api.daehyun.dev/core"
const generateUrl = (path: string) => `${BASE_URL}/${path}`

const fetchAPI = async <T>(path: string): Promise<T> => {
    const url = generateUrl(path)
    return await fetch(url)
        .then((res) => res.json())
}

export default fetchAPI;