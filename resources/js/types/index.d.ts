export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};

export interface Employee {
    'id': number;
    'first_name': string;
    'last_name_1': string;
    'last_name_2': string;
    'position_id': number;
    'hierarchy_level': number;
    'username': string;
    'password': string;
    'registered_at': string;
    'company_id': number;
}

export type EmployeePageProps <
T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
auth: {
    employee: Employee;
};
};
