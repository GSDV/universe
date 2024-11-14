import { RefreshProvider } from './RefreshProvider';
import { UserProvider } from './UserProvider';



export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <RefreshProvider>
        <UserProvider>
            {children}
        </UserProvider>
        </RefreshProvider>
    );
}