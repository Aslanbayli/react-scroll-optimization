import { MantineProvider } from '@mantine/core';
import ReactDOM from 'react-dom/client';
import SearchBox from './search-box';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <MantineProvider theme={{ colorScheme: 'light' }} withGlobalStyles withNormalizeCSS >
        <SearchBox />
    </MantineProvider>
);
