import React, {useState} from "react";
import styled from "styled-components";
import {
    Button,
    CategoryTitle,
    Container,
    ContentLayout,
    Divider,
    Input,
    Layout,
    ResultContainer,
    Text,
    TitleItemContainer
} from "@/components";
import {
    JOB_DEFINITIONS,
    JobDefinition,
    JobGender,
    JOGYEOL_JOB_NAMES,
    RED_JOB_NAMES
} from "./jobData";

const ResultList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const ResultItem = styled.li<{isRed: boolean}>`
    font-weight: 600;
    color: ${({isRed}) => isRed ? '#FF8B8B' : '#8DB6FF'};
`;

const HelperParagraph = styled.p`
    margin: 0;
    color: #C5C5C7;
    font-size: 14px;
`;

const DEFAULT_MALE_WEIGHT = 3;
const DEFAULT_FEMALE_WEIGHT = 4;
const HANGUL_BASE_CODE = 0xAC00;
const HANGUL_LAST_CODE = 0xD7A3;
const HANGUL_FINAL_CONSONANT = 28;

type JobMatchResult = JobDefinition & {
    displayName: string;
    isRed: boolean;
    isJogyeol: boolean;
};

const genderLabel: Record<JobGender, string> = {
    male: "남자",
    female: "여자"
};

const jobGenderVariants = JOB_DEFINITIONS.reduce<Record<string, Set<JobGender>>>((acc, job) => {
    if (!acc[job.name]) {
        acc[job.name] = new Set<JobGender>();
    }
    acc[job.name].add(job.gender);
    return acc;
}, {});

const countBatchim = (word: string) => {
    return Array.from(word).reduce((acc, char) => {
        const code = char.charCodeAt(0);
        if (code >= HANGUL_BASE_CODE && code <= HANGUL_LAST_CODE) {
            const hasBatchim = (code - HANGUL_BASE_CODE) % HANGUL_FINAL_CONSONANT !== 0;
            return hasBatchim ? acc + 1 : acc;
        }
        return acc;
    }, 0);
};

function JobReceiveCalculator() {
    const [totalValue, setTotalValue] = useState("");
    const [maleWeight, setMaleWeight] = useState(DEFAULT_MALE_WEIGHT.toString());
    const [femaleWeight, setFemaleWeight] = useState(DEFAULT_FEMALE_WEIGHT.toString());
    const [matchedJobs, setMatchedJobs] = useState<JobMatchResult[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCalculate = () => {
        const parsedTotal = parseInt(totalValue, 10);
        const maleWeightValue = parseInt(maleWeight, 10);
        const femaleWeightValue = parseInt(femaleWeight, 10);

        setHasSearched(true);

        if (Number.isNaN(parsedTotal)) {
            setError("직플받 합을 먼저 입력해주세요.");
            setMatchedJobs([]);
            return;
        }

        const resolvedMaleWeight = Number.isNaN(maleWeightValue) ? DEFAULT_MALE_WEIGHT : maleWeightValue;
        const resolvedFemaleWeight = Number.isNaN(femaleWeightValue) ? DEFAULT_FEMALE_WEIGHT : femaleWeightValue;

        const nextMatches = JOB_DEFINITIONS
            .filter((job) => {
                const baseLength = Array.from(job.name).length;
                const batchimCount = countBatchim(job.name);
                const genderWeight = job.gender === "male" ? resolvedMaleWeight : resolvedFemaleWeight;
                return baseLength + batchimCount + genderWeight === parsedTotal;
            })
            .map<JobMatchResult>((job) => {
                const needsGenderSuffix = jobGenderVariants[job.name]?.size > 1;
                const isJogyeol = JOGYEOL_JOB_NAMES.has(job.name);
                const suffixes: string[] = [];
                if (needsGenderSuffix) {
                    suffixes.push(genderLabel[job.gender]);
                }
                if (isJogyeol) {
                    suffixes.push("조결직");
                }
                const displayName = suffixes.length ? `${job.name} (${suffixes.join(', ')})` : job.name;
                return {
                    ...job,
                    displayName,
                    isRed: RED_JOB_NAMES.has(job.name),
                    isJogyeol
                };
            })
            .sort((a, b) => {
                if (a.isJogyeol === b.isJogyeol) {
                    return a.name.localeCompare(b.name);
                }
                return a.isJogyeol ? -1 : 1;
            });

        setError(null);
        setMatchedJobs(nextMatches);
    };

    const resultHeader = hasSearched
        ? `유추된 직업 ${matchedJobs.length ? `(${matchedJobs.length}개)` : ''}`
        : "직플받 값을 입력하고 직업을 유추해보세요";

    return (
        <Layout>
            <ContentLayout gap={'20px'}>
                <CategoryTitle title={"직플받 계산기"}/>
                <Container gap={'16px'} align={'centerLeft'}>
                    <TitleItemContainer title={"직플받 합"} width={'180px'}>
                        <Input
                            type={'number'}
                            value={totalValue}
                            onChange={setTotalValue}
                            width={'160px'}
                            placeholder={'예: 12'}
                        />
                    </TitleItemContainer>
                    <TitleItemContainer title={"남자 가중치"} width={'180px'}>
                        <Input
                            type={'number'}
                            value={maleWeight}
                            onChange={setMaleWeight}
                            width={'160px'}
                        />
                    </TitleItemContainer>
                    <TitleItemContainer title={"여자 가중치"} width={'180px'}>
                        <Input
                            type={'number'}
                            value={femaleWeight}
                            onChange={setFemaleWeight}
                            width={'160px'}
                        />
                    </TitleItemContainer>
                </Container>
                <HelperParagraph>
                    직업 글자수 + 받침 수 + (남/여 가중치) 합이 직플받 값과 같으면 후보로 표시됩니다.
                </HelperParagraph>
                <Button width={'200px'} onClick={handleCalculate}>
                    직업 유추
                </Button>
                {error && (
                    <Text color={'#FF8B8B'}>{error}</Text>
                )}
                <Divider/>
                <ResultContainer>
                    <Container gap={'8px'} align={'centerLeft'} fullWidth>
                        <Text fontWeight={'700'}>{resultHeader}</Text>
                        {!hasSearched && (
                            <HelperParagraph>
                                기본 남/녀 가중치는 3과 4입니다. 필요하면 숫자를 바꾼 뒤 다시 계산하세요.
                            </HelperParagraph>
                        )}
                        {hasSearched && matchedJobs.length === 0 && (
                            <HelperParagraph>
                                해당 조건에 맞는 직업이 없습니다.
                            </HelperParagraph>
                        )}
                        {hasSearched && matchedJobs.length > 0 && (
                            <ResultList>
                                {matchedJobs.map((job) => (
                                    <ResultItem key={`${job.name}-${job.gender}`} isRed={job.isRed}>
                                        {job.displayName}
                                    </ResultItem>
                                ))}
                            </ResultList>
                        )}
                    </Container>
                </ResultContainer>
            </ContentLayout>
        </Layout>
    );
}

export default JobReceiveCalculator;
