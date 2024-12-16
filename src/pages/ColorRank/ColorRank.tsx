import React, {useState, useEffect, ChangeEvent} from "react";
import styles from "@/legacy/styles/ColorRank.module.css";
import {fetchRank, fetchTime, mergeAPI} from "@apis/index";
import fetchEasterEgg from "@apis/fetchEasterEgg";
import RankUser from "@/constant/RankUser";
import EasterEgg from "@/constant/EasterEgg";
import Time from "@/constant/Time";
import {CategoryTitle, Container, ContentLayout, Input, Layout, Text} from "@/components";
import Spinner from "@components/base/Spinner";
import A from "@components/base/A";
import Table from "@components/base/Table";
import ColorRankTableRow from "@/pages/ColorRank/components/ColorRankTableRow";

type ColorRankData = {
    rankUsers?: RankUser[],
    time?: Time,
    easterEgg?: EasterEgg
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
                    time: fetchTime(),
                    easterEgg: fetchEasterEgg()
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
                           placeholder={"유저 검색"}
                           onChange={handleInputChange}/>
                </Container>
                <Text color={"#fc7373"} fontWeight={'bold'}>첫번째 검은색(000000) 등록자에게 깜10장을 드립니다!</Text>
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
                                                   backgroundColor={rankData.easterEgg?.[item.nickname] ? `#${rankData.easterEgg?.[item.nickname]}` : undefined}/>
                            ))}
                            </tbody>
                        </Table>}
                </Container>
            </ContentLayout>
        </Layout>
    );
}

export default ColorRank;