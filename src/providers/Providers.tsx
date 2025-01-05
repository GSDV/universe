import { RefreshProvider } from './RefreshProvider';
import { UserProvider } from './UserProvider';
import { OperationProvider } from './OperationProvider';



export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <RefreshProvider>
        <UserProvider>
        <OperationProvider>
            {children}
        </OperationProvider>
        </UserProvider>
        </RefreshProvider>
    );
}