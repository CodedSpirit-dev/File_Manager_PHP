// src/types/index.ts

export interface User {
    position: ((prevState: (number | null)) => (number | null)) | number | null;
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    permissions: string[]; // Asegúrate de que este campo esté presente

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
    phone_number: string;
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
    positions_count: number;
    positions_count: number;
    id: number;
    name: string;
    employees_count: number;
}

export interface Position {
    id: number;
    name: string;
    company_id: number;
    company_name: string;
    employees_count: number;
    hierarchy_level: number;
    company: Company;
    hierarchy_level_detail: HierarchyLevel;
    permissions: Permission[];
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

export interface Permissions {
    // Permisos para Empresas
    can_create_companies: Permission;
    can_delete_companies: Permission;
    can_update_companies: Permission;

    // Permisos para Puestos
    can_create_positions: Permission;
    can_update_positions: Permission;
    can_delete_positions: Permission;

    // Permisos para Usuarios
    can_create_users: Permission;
    can_delete_users: Permission;
    can_update_users: Permission;
    can_view_company_users: Permission;
    can_view_all_users: Permission;

    // Permisos para Gestión de Archivos y Carpetas
    can_view_file_explorer: Permission;
    can_open_files: Permission;
    can_upload_files_and_folders: Permission;
    can_create_folders: Permission;
    can_download_files_and_folders: Permission;
    can_copy_files: Permission;
    can_move_files: Permission;
    can_rename_files_and_folders: Permission;
    can_delete_files_and_folders: Permission;
}

