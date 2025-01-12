import { UserProvider } from './UserProvider';
import { PostStoreProvider } from './PostStoreProvider';
import { OperationProvider } from './OperationProvider';



export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <UserProvider>
        <PostStoreProvider>
        <OperationProvider>
            {children}
        </OperationProvider>
        </PostStoreProvider>
        </UserProvider>
    );
}