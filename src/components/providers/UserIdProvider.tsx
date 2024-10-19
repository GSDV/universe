import React, { createContext, useContext, useState } from 'react';

const UserIdContext = createContext({ userId: '', setUserId: (input: string) => {} });

export const UserIdProvider = ({ children }: { children: React.ReactNode }) => {
    const [userId, setUserId] = useState<string>('');

    return (
        <UserIdContext.Provider value={{ userId, setUserId }}>
            {children}
        </UserIdContext.Provider>
    );
}

export const useAccount = () => useContext(UserIdContext);