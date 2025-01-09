import fetchAPI from "./base/fetchAPI";

const fetchGuildRank = async () => {
    return fetchAPI<RankGuild[]>('datas2')
        .thenUpdateIndex('rank', 1)
};

export default fetchGuildRank