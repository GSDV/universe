import React, { createContext, useContext, useState } from 'react';

import { RedactedUserType } from '@util/types';



interface UserContextType {
    user: RedactedUserType | null;
    setUser: React.Dispatch<React.SetStateAction<RedactedUserType | null>>;
}



const UserContext = createContext<UserContextType>({ 
    user: null, 
    setUser: () => null
});



export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<RedactedUserType | null>(null);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}



export const useUser = () => useContext(UserContext);