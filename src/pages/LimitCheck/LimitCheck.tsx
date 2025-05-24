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
import {fetchUserGameData} from "@/apis";

function LimitCheck() {
    const [nickname, setNickname] = useState<string>("");

    // api 조회
    const [gameData, setGameData] = useState<UserGameData | null>(null);

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
                <CategoryTitle title={"전적 검색"}/>
                <Container fullWidth align={'centerLeft'} gap={'12px'} flexDirection={'row'}>
                    <Input value={nickname} onChange={(value) => setNickname(value)} placeholder={"닉네임"}/>
                    <Button borderRadius={'4px'} height={'100%'} padding={'8px 12px'} fontSize={'unset'}
                            onClick={getGame}>검색</Button>
                </Container>
                <Divider/>
                    <ResultContainer>
                        {gameData === null && 
                        
                                                <>
                                <TitleItemContainer width={'160px'} title={"오늘 플레이한 게임"}>
                                    <Text>
                                        오늘 0판 (승리 0판, 패배 0판)
                                    </Text>
                                </TitleItemContainer>

                                <TitleItemContainer width={'160px'} title={"현재 승리판수"}>
                                    <Text>
                                        0승 0패
                                    </Text>
                                </TitleItemContainer>

                                <TitleItemContainer width={'160px'} title={"어제 승리판수"}>
                                    <Text>
                                        0승 0패
                                    </Text>
                                </TitleItemContainer>

                                <TitleItemContainer width={'160px'} title={"획초 여부"}>
                                    <Text>
                                        미획초
                                    </Text>
                                </TitleItemContainer>
                            </>
                        
                        }

                        {gameData !== null &&
                            <>
                                <TitleItemContainer width={'160px'} title={"오늘 플레이한 게임"}>
                                    <Text>
                                        오늘 {(gameData.today_games ?? 0).toString()}판 (승리 {(gameData.current_win_count - gameData.past_win_count).toString()}판, 패배 {(gameData.current_lose_count - gameData.past_lose_count).toString()}판)
                                    </Text>
                                </TitleItemContainer>

                                <TitleItemContainer width={'160px'} title={"현재 승리판수"}>
                                    <Text>
                                        {gameData.current_win_count.toString()}승 {gameData.current_lose_count.toString()}패
                                    </Text>
                                </TitleItemContainer>

                                <TitleItemContainer width={'160px'} title={"어제 승리판수"}>
                                    <Text>
                                        {gameData.past_win_count.toString()}승 {gameData.past_lose_count.toString()}패
                                    </Text>
                                </TitleItemContainer>

                                <TitleItemContainer width={'160px'} title={"획초 여부"}>
                                    <Text>
                                        {(gameData.today_games ?? 0) >= 31 ? "획초" : "미획초"}
                                    </Text>
                                </TitleItemContainer>
                            </>
                        }

                        <Text color={'gray'}>랭크게임 구분은 되어있지 않습니다.</Text>
                    </ResultContainer>
                <Divider/>
            </ContentLayout>
        </Layout>
    );
}

export default LimitCheck;
