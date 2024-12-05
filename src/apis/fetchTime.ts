import fetchAPI from "./base/fetchAPI";
import Time from "../constant/Time";

const fetchTime = (completion: (time: Time) => void) => {
    fetchAPI<Time>('time')
        .then(completion)
}

export default fetchTime