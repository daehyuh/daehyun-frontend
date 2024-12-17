import fetchAPI from "./base/fetchAPI";
import ChannelData from "@/constant/ChannelData";

const fetchChannelData = async () => {
    return fetchAPI<ChannelData>('getChannel')
};

export default fetchChannelData