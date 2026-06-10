export interface AuthUser {
    id: number;
    email: string;
    is_superuser?: boolean;
    is_customer?: boolean;
    is_driver?: boolean;
    is_restaurant?: boolean;
}
