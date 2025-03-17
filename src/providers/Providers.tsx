import { ReactNode } from 'react';

import { UserProvider } from './UserProvider';
import { AccountPostProvider } from './AccountPostProvider';
import { LocationProvider } from './LocationProvider';



export default function Providers({ children }: { children: ReactNode }) {
    return (
        <UserProvider>
        <AccountPostProvider>
        <LocationProvider>
            {children}
        </LocationProvider>
        </AccountPostProvider>
        </UserProvider>
    );
}