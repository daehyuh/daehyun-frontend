import ChannelData from "@/constant/ChannelData";
import fetchAPI from "./base/fetchAPI";

const fetchChannelData = async () => {
    return fetchAPI<ChannelData>('getChannel')
};

export default fetchChannelData