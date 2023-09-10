import { MantineProvider } from '@mantine/core';
import ReactDOM from 'react-dom/client';
import App from './search-box.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <MantineProvider theme={{ colorScheme: 'light' }} withGlobalStyles withNormalizeCSS >
        <App />
    </MantineProvider>
);
