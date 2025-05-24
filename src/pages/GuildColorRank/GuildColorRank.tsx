import React, {useState, useEffect} from "react";
import {mergeAPI} from "@apis/index";
import EasterEgg from "@/constant/EasterEgg";
import {CategoryTitle, Container, ContentLayout, Input, Layout, Text} from "@/components";
import Spinner from "@components/base/Spinner";
import A from "@components/base/A";
import Table from "@components/base/Table";
import GuildColorRankTableRow from "@/pages/GuildColorRank/components/GuildColorRankTableRow";
import fetchGuildRank from "@apis/fetchGuildRank";

type GuildColorRankData = {
    rankGuilds?: RankGuild[]
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
                    rankGuilds: fetchGuildRank()
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
                <CategoryTitle title="길드 배경 랭킹"/>
                <Container>
                    <Input value={searchData.searchItems}
                           placeholder={"길드 검색"}
                           onChange={handleInputChange}/>
                </Container>
                <Text color={"#ffffff"} fontWeight={'bold'}>검닉으로 인정되면 점수앞에 ✅가 붙습니다</Text>

                <Container fullWidth align={'center'} gap={'10px'}>
                    {loading ? <Spinner isLoading={loading}/> :
                        <Table fullWidth
                               headers={["랭킹", "길드명", "배경 색상(HEX)", "점수"]}
                               columnWidths={["15%", "35%", "25%", "25%"]}
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