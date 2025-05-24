import fetchAPI from "./base/fetchAPI";
import Ad from "../constant/Ad";

const fetchNotification = async () => {
    return fetchAPI<Ad>('ad')
}

export default fetchNotification
