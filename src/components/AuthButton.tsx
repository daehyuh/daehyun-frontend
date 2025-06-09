import { useEffect, useState } from "react";
import Text from "./base/Text";
import { data } from "react-router-dom";

function AuthSection() {
    const [loginId, setloginId] = useState("");
    const [nickname2, setNickname2] = useState("");
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
        const accessToken = document.cookie
                .split(";")
                .map(c => c.trim())
                .find(c => c.startsWith("accessToken="))
                ?.split("=")[1];
        

        if (hasToken) {
            const accessToken = document.cookie
                    .split(";")
                    .map(c => c.trim())
                    .find(c => c.startsWith("accessToken="))
                    ?.split("=")[1];
            
            if (accessToken) {
                fetch("https://api.xn--vk1b177d.com/User/profile/me", {
                      method: "GET",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Accept": "*/*",
                    },
                    credentials: "include",
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                }
                )
                .then(data => {
                    setloginId(data.name);
                })
                .catch(error => {
                    console.error("Error fetching user data:", error);
                    alert("로그인이 만료되었습니다.");
                    window.location.href = "https://xn--vk1b177d.com/core/logout";
                });
            }
        }
        

    }, []);


    
    const handleLogin = () => {
        window.location.href = "https://accounts.google.com/o/oauth2/auth?client_id=609416675991-2g5jqg562hursv4v09upi96q1fvrvius.apps.googleusercontent.com&redirect_uri=https://api.xn--vk1b177d.com/login/oauth2/code/google&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile";
    };
    
    const handleLogout = async () => {
            window.location.href = "https://api.xn--vk1b177d.com/core/logout";
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
        
        const url = `https://api.xn--vk1b177d.com/User/Account/sync?nickname=${encodedNickname}&code=${encodedCode}`;
        
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
        alert("에러 발생 (이미 등록된 유저이거나, 1계정당 1번만 등록 가능합니다.), 추가를 원하시면 문의해주세요.");
    }
};

const handleSubmit2 = async () => {
    const accessToken = document.cookie
        .split(";")
        .map(c => c.trim())
        .find(c => c.startsWith("accessToken="))
        ?.split("=")[1];

    if (!accessToken) {
        alert("로그인이 필요합니다.");
        return;
    }

    if (!nickname2) {
        alert("최반 닉네임을 입력해주세요.");
        return;
    }
    
    try {
        const encodedNickname = encodeURIComponent(nickname2);
        
        const url = `https://api.xn--vk1b177d.com/User/Account/addGuest?nickname=${encodedNickname}`;
        
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
        alert(`"${data.data}"를 최후의 반론 Team42 공지의 댓글로 남겨주세요.(번호만 입력)`);

    } catch (e) {
        console.error(e);
        alert("에러 발생 (이미 등록된 유저이거나, 1계정당 1번만 등록 가능합니다.), 추가를 원하시면 문의해주세요.");
    }
};

    if (!isLoggedIn) {
        return (
         <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
                <button
                    onClick={handleLogin}
                    style={{
                        width: "100%",
                        padding: "12px",
                        backgroundColor: "#fff",
                        color: "#444",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                    }}
                >
                    <img
                        src="https://developers.google.com/identity/images/g-logo.png"
                        alt="Google Logo"
                        style={{ width: "18px", height: "18px" }}
                    />
                    대현닷컴 로그인
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", width: "300px", maxWidth: "600px", margin: "0 auto" }}>

            <h2 style={{ color: "#FEC97B", textAlign: "center", marginBottom: "20px" }}>
                {loginId} 님, 안녕하세요!
            </h2>
            <div style={{ marginBottom: "20px", textAlign: "center", display: "flex", gap: "10px", flexDirection: "column", alignItems: "center" }}>
            <div>
                {/* 닉네임 입력 */}
            <div style={{ marginBottom: "12px" }}>
                <label
                    style={{
                        color: hoveredField === "nickname2" ? "#FEC97B" : "#CCCCCC",
                        fontWeight: "bold",
                    }}
                >
                닉네임을 기입후 최후의 반론 Team42 공지 댓글에 인증번호를 입력하여 인증해주세요. (스파이의 비밀문서가 안되는 분들을 위한 인증방법)
                </label>
                <input
                    type="text"
                    value={nickname2}
                    onChange={(e) => setNickname2(e.target.value)}
                    placeholder="닉네임을 입력해주세요."
                    onMouseEnter={() => setHoveredField("nickname2")}
                    onMouseLeave={() => setHoveredField(null)}
                    style={{
                        width: "90%",
                        padding: "12px",
                        marginTop: "4px",
                        background: "#1C1C1E",
                        color: "#fff",
                        border: `1px solid ${hoveredField === "nickname2" ? "#FEC97B" : "#888"}`,
                        borderRadius: "6px",
                        outline: "none",
                    }}
                />
            </div>
            </div>
                

            {/* 확인 버튼 */}
            <button
                onClick={handleSubmit2}
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
            Team42 최후의반론 공지 댓글로 인증
            </button>

            <div>
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
                        width: "90%",
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
                    스파이의 비밀문서 코드
                </label>
                <input
                    type="text"
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    placeholder="코드를 입력해주세요."
                    onMouseEnter={() => setHoveredField("userCode")}
                    onMouseLeave={() => setHoveredField(null)}
                    style={{
                        width: "90%",
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
                스파이의 비밀문서 코드로 인증
            </button>
            
            
            </div>
            </div>
            
            {/* 로그인 정보 표시 */}

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