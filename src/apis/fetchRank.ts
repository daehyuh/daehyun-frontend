import fetchAPI from "./base/fetchAPI";
import RankUser from "../constant/RankUser";

const fetchRank = async () => {
    return fetchAPI<RankUser[]>('rank/black')
        .thenUpdateIndex('rank', 1)
};

export default fetchRank