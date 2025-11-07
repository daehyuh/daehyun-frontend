import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import {ThemeProvider} from 'styled-components';
import theme from './styles/theme';
import GlobalStyle from './styles/GlobalStyle';

const root = ReactDOM.createRoot(document.getElementById('root')!);

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
