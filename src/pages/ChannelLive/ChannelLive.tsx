import React, {useCallback, useEffect, useMemo, useState} from "react";
import {CategoryTitle, Container, ContentLayout, Layout, Text} from "@/components";
import ChannelList from "@/pages/Channel/components/ChannelList";
import ChannelType from "@/constant/ChannelType";

type RawChannel = {
    channel_id: string;
    user_count: number;
};

const CHANNEL_API_ENDPOINT = "/api/mafia-channels";

type ProxyResponse = {
    success: boolean;
    data: RawChannel[];
};

const CHANNEL_NAME_MAP: Record<string, string> = {
    "0": "초보채널",
    "1": "1채널",
    "2": "2채널",
    "3": "3채널",
    "19": "19세 채널",
    "20": "랭크채널",
    "42": "이벤트채널"
};

async function fetchLiveChannels(): Promise<ChannelType[]> {
    const response = await fetch(CHANNEL_API_ENDPOINT, {
        method: "GET",
        headers: {
            "Accept": "application/json"
        },
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Failed to fetch channel data");
    }

    const json: ProxyResponse = await response.json();

    if (!json.success || !Array.isArray(json.data)) {
        throw new Error("Invalid proxy response");
    }

    return json.data.map((channel) => ({
        channel_name: CHANNEL_NAME_MAP[channel.channel_id] ?? "알 수 없음",
        user_count: channel.user_count
    }));
}

function ChannelLive() {
    const [channels, setChannels] = useState<ChannelType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [updatedAt, setUpdatedAt] = useState<string>("");
        const totalUserCount = useMemo(
        () =>
            channels.reduce(
            (sum, channel) => sum + Number(channel.user_count ?? 0),
            0
            ),
        [channels]
        );
    const loadChannels = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await fetchLiveChannels();
            setChannels(data);
            setUpdatedAt(new Date().toLocaleTimeString());
            setError(null);
        } catch (err) {
            setError("동접자 정보를 불러오지 못했습니다.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadChannels();
        const interval = setInterval(loadChannels, 15000);
        return () => clearInterval(interval);
    }, [loadChannels]);

    return (
        <Layout align={'topLeft'}>
            <ContentLayout gap={'24px'}>
                <CategoryTitle title={"실시간 채널 동접"} description={'서버에서 직접 불러온 데이터를 15초마다 새로고침합니다.'}/>
                <Container variant={'surface'} gap={'12px'} fullWidth align={'centerLeft'}>
                    <Text fontSize={'1.1rem'} fontWeight={700}>
                        전체 유저 {totalUserCount.toLocaleString()} 명
                    </Text>
                    <Container flexDirection={'row'} gap={'12px'}>
                        <button
                            style={{
                                borderRadius: '999px',
                                padding: '8px 16px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'transparent',
                                color: 'inherit',
                                cursor: 'pointer'
                            }}
                            type="button"
                            onClick={loadChannels}
                            disabled={isLoading}
                        >
                            {isLoading ? '갱신 중...' : `마지막 ${updatedAt || '-'}`}
                        </button>
                    </Container>
                </Container>

                {error && (
                    <Container variant={'muted'}>
                        <Text color={'#FF6B6B'}>{error}</Text>
                    </Container>
                )}

                <Container as={'ul'} fullWidth gap={'12px'} padding={'0'} margin={'0'} align={'topLeft'}>
                    {channels.map((channel, index) => (
                        <ChannelList
                            key={`${channel.channel_name}-${index}`}
                            channel={channel}
                        />
                    ))}
                </Container>
            </ContentLayout>
        </Layout>
    );
}

export default ChannelLive;
