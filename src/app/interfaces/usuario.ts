export interface Usuario {
  token: string;
  subscriptionType: 'Free' | 'Trial' | 'Pro';
  isAdmin?: boolean;
}