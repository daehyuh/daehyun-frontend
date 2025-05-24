import React, {useState, useEffect, ChangeEvent} from "react";
import {fetchRank, mergeAPI} from "@apis/index";
import RankUser from "@/constant/RankUser";
import {CategoryTitle, Container, ContentLayout, Input, Layout, Text} from "@/components";
import Spinner from "@components/base/Spinner";
import Table from "@components/base/Table";
import ColorRankTableRow from "@/pages/ColorRank/components/ColorRankTableRow";

type ColorRankData = {
    rankUsers?: RankUser[],
}

type ColorRankSearchData = {
    searchItems: string,
    filteredItems: RankUser[],
}

function ColorRank() {
    // Loading 상태 변수 추가
    const [loading, setLoading] = useState(true);
    const [rankData, setRankData] = useState({} as ColorRankData);
    const [searchData, setSearchData] = useState({
        searchItems: "",
        filteredItems: []
    } as ColorRankSearchData);

    // 컴포넌트가 처음 렌더링될 때 데이터를 불러오는 effect
    useEffect(() => {
        const fetchData = async () => {
            await mergeAPI({
                    rankUsers: fetchRank(),
                },
                {
                    success: (result) => {
                        setRankData(result as ColorRankData);
                        updateSearchItem(null, result.rankUsers);
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
                              rankUsers: RankUser[] | null = null) => {
        setSearchData(({searchItems}) => {
            const searchValue = search ?? searchItems;
            const rankUsersValue = rankUsers ?? rankData.rankUsers ?? []
            const filteredRankUsers = (searchValue.length > 0 ? rankUsersValue.filter((rankUser) => {
                return rankUser.nickname.toLowerCase().includes(searchValue.toLowerCase())
            }) : rankUsersValue) ?? []
            return {
                searchItems: searchValue,
                filteredItems: filteredRankUsers
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
                <CategoryTitle title="검닉 랭킹"/>
                <Container>
                    <Input value={searchData.searchItems}
                           placeholder={"유저 검색"}
                           onChange={handleInputChange}/>
                </Container>
                <Text color={"#ffffff"} fontWeight={'bold'}>검닉으로 인정되면 점수앞에 ✅가 붙습니다</Text>
                <Container fullWidth align={'center'} gap={'10px'}>
                    {loading ? <Spinner isLoading={loading}/> :
                        <Table fullWidth
                               headers={["랭킹", "이름", "색상(HEX)", "점수"]}
                               columnWidths={["15%", "35%", "25%", "25%"]}
                               useRankColor
                        >
                            <tbody>
                            {searchData.filteredItems.map((item, index) => (
                                <ColorRankTableRow key={index + 1}
                                                   rankUser={item}
                                                   />
                            ))}
                            </tbody>
                        </Table>}
                </Container>
            </ContentLayout>
        </Layout>
    );
}

export default ColorRank;