import fetchAPI from "./base/fetchAPI";
import Ad from "../constant/Ad";

const fetchNotification = async () => {
    return fetchAPI<Ad>('nofi')
}

export default fetchNotification
