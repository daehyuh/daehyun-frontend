const BASE_URL = "http://152.67.211.81:8000/api"
const generateUrl = (path: string) => `${BASE_URL}/${path}`

const fetchAPI = async <T>(path: string): Promise<T> => {
    const url = generateUrl(path)
    return await fetch(url)
        .then((res) => res.json())
}

export default fetchAPI;