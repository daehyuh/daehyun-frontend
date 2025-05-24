import { useEffect, useState } from "react";

function AuthSection() {
    const [nickname, setNickname] = useState("");
    const [userCode, setUserCode] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [hoveredField, setHoveredField] = useState<"nickname" | "userCode" | null>(null);

    useEffect(() => {
        const hasToken = document.cookie
            .split(";")
            .map((c) => c.trim())
            .some((c) => c.startsWith("accessToken="));
        setIsLoggedIn(hasToken);
    }, []);
    
    const handleLogin = () => {
        const clientId = "609416675991-2g5jqg562hursv4v09upi96q1fvrvius.apps.googleusercontent.com";
        const redirectUri = "https://hufsnc.com/login/oauth2/code/google"; // 배포 시 교체
        const scope = [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile"
    ].join(" ");
        const url = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
        window.location.href = url;
    };

    const handleLogout = () => {
        document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
        setIsLoggedIn(false);
        window.location.reload();
    };

const handleSubmit = async () => {
    const accessToken = document.cookie
        .split(";")
        .map(c => c.trim())
        .find(c => c.startsWith("accessToken="))
        ?.split("=")[1];

    if (!accessToken) {
        alert("로그인이 필요합니다.");
        return;
    }

    if (!nickname || !userCode) {
        alert("닉네임과 유저 코드를 모두 입력해주세요.");
        return;
    }

    try {
        const encodedNickname = encodeURIComponent(nickname);
        const encodedCode = encodeURIComponent(userCode);
        
        const url = `https://api.daehyun.dev/Account/sync?nickname=${encodedNickname}&code=${encodedCode}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "*/*",
            },
        });

        if (!response.ok) {
            const text = await response.text();
            alert(`요청 실패: ${response.status} - ${text}`);
            return;
        }

        const data = await response.json();
        alert("동기화 성공!");
    } catch (e) {
        console.error(e);
        alert("에러 발생: " + e);
    }
};

    if (!isLoggedIn) {
        return (
            <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
                <button
                    style={{
                        width: "100%",
                        padding: "12px",
                        backgroundColor: "#fff",
                        color: "#444",
                        border: "none",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        cursor: "pointer",
                    }}
                    onClick={handleLogin}
                >
                    구글 로그인
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
            {/* 닉네임 입력 */}
            <div style={{ marginBottom: "12px" }}>
                <label
                    style={{
                        color: hoveredField === "nickname" ? "#FEC97B" : "#CCCCCC",
                        fontWeight: "bold",
                    }}
                >
                    닉네임
                </label>
                <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="닉네임을 입력해주세요."
                    onMouseEnter={() => setHoveredField("nickname")}
                    onMouseLeave={() => setHoveredField(null)}
                    style={{
                        width: "100%",
                        padding: "12px",
                        marginTop: "4px",
                        background: "#1C1C1E",
                        color: "#fff",
                        border: `1px solid ${hoveredField === "nickname" ? "#FEC97B" : "#888"}`,
                        borderRadius: "6px",
                        outline: "none",
                    }}
                />
            </div>

            {/* 유저 코드 입력 */}
            <div style={{ marginBottom: "20px" }}>
                <label
                    style={{
                        color: hoveredField === "userCode" ? "#FEC97B" : "#CCCCCC",
                        fontWeight: "bold",
                    }}
                >
                    유저 코드
                </label>
                <input
                    type="text"
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    placeholder="코드를 입력해주세요."
                    onMouseEnter={() => setHoveredField("userCode")}
                    onMouseLeave={() => setHoveredField(null)}
                    style={{
                        width: "100%",
                        padding: "12px",
                        marginTop: "4px",
                        background: "#1C1C1E",
                        color: "#fff",
                        border: `1px solid ${hoveredField === "userCode" ? "#FEC97B" : "#888"}`,
                        borderRadius: "6px",
                        outline: "none",
                    }}
                />
            </div>

            {/* 확인 버튼 */}
            <button
                onClick={handleSubmit}
                style={{
                    width: "100%",
                    padding: "14px",
                    backgroundColor: "#D82F45",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    marginBottom: "20px",
                }}
            >
                대현닷컴에 유저 등록
            </button>

            {/* 로그아웃 버튼 */}
            <button
                onClick={handleLogout}
                style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#fff",
                    color: "#444",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    cursor: "pointer",
                }}
            >
                로그아웃
            </button>
        </div>
    );
}

export default AuthSection;