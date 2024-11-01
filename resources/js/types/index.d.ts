// src/types/index.ts

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
        employee: Employee;
    };
};

export interface Employee {
    id: number;
    first_name: string;
    last_name_1: string;
    last_name_2: string;
    position_id: number;
    username: string;
    registered_at: string;
    last_login_at?: string;
    company_id?: number | null;
    position: Position;
    permissions: string[]; // Array de nombres de permisos
}


export type EmployeePageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        employee: Employee;
        user: User;
    };
};

export interface Company {
    id: number;
    name: string;
}

export interface Position {
    id: number;
    name: string;
    company_id: number;
    hierarchy_level: number;
    company: Company;
    hierarchy_level_detail: HierarchyLevel;
}

export interface HierarchyLevel {
    level: number;
    name: string;
}

export interface Permission {
    id: number;
    name: string;
    description: string;
}
