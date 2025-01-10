import React, {useState, useEffect} from "react";
import {fetchTime, mergeAPI} from "@apis/index";
import fetchEasterEgg from "@apis/fetchEasterEgg";
import EasterEgg from "@/constant/EasterEgg";
import Time from "@/constant/Time";
import {CategoryTitle, Container, ContentLayout, Input, Layout, Text} from "@/components";
import Spinner from "@components/base/Spinner";
import A from "@components/base/A";
import Table from "@components/base/Table";
import GuildColorRankTableRow from "@/pages/GuildColorRank/components/GuildColorRankTableRow";
import fetchGuildRank from "@apis/fetchGuildRank";

type GuildColorRankData = {
    rankGuilds?: RankGuild[],
    time?: Time,
    easterEgg?: EasterEgg
}

type GuildColorRankSearchData = {
    searchItems: string,
    filteredItems: RankGuild[],
}

function GuildColorRank() {
    // Loading 상태 변수 추가
    const [loading, setLoading] = useState(true);
    const [rankData, setRankData] = useState({} as GuildColorRankData);
    const [searchData, setSearchData] = useState({
        searchItems: "",
        filteredItems: []
    } as GuildColorRankSearchData);

    // 컴포넌트가 처음 렌더링될 때 데이터를 불러오는 effect
    useEffect(() => {
        const fetchData = async () => {
            await mergeAPI({
                    rankGuilds: fetchGuildRank(),
                    time: fetchTime(),
                    easterEgg: fetchEasterEgg()
                },
                {
                    success: (result) => {
                        setRankData(result as GuildColorRankData);
                        updateSearchItem(null, result.rankGuilds);
                    },
                    failure:
                        (error) => {
                            console.error("데이터를 불러오는 데 실패했습니다:", error);
                        },
                    finally: () => {
                        setLoading(false);
                    }
                })
        }
        fetchData();
    }, []);

    const updateSearchItem = (search: string | null,
                              rankGuilds: RankGuild[] | null = null) => {
        setSearchData(({searchItems, filteredItems}) => {
            console.log(search, filteredItems)
            const searchValue = search ?? searchItems;
            const rankGuildsValue = rankGuilds ?? rankData.rankGuilds ?? []
            const filteredRankGuilds = (searchValue.length > 0 ? rankGuildsValue.filter((rankGuild) => {
                return rankGuild.guild_name.toLowerCase().includes(searchValue.toLowerCase())
            }) : rankGuildsValue) ?? []

            return {
                searchItems: searchValue,
                filteredItems: filteredRankGuilds
            }
        })
    }

    // 검색어 입력 change 이벤트 핸들러
    const handleInputChange = (value: string) => {
        updateSearchItem(value);
    };

    return (
        <Layout>
            <ContentLayout gap={'20px'}>
                <CategoryTitle title="길드 검닉 랭킹"/>
                <Container align={'centerLeft'} gap={'18px'} fullWidth>
                    <Text fontSize={'1.5rem'} fontWeight={'bold'}>최후의 반론에서 댓글을 달면, 랭킹에 자동으로 추가됩니다.</Text>
                    <Text fontSize={'1.17rem'} fontWeight={'bold'}>최근 갱신일 {rankData.time?.colortime ?? ""}.</Text>
                    <A href="https://mafia42.com/#/community/lastDiscussion/lastShow/1007550"
                       backgroundColor={'#1e1e1e'}
                       width={'100%'}>
                        <Text width={'100%'} textAlign={'center'} color={'red'} fontSize={'1.2rem'} fontWeight={'bold'}>최후의
                            반론 링크</Text>
                    </A>
                    {/* <img
                            src={`../image/comment.PNG`}
                            alt="comment"
                            style={{ width: "100%", height: "auto", margin: "0 0 10px 0" }}
                    /> */}
                </Container>
                <Container>
                    <Input value={searchData.searchItems}
                           placeholder={"길드 검색"}
                           onChange={handleInputChange}/>
                </Container>
                <Text color={"#fc7373"} fontWeight={'bold'}>첫번째 검은색(000000) 등록자에게 깜10장을 드립니다!</Text>
                <Text color={"#ff0000"} fontWeight={'bold'}>90점 이상은 검정색으로 인정됩니다.</Text>
                <Text color={"#ffffff"} fontWeight={'bold'}>검닉으로 인정되면 점수앞에 ✅가 붙습니다</Text>

                <Container fullWidth align={'center'} gap={'10px'}>
                    {loading ? <Spinner isLoading={loading}/> :
                        <Table fullWidth
                               headers={["랭킹", "길드명", "배경 색상(HEX)", "점수"]}
                               columnWidths={["25%", "25%", "25%", "25%"]}
                               useRankColor
                        >
                            <tbody>
                            {searchData.filteredItems.map((item, index) => (
                                <GuildColorRankTableRow key={index + 1}
                                                        rankGuild={item}/>
                            ))}
                            </tbody>
                        </Table>}
                </Container>
            </ContentLayout>
        </Layout>
    );
}

export default GuildColorRank;