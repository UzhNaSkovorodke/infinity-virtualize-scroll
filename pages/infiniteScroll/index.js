import React, {useRef, useState} from 'react';
import {AutoSizer, CellMeasurer, CellMeasurerCache, InfiniteLoader, List} from "react-virtualized";


export default function InfiniteScroll({pageData}) {
    const [list, setList] = useState(pageData);
    const [page, setPage] = useState(3);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const cache = useRef(
        new CellMeasurerCache({fixedWidth: true, defaultHeight: 100})
    );
    const handleNewPageLoad = async () => {
        setIsNextPageLoading(true);
        await fetch(`https://jsonplaceholder.typicode.com/photos?_limit=20&_page=${page}`)
            .then(response => response.json())
            .then(resp => {
                setList(prev => [...prev, ...resp])
                setPage(prev => prev + 1)
            }).finally(() => setIsNextPageLoading(false))
    };

    function isRowLoaded({index}) {
        return !!list[index];
    }

    const remoteRowCount = 500;
    const loadMoreRows = isNextPageLoading ? () => {
    } : handleNewPageLoad;


    return (
        <div style={{
            width: '500px',
            height: '50vh',
            marginRight: '10px',
            overflow: 'scroll',
            fontSize: '30px',
            overflowX: 'hidden'
        }}>
            <InfiniteLoader
                isRowLoaded={isRowLoaded}
                loadMoreRows={loadMoreRows}
                rowCount={remoteRowCount}
                treshold={1}
                minimumBatchSize={0}>
                {({onRowsRendered, registerChild}) => (
                    <AutoSizer>
                        {({width, height}) => (
                            <List
                                onRowsRendered={onRowsRendered}
                                ref={registerChild}
                                width={width}
                                height={height}
                                rowHeight={cache.current.rowHeight}
                                deferredMeasurementCache={cache.current}
                                rowCount={list.length}
                                rowRenderer={({key, index, style, parent}) => {
                                    const listElem = list[index]
                                    return (
                                        <CellMeasurer key={key}
                                                      cache={cache.current} parent={parent}
                                                      columnIndex={0} rowIndex={index}>
                                            <div style={style} key={listElem.id}>{listElem.title}</div>
                                        </CellMeasurer>)
                                }}
                            />
                        )}
                    </AutoSizer>
                )}
            </InfiniteLoader>
        </div>
    )
}

export async function getServerSideProps({req}) {
    const pageData = await fetch(`https://jsonplaceholder.typicode.com/photos?_limit=40&_page=1`)
        .then(response => response.json())


    return {
        props: {pageData}
    };
}
