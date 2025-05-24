import fetchAPI from "./base/fetchAPI";
import Ad from "../constant/Ad";

const fetchAds = async () => {
    return fetchAPI<Ad>('ad')
}

export default fetchAds