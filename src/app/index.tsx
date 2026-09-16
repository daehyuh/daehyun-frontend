import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import {ThemeProvider} from 'styled-components';
import theme from './styles/theme';
import GlobalStyle from './styles/GlobalStyle';
import {App as CapacitorApp} from '@capacitor/app';
import {handleMobileAuthUrl} from '@/utils/googleLogin';
import {hydrateAuthTokens, isNativeApp} from '@/auth/authTokens';

const root = ReactDOM.createRoot(document.getElementById('root')!);

const bootstrap = async () => {
    if (isNativeApp()) {
        await CapacitorApp.addListener('appUrlOpen', ({url}) => {
            void handleMobileAuthUrl(url).catch((error) => {
                console.error('Mobile OAuth callback failed.', error);
            });
        });

        const launchUrl = await CapacitorApp.getLaunchUrl();
        if (launchUrl?.url) {
            await handleMobileAuthUrl(launchUrl.url).catch((error) => {
                console.error('Mobile launch URL handling failed.', error);
            });
        }
    }

    await hydrateAuthTokens();

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
