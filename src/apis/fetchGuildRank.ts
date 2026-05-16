import fetchAPI from "./base/fetchAPI";
import type {RankGuild} from "@/constant/RankGuild";
import type {RankApiResult} from "@/constant/PaginatedResponse";

type FetchGuildRankParams = {
    page?: number
    size?: number
    query?: string
}

const fetchGuildRank = async ({page = 0, size = 50, query = ""}: FetchGuildRankParams = {}) => {
    const params = new URLSearchParams({
        page: String(page),
        size: String(size)
    });

    if (query.trim().length > 0) {
        params.set("keyword", query.trim());
    }

    return fetchAPI<RankApiResult<RankGuild>>(`rank/guild?${params.toString()}`);
};

export default fetchGuildRank
