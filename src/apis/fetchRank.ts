import fetchAPI from "./base/fetchAPI";
import RankUser from "../constant/RankUser";

const fetchRank = async () => {
    return fetchAPI<RankUser[]>('datas')
};

export default fetchRank