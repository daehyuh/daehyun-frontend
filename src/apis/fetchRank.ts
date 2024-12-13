import fetchAPI from "./base/fetchAPI";
import RankUser from "../constant/RankUser";
import {Completion, PromiseError} from "src/utils/extensions/types";

const fetchRank = (completion: Completion<RankUser[], PromiseError>) => {
    fetchAPI<RankUser[]>('datas')
        .then((results) => {
            return results
                .map<RankUser>(({rank, ...rankUser}, index) => ({rank: index + 1, ...rankUser}))
        } )
};

export default fetchRank