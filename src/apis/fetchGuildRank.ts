import fetchAPI from "./base/fetchAPI";

const fetchGuildRank = async () => {
    return fetchAPI<RankGuild[]>('rank/guild')
        .thenUpdateIndex('rank', 1)
};

export default fetchGuildRank