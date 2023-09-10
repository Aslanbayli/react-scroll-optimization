import React, { useEffect, useState, useRef } from 'react';
import { TextInput, Popover, Box, Stack } from '@mantine/core';
import { FixedSizeList } from 'react-window';
import axios from 'axios';

function SearchBox() {
    interface ResultItem {
        id: number;
        name: string;
    }

    // const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ResultItem[]>([]);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value !== ' ') {
            setQuery(e.target.value);
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const response = await axios({
                method: 'get',
                url: `http://localhost:8080/search?search_text=${query}`,
                withCredentials: false,
            });
            if (response.data.data === null) {
                setResults([{ id: 0, name: 'No results' }]);
                return;
            } else {
                setResults(response.data.data);
            }
        };

        if (query) {
            timeoutRef.current = setTimeout(() => fetchData(), 400);
        } else {
            setResults([]);
        }

    }, [query]);

    return (
        <Stack sx={{ margin: '10% 30%' }}>
            <Box       
                sx={(theme) => ({
                    backgroundColor: theme.colors.blue[5],
                    textAlign: 'center',
                    padding: theme.spacing.xs,
                    borderRadius: theme.radius.md,
                    fontSize: '0.875rem',
                })}
            >
                Get Data
            </Box>
            <Popover 
                position="bottom"
            >
                <Popover.Target>
                    <TextInput
                        placeholder="search..."
                        radius="md"
                        value={query}
                        onChange={handleSearch}
                    />
                </Popover.Target>

                <Popover.Dropdown>
                    <FixedSizeList
                        style={{ textAlign: 'center', fontSize: '0.875rem' }}
                        height={300}
                        width={300}
                        itemCount={results.length}
                        itemSize={45}
                    >
                        {({ index, style }) => (
                            <div style={style}>{results[index].name}</div>
                        )}
                    </FixedSizeList>
                </Popover.Dropdown>
            </Popover>
        </Stack>
    );
}

export default SearchBox;
