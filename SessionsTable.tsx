import { MouseEventHandler, useCallback, useEffect, useState } from 'react';

type SessionData = {
    id: number;
    coach: string;
    duration: string;
    date: string;
    typeOfTraining: string;
};

type SortKeys = keyof SessionData;
type SortOrder = 'ascn' | 'desc';

function sortData({
    tableData,
    sortKey,
    reverse,
}: {
    tableData: SessionData[];
    sortKey: SortKeys;
    reverse: boolean;
}) {
    if (!sortKey) return tableData;

    const sortedData = [...tableData].sort((a, b) =>
        a[sortKey] > b[sortKey] ? 1 : -1
    );

    return reverse ? sortedData.reverse() : sortedData;
}

function SortButton({
    sortOrder,
    columnKey,
    sortKey,
    onClick,
}: {
    sortOrder: SortOrder;
    columnKey: SortKeys;
    sortKey: SortKeys;
    onClick: MouseEventHandler<HTMLButtonElement>;
}) {
    return (
        <button
            style={{ backgroundColor: 'black' }}
            onClick={onClick}
            className={`${sortKey === columnKey && sortOrder === 'desc'
                    ? 'sort-button sort-reverse'
                    : 'sort-button'
                }`}
        >
            ▲
        </button>
    );
}

function SessionTable({
    onRowClick,
}: {
    onRowClick: (session: SessionData) => void;
}) {
    const [data, setData] = useState<SessionData[]>([]);
    const [sortKey, setSortKey] = useState<SortKeys>('id');
    const [sortOrder, setSortOrder] = useState<SortOrder>('ascn');
    const [selectedId, setSelectedId] = useState<number | null>(1);

    const headers: { key: SortKeys; label: string }[] = [
        { key: 'id', label: 'Session' },
        { key: 'coach', label: 'Coach' },
        { key: 'duration', label: 'Duration' },
        { key: 'date', label: 'Date' },
        { key: 'typeOfTraining', label: 'Training' },
    ];

    useEffect(() => {
        fetch('http://localhost:5000/api/sessions')
            .then((res) => res.json())
            .then((json) => {
                if (Array.isArray(json)) {
                    const today = new Date();
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(today.getDate() - 6); // last 7 days including today

                    const weeklySessions = json
                        .filter((s: any) => {
                            const sessionDate = new Date(s.date.replace(/\//g, '-')); // convert to YYYY-MM-DD
                            return sessionDate >= sevenDaysAgo && sessionDate <= today;
                        })
                        .map((s: any) => ({
                            id: s.session_id,
                            coach: s.coach,
                            duration: s.duration,
                            date: s.date,
                            typeOfTraining: s.training.charAt(0).toUpperCase() + s.training.slice(1),
                        }));

                    setData(weeklySessions);
                } else {
                    throw new Error('Invalid format');
                }
            })
            .catch((err) => {
                console.warn('Failed to fetch sessions:', err.message);
                setData([]);
            });
    }, []);



    const sortedData = useCallback(
        () => sortData({ tableData: data, sortKey, reverse: sortOrder === 'desc' }),
        [data, sortKey, sortOrder]
    );

    function changeSort(key: SortKeys) {
        setSortOrder(sortOrder === 'ascn' ? 'desc' : 'ascn');
        setSortKey(key);
    }

    function handleRowClick(session: SessionData) {
        setSelectedId(session.id);
        onRowClick(session);
    }

    return (
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#ccc', zIndex: 1 }}>
                    <tr>
                        {headers.map((row) => (
                            <td key={row.key} style={{ border: '1px solid #999', padding: '4px' }}>
                                {row.label}{' '}
                                <SortButton
                                    columnKey={row.key}
                                    onClick={() => changeSort(row.key)}
                                    {...{ sortOrder, sortKey }}
                                />
                            </td>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedData().map((session) => (
                        <tr
                            key={session.id}
                            style={{
                                cursor: 'pointer',
                                backgroundColor: selectedId === session.id ? 'lightblue' : '#e97462',
                                border: '1px solid #999',
                            }}
                            onClick={() => handleRowClick(session)}
                        >
                            <td>{session.id}</td>
                            <td>{session.coach}</td>
                            <td>{session.duration}</td>
                            <td>{session.date}</td>
                            <td>{session.typeOfTraining}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

}

export default SessionTable;
