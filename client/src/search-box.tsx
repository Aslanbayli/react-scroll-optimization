import React, { useState, useRef } from 'react';
import { TextInput, Popover, Box, Stack } from '@mantine/core';
import { FixedSizeList } from 'react-window';
import axios from 'axios';


function SearchBox() {
    interface Option {
        id: number;
        name: string;
    }

    interface Data {
        options: Option[]; 
        total: number; 
    }

    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<Data>({
        options: [],
        total: 0,
    });
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchData = async (searchText: string, limit: number, offset: number) => {
        try {
            const response = await axios({
                method: 'get',
                url: `http://localhost:8080/search?search_text=${searchText}&limit=${limit}&offset=${offset}`,
                withCredentials: false,
            });
            console.log(response.request.responseURL);
            return response.data;
        } catch (error) {
            console.error("API request error:", error);
            return null;
        }
    };

    const search = async (searchText: string, limit = 10, offset = 0) => {
        setIsLoading(true);
        const newData = await fetchData(searchText, limit, offset);
        if (newData.data) {
            setData((prevData) => {
                if (prevData.total === 0) {
                    prevData.options = [];
                }
                return {
                    options: [...prevData.options, ...newData.data], 
                    total: newData.total,
                };
            });
        } else {
            setData({options: [{id: 0, name: 'No options found'}], total: 0});
        }
        setIsLoading(false);
    };


    const handleItemsRendered = ({ visibleStopIndex }: { visibleStopIndex: number }) => {
        if (data.options.length < data.total && !isLoading && data.options.length === visibleStopIndex + 1) {
            search(searchText, 10, data.options.length);
        }
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setData({ options: [], total: 0 });
        if (e.target.value !== '') {
            timeoutRef.current = setTimeout(() => {
                search(e.target.value);
            }, 500);
        }
    };


    const itemCount = isLoading ? data.options.length + 1 : data.options.length;
    const itemData = isLoading ? [...data.options, {id: 0, name: 'Loading...'}] : data.options;


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
                            <FixedSizeList
                                onItemsRendered={handleItemsRendered}
                                style={{
                                    textAlign: 'center',
                                    fontSize: '0.875rem',
                                }}
                                height={300}
                                width={300}
                                itemCount={itemCount}
                                itemSize={45}
                                itemData={itemData}
                            >
                                {({ index, style, data }) => (
                                    <div style={style}>
                                        {data[index].name === 'Loading...' ? (
                                            <span>Loading...</span>
                                        ) : (
                                            data[index].name
                                        )}
                                    </div>
                                )}
                            </FixedSizeList>
                </Popover.Dropdown>
            </Popover>
        </Stack>
    );
}

export default SearchBox;
