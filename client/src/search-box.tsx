import React, { useEffect, useState, useRef, useCallback } from 'react';
import { TextInput, Popover, Box, Stack } from '@mantine/core';
import { FixedSizeList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import axios from 'axios';

function SearchBox() {
    interface Option {
        id: number;
        name: string;
    }

    interface Data {
        options: Option[]; 
        hasMore: boolean; 
    }

    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<Data>({
        options: [],
        hasMore: false,
    });
    const infiniteLoaderRef = useRef<InfiniteLoader | null>(null);
    const hasMountedRef = useRef(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchData = async (searchText: string, limit: number, offset: number) => {
        const response = await axios({
            method: 'get',
            url: `http://localhost:8080/search?search_text=${searchText}&limit=${limit}&offset=${offset}`,
            withCredentials: false,
        });
        console.log(response.request.responseURL);
        return response.data;
    };

    const search = async (searchText: string) => {
        setIsLoading(true);
        if (searchText === '') {
            setData({options: [], hasMore: false});
            return;
        }
        const newData = await fetchData(searchText, 10, 0);
        if (newData.data) {
            setData({options: newData.data, hasMore: newData.data.length > 0});
        } else {
            setData({options: [{id: 0, name: 'No options found'}], hasMore: false});
        }
        setIsLoading(false);
    };

    const loadMore = async () => {
        setIsLoading(true);
        const newData = await fetchData(searchText, 10, data.options.length);
        setData((prevData) => ({
            options: [...prevData.options, ...newData.data],
            hasMore: newData.data.length > 0,
        }));
        setIsLoading(false);
    };

    const loadedOptionCount = data.hasMore ? data.options.length + 1 : data.options.length;
    const loadMoreOptions = isLoading ? () => {} : loadMore;
    const isOptionLoaded = useCallback(
        (index: number) => !data.hasMore || index < data.options.length,
        [data]
    );

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };


    useEffect(() => {
        if (hasMountedRef.current) {
            if (infiniteLoaderRef.current) {
                infiniteLoaderRef.current.resetloadMoreItemsCache();
            }
            timeoutRef.current = setTimeout(() => search(searchText), 400);
        }
        hasMountedRef.current = true;
    }, [searchText]);

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
            <Popover position="bottom">
                <Popover.Target>
                    <TextInput
                        placeholder="search..."
                        radius="md"
                        value={searchText}
                        onChange={handleSearch}
                    />
                </Popover.Target>

                <Popover.Dropdown>
                    <InfiniteLoader
                        ref={infiniteLoaderRef}
                        isItemLoaded={isOptionLoaded}
                        itemCount={loadedOptionCount}
                        loadMoreItems={loadMoreOptions}
                    >
                        {({ onItemsRendered, ref }) => (
                            <FixedSizeList
                                onItemsRendered={onItemsRendered}
                                ref={ref}
                                style={{
                                    textAlign: 'center',
                                    fontSize: '0.875rem',
                                }}
                                height={300}
                                width={300}
                                itemCount={data.options.length}
                                itemSize={45}
                            >
                                {({ index, style }) => (
                                    <div style={style}>
                                        {data.options[index].name}
                                    </div>
                                )}
                            </FixedSizeList>
                        )}
                    </InfiniteLoader>
                </Popover.Dropdown>
            </Popover>
        </Stack>
    );
}

export default SearchBox;
