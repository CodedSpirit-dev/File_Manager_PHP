// src/utils/permissionMapping.ts

export const permissionDescriptions: { [key: string]: string } = {
    // Permisos para Empresas
    'can_create_companies': 'Crear empresas',
    'can_delete_companies': 'Eliminar empresas',
    'can_update_companies': 'Modificar empresas',

    // Permisos para Puestos
    'can_create_positions': 'Crear nuevos puestos',
    'can_update_positions': 'Editar puestos',
    'can_delete_positions': 'Eliminar puestos',

    // Permisos para Usuarios
    'can_create_users': 'Crear usuarios',
    'can_delete_users': 'Eliminar usuarios',
    'can_update_users': 'Modificar usuarios',
    'can_view_company_users': 'Ver compañeros de la empresa',
    'can_view_all_users': 'Ver todos los usuarios',

    // Permisos para Gestión de Archivos y Carpetas
    'can_view_file_explorer': 'Ver explorador de archivos',
    'can_open_files': 'Abrir archivos',
    'can_upload_files_and_folders': 'Subir archivos y carpetas',
    'can_create_folders': 'Crear carpetas',
    'can_download_files_and_folders': 'Descargar archivos y carpetas',
    'can_copy_files': 'Copiar archivos',
    'can_move_files': 'Mover archivos',
    'can_rename_files_and_folders': 'Cambiar nombre de archivos y carpetas',
    'can_delete_files_and_folders': 'Eliminar archivos y carpetas',
};
