import { UserProvider } from './UserProvider';
import { OperationProvider } from './OperationProvider';



export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <UserProvider>
        <OperationProvider>
            {children}
        </OperationProvider>
        </UserProvider>
    );
}