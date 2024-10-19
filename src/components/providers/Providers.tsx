import { UserIdProvider } from './UserIdProvider';



export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <UserIdProvider>
            {children}
        </UserIdProvider>
    );
}