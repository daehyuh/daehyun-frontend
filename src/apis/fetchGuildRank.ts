import fetchAPI from "./base/fetchAPI";
import type {RankGuild} from "@/constant/RankGuild";

const fetchGuildRank = async () => {
    return fetchAPI<RankGuild[]>('rank/guild')
        .thenUpdateIndex('rank', 1)
};

export default fetchGuildRank
