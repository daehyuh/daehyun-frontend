import fetchAPI from "./base/fetchAPI";
import RankUser from "../constant/RankUser";

const fetchRank = async () => {
    return fetchAPI<RankUser[]>('datas')
        .thenUpdateIndex('rank', 1)
};

export default fetchRank