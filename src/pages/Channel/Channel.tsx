import React, {useState, useEffect} from "react";
import {CategoryTitle, Container, ContentLayout, Layout} from "@/components";
import fetchChannelData from "@apis/fetchChannelData";
import ChannelType from "@/constant/ChannelType";
import ChannelList from "@/pages/Channel/components/ChannelList";

function Channel() {
    const [channels, setChannels] = useState<ChannelType[]>([]);

    // FastAPI에서 데이터 가져오기
    const fetchChannels = async () => {
        await fetchChannelData()
            .completion({
                success: result => {
                    setChannels(result.channels);
                }
            })
    };

    // 컴포넌트가 마운트될 때 및 10초마다 호출
    useEffect(() => {
        fetchChannels(); // 처음 호출
        const interval = setInterval(fetchChannels, 10000); // 10초 간격
        return () => clearInterval(interval); // 언마운트 시 정리
    }, []);

    return (
        <Layout>
            <ContentLayout>
                <CategoryTitle title={"채널동접 체크"}/>
                <Container fullWidth backgroundColor={"#3A3A3C"} padding={'8px'} borderRadius={'10px'}>
                    <ul style={{width: '100%', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                        {channels.map((channel, index) => (
                            index !== (channels.length - 1) ? <ChannelList key={index} channel={channel}/> :
                                <ChannelList key={index} channel={channel} fixedColor={'#0763D3'}/>
                        ))}
                    </ul>
                </Container>
            </ContentLayout>
        </Layout>
    );
}

export default Channel;
