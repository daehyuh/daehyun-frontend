export type DeviceType = "iphone" | "android"

const useDevice = (): DeviceType => {
    // 아이폰으로 들어왔는지 안드로이드로 들어왔는지 구분
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes("iphone") || userAgent.includes("ipad") || userAgent.includes("ipod") ? "iphone" : "android";
}

export default useDevice;