import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import {ThemeProvider} from 'styled-components';
import theme from './styles/theme';
import GlobalStyle from './styles/GlobalStyle';
import {App as CapacitorApp} from '@capacitor/app';
import {handleMobileAuthUrl} from '@/utils/googleLogin';
import {hydrateAuthTokens, isNativeApp, notifyAuthError} from '@/auth/authTokens';

const root = ReactDOM.createRoot(document.getElementById('root')!);

const bootstrap = async () => {
    try {
        if (isNativeApp()) {
            await CapacitorApp.addListener('appUrlOpen', ({url}) => {
                void handleMobileAuthUrl(url).catch((error) => {
                    console.error('Mobile OAuth callback failed.', error);
                    notifyAuthError(error instanceof Error ? error.message : '구글 로그인에 실패했습니다.');
                });
            });

            const launchUrl = await CapacitorApp.getLaunchUrl();
            if (launchUrl?.url) {
                await handleMobileAuthUrl(launchUrl.url).catch((error) => {
                    console.error('Mobile launch URL handling failed.', error);
                    notifyAuthError(error instanceof Error ? error.message : '구글 로그인에 실패했습니다.');
                });
            }
        }

        await hydrateAuthTokens();
    } catch (error) {
        console.error('App bootstrap failed; rendering without restored session.', error);
    }

    root.render(
        <BrowserRouter>
            <React.StrictMode>
                <ThemeProvider theme={theme}>
                    <GlobalStyle />
                    <App />
                </ThemeProvider>
            </React.StrictMode>
        </BrowserRouter>
    );
};

void bootstrap();
