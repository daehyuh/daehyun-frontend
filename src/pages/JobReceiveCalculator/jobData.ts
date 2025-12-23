export type JobGender = "male" | "female";

export type JobDefinition = {
    name: string;
    gender: JobGender;
};

export const JOB_DEFINITIONS: JobDefinition[] = [
    {name: "경찰", gender: "male"},
    {name: "자경단원", gender: "female"},
    {name: "요원", gender: "male"},
    {name: "의사", gender: "male"},
    {name: "군인", gender: "male"},
    {name: "정치인", gender: "male"},
    {name: "영매", gender: "female"},
    {name: "연인", gender: "male"},
    {name: "연인", gender: "female"},
    {name: "건달", gender: "male"},
    {name: "기자", gender: "female"},
    {name: "사립탐정", gender: "male"},
    {name: "도굴꾼", gender: "male"},
    {name: "테러리스트", gender: "female"},
    {name: "성직자", gender: "female"},
    {name: "예언자", gender: "male"},
    {name: "판사", gender: "male"},
    {name: "간호사", gender: "female"},
    {name: "마술사", gender: "male"},
    {name: "해커", gender: "male"},
    {name: "심리학자", gender: "female"},
    {name: "용병", gender: "male"},
    {name: "공무원", gender: "female"},
    {name: "비밀결사", gender: "male"},
    {name: "비밀결사", gender: "female"},
    {name: "파파라치", gender: "female"},
    {name: "최면술사", gender: "female"},
    {name: "점쟁이", gender: "female"},
    {name: "마피아", gender: "male"},
    {name: "스파이", gender: "female"},
    {name: "짐승인간", gender: "male"},
    {name: "마담", gender: "female"},
    {name: "도둑", gender: "male"},
    {name: "마녀", gender: "female"},
    {name: "과학자", gender: "female"},
    {name: "사기꾼", gender: "male"},
    {name: "청부업자", gender: "male"}
];

export const RED_JOB_NAMES = new Set([
    "마피아",
    "스파이",
    "짐승인간",
    "마담",
    "도둑",
    "마녀",
    "과학자",
    "사기꾼",
    "청부업자"
]);

export const JOGYEOL_JOB_NAMES = new Set([
    "경찰",
    "자경단원",
    "요원",
    "기자",
    "사립탐정",
    "심리학자",
    "공무원",
    "파파라치",
    "최면술사",
    "점쟁이"
]);
