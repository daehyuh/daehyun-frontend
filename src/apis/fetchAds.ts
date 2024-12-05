import fetchAPI from "./base/fetchAPI";
import Ad from "../constant/Ad";
import Ads from "../constant/Ads";

const fetchAds = (completion: (ad: Ads) => void) => {
    Promise.allSettled<Ad>([
        fetchAPI<Ad>('ad1'),
        fetchAPI<Ad>('ad2')
    ])
        .then((results) => results
            .map(result => result.status === 'fulfilled' ? result.value.ad : null)
            .filter((ad): ad is string[] => ad !== null)
        )
        .then((ads) => completion({urls: ads}))
}

export default fetchAds