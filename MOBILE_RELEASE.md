# Mobile Release

## OAuth setup

Add this exact URI to the Google OAuth web client as an authorized redirect URI:

```text
https://api.xn--vk1b177d.com/login/oauth2/code/google/mobile
```

The app opens Google in the system browser. The backend completes the authorization-code
exchange and redirects back to the app with a short-lived, one-time ticket. The app exchanges the
ticket for an access token and refresh token. Only the refresh token is persisted in the native
Keychain or Android Keystore.

## Build

```bash
npm install
npm run cap:build
cd android
./gradlew assembleDebug
```

The debug APK is generated at
`android/app/build/outputs/apk/debug/app-debug.apk`. iOS builds require macOS and Xcode.

## Environment

The web build uses `VITE_API_BASE` when supplied and otherwise targets the production API. The
backend supports these optional environment variables:

```text
GOOGLE_OAUTH_MOBILE_REDIRECT_URI=https://api.xn--vk1b177d.com/login/oauth2/code/google/mobile
MOBILE_OAUTH_DEEP_LINK=com.daehyun.webview://oauth/callback
```

For a local backend, set the redirect URI to
`http://localhost:8080/login/oauth2/code/google/mobile` and register that URI in the Google OAuth
client as well.
