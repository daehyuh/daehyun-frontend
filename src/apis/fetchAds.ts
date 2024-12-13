import fetchAPI from "./base/fetchAPI";
import Ad from "../constant/Ad";
import {Completion, PromiseError} from "@extensions/types";

const fetchAds = async (completion: Completion<Ad[], PromiseError[]>) => {
    await ['ad1', 'ad2'].allSettled<Ad>(fetchAPI)
        .completionSettledResult(completion, null, false)
}

export default fetchAds
