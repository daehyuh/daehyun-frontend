import fetchAPI from "./base/fetchAPI";
import EasterEgg from "@/constant/EasterEgg";

const fetchEasterEgg = async () => {
    return fetchAPI<EasterEgg>('easteregg')
};

export default fetchEasterEgg