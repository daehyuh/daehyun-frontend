import React, {useEffect, useState} from "react";
import styles from "@/legacy/styles/LimitCheck.module.css";
import {
    Button,
    CategoryTitle,
    Container,
    ContentLayout,
    Divider,
    Input,
    Layout,
    ResultContainer,
    Text, TitleItemContainer
} from "@/components";
import A from "@components/base/A";
import Time from "@/constant/Time";
import {fetchTime, fetchUserGameData} from "@/apis";

function LimitCheck() {
    const [nickname, setNickname] = useState<string>("");

    // api 조회
    const [time, setTime] = useState<Time | null>(null);
    const [gameData, setGameData] = useState<UserGameData | null>(null);

    const fetchTimeData = async () => {
        await fetchTime()
            .completion({
                success: (result) => {
                    setTime(result);
                }
            })
    }

    useEffect(() => {
        fetchTimeData()
    }, []);


    const getGame = async () => {
        await fetchUserGameData(nickname)
            .completion({
                success: (result) => {
                    setGameData(result)
                }
            })
    }

    return (
        <Layout>
            <ContentLayout gap={'20px'}>
                <CategoryTitle title={"획초 체크"}/>
                <Container align={'centerLeft'} gap={'18px'} fullWidth>
                    <Text fontSize={'1.5rem'} fontWeight={'bold'}>최후의 반론에서 댓글을 달면, 랭킹에 자동으로 추가됩니다.</Text>
                    <Text fontSize={'1.17rem'} fontWeight={'bold'}>최근 갱신일 {time?.colortime ?? ""}.</Text>
                    <A href="https://mafia42.com/#/community/lastDiscussion/lastShow/1007550"
                       backgroundColor={'#1e1e1e'}
                       width={'100%'}>
                        <Text width={'100%'} textAlign={'center'} color={'red'} fontSize={'1.2rem'} fontWeight={'bold'}>최후의
                            반론 링크</Text>
                    </A>
                </Container>
                <Container fullWidth align={'centerLeft'} gap={'12px'} flexDirection={'row'}>
                    <Input value={nickname} onChange={(value) => setNickname(value)} placeholder={"닉네임"}/>
                    <Button borderRadius={'4px'} height={'100%'} padding={'8px 12px'} fontSize={'unset'}
                            onClick={getGame}>검색</Button>
                </Container>
                <Divider/>
                <ResultContainer>
                    {gameData === null && <Text>유저를 검색해주세요.</Text>}
                    {gameData?.today_games == null && <Text>오늘 플레이한 게임이 없습니다.</Text>}
                    {gameData?.today_games &&
                        <>
                            <TitleItemContainer width={'160px'} title={"오늘 플레이한 게임"}>
                                <Text>
                                    {gameData.today_games.toString()}판
                                </Text>
                            </TitleItemContainer>

                            <TitleItemContainer width={'160px'} title={"획초 여부"}>
                                <Text>
                                    {gameData.today_games >= 31 ? "획초" : "미획초"}
                                </Text>
                            </TitleItemContainer>
                        </>}
                    <Text color={'gray'}>랭크게임 구분은 되어있지 않습니다.</Text>
                </ResultContainer>
                <Divider/>
            </ContentLayout>
        </Layout>
    );
}

export default LimitCheck;
