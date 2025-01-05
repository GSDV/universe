// Determines if the tab screen needs to be refreshed

import React, { createContext, useContext, useEffect, useState } from 'react';



const RefreshContext = createContext<{ 
    refreshMap: Map<string, boolean>,
    setRefresh: (input: string, refresh: boolean) => void,
    getRefresh: (input: string) => boolean
}>({ 
    refreshMap: new Map<string, boolean>(), 
    setRefresh: (input: string, refresh: boolean) => {},
    getRefresh: (input: string) => true
});



export const RefreshProvider = ({ children }: { children: React.ReactNode }) => {
    const [refreshMap, setMap] = useState(new Map<string, boolean>());

    const setRefresh = (input: string, refresh: boolean) => {
        setMap(prevMap => {
            const updatedMap = new Map(prevMap);
            updatedMap.set(input, refresh);
            return updatedMap;
        });
    }

    const getRefresh = (input: string) => {
        const res = refreshMap.get(input);
        if (res === undefined) return false;
        return res;
    }

    useEffect(() => {
        setMap(prevMap => {
            const updatedMap = new Map(prevMap);
            updatedMap.set('account', false);
            updatedMap.set('search', false);
            updatedMap.set('feed', false);
            updatedMap.set('explore', false);
            return updatedMap;
        });
    }, []);

    return (
        <RefreshContext.Provider value={{ refreshMap, setRefresh, getRefresh }}>
            {children}
        </RefreshContext.Provider>
    );
}



export const useRefresh = () => useContext(RefreshContext);