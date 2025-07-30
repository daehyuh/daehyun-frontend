import React, {useState, useEffect, ChangeEvent} from "react";
import {mergeAPI} from "@apis/index";
import RankUser from "@/constant/RankUser";
import {CategoryTitle, Container, ContentLayout, Input, Layout, Text} from "@/components";
import Spinner from "@components/base/Spinner";
import Table from "@components/base/Table";
import CommonTableRow from "@/pages/ColorRank/components/ColorRankTableRow";
import { useRankSearch } from "@/hooks/useRankSearch";

type ColorRankData = {
    rankUsers?: RankUser[],
}

type ColorRankSearchData = {
    searchItems: string,
    filteredItems: RankUser[],
}

function ColorRank() {
    const {
        loading,
        search,
        filtered,
        handleInputChange
    } = useRankSearch<RankUser>({
        fetcher: async () => await import('@/apis/fetchRank').then(m => m.default()),
        filterKey: "nickname"
    });

    return (
        <Layout>
            <ContentLayout gap={'20px'}>
                <CategoryTitle title="검닉 랭킹"/>
                <Container>
                    <Input value={search}
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
                            {filtered.map((item, index) => (
                                <CommonTableRow key={index + 1} type="user" data={item} />
                            ))}
                            </tbody>
                        </Table>}
                </Container>
            </ContentLayout>
        </Layout>
    );
}

export default ColorRank;