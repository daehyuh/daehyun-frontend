import fetchAPI from "./base/fetchAPI";
import Time from "../constant/Time";

const fetchTime = async () => {
    return fetchAPI<Time>('time')
}

export default fetchTime