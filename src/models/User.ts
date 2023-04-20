export interface User {
    userId: string;
    created: number;
    firstName: string;
    lastName: string;
    verified: boolean;
}

export interface UserIdIndex {
    userId: string;
    created: number;
}
