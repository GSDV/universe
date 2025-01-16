import { UserProvider } from './UserProvider';
import { AccountPostProvider } from './AccountPostProvider';



export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <UserProvider>
        <AccountPostProvider>
            {children}
        </AccountPostProvider>
        </UserProvider>
    );
}