import {
    createContext,
    useContext,
    useState,
    Dispatch,
    SetStateAction,
    ReactNode
} from 'react';

import { RedactedUserType } from '@util/types';



interface UserContextType {
    user: RedactedUserType | null;
    setUser: Dispatch<SetStateAction<RedactedUserType | null>>;
}



const UserContext = createContext<UserContextType>({ 
    user: null, 
    setUser: () => null
});



export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<RedactedUserType | null>(null);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}



export const useUser = () => useContext(UserContext);