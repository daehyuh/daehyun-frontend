import fetchAPI from "./base/fetchAPI";
import RankUser from "../constant/RankUser";
import type {RankApiResult} from "@/constant/PaginatedResponse";

type FetchRankParams = {
    page?: number
    size?: number
    query?: string
}

const fetchRank = async ({page = 0, size = 50, query = ""}: FetchRankParams = {}) => {
    const params = new URLSearchParams({
        page: String(page),
        size: String(size)
    });

    if (query.trim().length > 0) {
        params.set("nickname", query.trim());
    }

    return fetchAPI<RankApiResult<RankUser>>(`rank/black?${params.toString()}`);
};

export default fetchRank
