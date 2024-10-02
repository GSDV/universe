// Custom types for use in both frontend and backend
// File must be the same between the two, but each repo needs its own verison of it



export interface UserType {
    id: string;
    username: string;
    displayName: string;
    pfpKey: string;
    password: string;
    salt: string;
}

export interface RedactedUserType {
    id: string;
    username: string;
    displayName: string;
    pfpKey: string;
}