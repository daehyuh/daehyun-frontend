import React, {useState, useEffect} from "react";
import {mergeAPI} from "@apis/index";
import EasterEgg from "@/constant/EasterEgg";
import {CategoryTitle, Container, ContentLayout, Input, Layout, Text} from "@/components";
import Spinner from "@components/base/Spinner";
import A from "@components/base/A";
import Table from "@components/base/Table";
import CommonTableRow from "@/pages/ColorRank/components/ColorRankTableRow";
import { useRankSearch } from "@/hooks/useRankSearch";
import type { RankGuild } from "@/constant/RankGuild";

type GuildColorRankData = {
    rankGuilds?: RankGuild[]
}

type GuildColorRankSearchData = {
    searchItems: string,
    filteredItems: RankGuild[],
}

function GuildColorRank() {
    const {
        loading,
        search,
        filtered,
        handleInputChange
    } = useRankSearch<RankGuild>({
        fetcher: async () => await import('@/apis/fetchGuildRank').then(m => m.default()),
        filterKey: "guild_name"
    });

    return (
        <Layout>
            <ContentLayout gap={'20px'}>
                <CategoryTitle title="길드 배경 랭킹"/>
                <Container>
                    <Input value={search}
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
                            {filtered.map((item, index) => (
                                <CommonTableRow key={index + 1} type="guild" data={item} />
                            ))}
                            </tbody>
                        </Table>}
                </Container>
            </ContentLayout>
        </Layout>
    );
}

export default GuildColorRank;