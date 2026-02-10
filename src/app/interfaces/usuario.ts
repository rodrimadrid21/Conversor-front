export interface Usuario {
    UserId: number;
    FirstName: string;
    LastName: string;
    UserName: string;
    token: string;
    isAdmin: boolean;
    subscriptionType?: 'Free' | 'Trial' | 'Pro';

}
