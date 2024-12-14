import fetchAPI from "./base/fetchAPI";
import Ad from "../constant/Ad";
const fetchAds = async () => {
    return ['ad1', 'ad2'].allSettled<Ad>(fetchAPI)
}

export default fetchAds
