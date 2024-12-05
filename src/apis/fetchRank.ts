import fetchAPI from "./base/fetchAPI";
import RankUser from "../constant/RankUser";

const fetchRank = (completion: (rankUsers: RankUser[]) => void) => {
    fetchAPI<RankUser[]>('datas')
        .then((results) => results
            .map<RankUser>(({rank, ...rankUser}, index) => ({rank: index + 1, ...rankUser}))
        )
        .then(completion)
};

export default fetchRank