Aquí tienes un ejemplo de un archivo README para el conjunto de rutas que has proporcionado para el sistema de gestión de archivos en Laravel. Este README está diseñado para que otros desarrolladores o usuarios puedan entender rápidamente cómo funciona la API y cómo interactuar con ella.

---

# Documentación del API de Gestión de Archivos

Este documento describe las rutas y la funcionalidad de la API de gestión de archivos desarrollada en Laravel. Esta API permite a los usuarios autenticados gestionar archivos y carpetas a través de una serie de endpoints.

## Índice

- [Introducción](#introducción)
- [Autenticación](#autenticación)
- [Rutas](#rutas)
    - [Listar archivos y carpetas](#listar-archivos-y-carpetas)
    - [Subir archivos](#subir-archivos)
    - [Eliminar archivos](#eliminar-archivos)
    - [Crear carpetas](#crear-carpetas)
    - [Actualizar (renombrar) carpetas](#actualizar-renombrar-carpetas)
    - [Descargar archivos](#descargar-archivos)
    - [Renombrar archivos](#renombrar-archivos)
    - [Copiar archivos](#copiar-archivos)
    - [Mover archivos](#mover-archivos)
    - [Eliminar carpetas](#eliminar-carpetas)
    - [Ver archivos](#ver-archivos)
    - [Obtener URL pública de un archivo](#obtener-url-pública-de-un-archivo)
    - [Descargar carpetas como ZIP](#descargar-carpetas-como-zip)
    - [Obtener estructura de archivos y carpetas](#obtener-estructura-de-archivos-y-carpetas)
    - [Obtener jerarquía y empresa del usuario](#obtener-jerarquía-y-empresa-del-usuario)

## Introducción

La API de gestión de archivos permite a los usuarios realizar diversas operaciones sobre archivos y carpetas, asegurando que solo los usuarios autenticados puedan acceder a estas funciones.

## Autenticación

Todas las rutas de esta API requieren que el usuario esté autenticado como `employee`. Asegúrate de incluir un token de autenticación en tus solicitudes.

## Rutas

### Listar archivos y carpetas

- **Método:** `GET`
- **Ruta:** `/filemanager/files`
- **Descripción:** Obtiene la lista de archivos y carpetas disponibles para el usuario autenticado.

### Subir archivos

- **Método:** `POST`
- **Ruta:** `/filemanager/files/upload`
- **Descripción:** Permite al usuario subir un archivo al servidor.

### Eliminar archivos

- **Método:** `DELETE`
- **Ruta:** `/filemanager/files/delete`
- **Descripción:** Elimina un archivo del servidor.

### Crear carpetas

- **Método:** `POST`
- **Ruta:** `/filemanager/folders/create`
- **Descripción:** Crea una nueva carpeta en el sistema.

### Actualizar (renombrar) carpetas

- **Método:** `PUT`
- **Ruta:** `/filemanager/folders/update`
- **Descripción:** Renombra una carpeta existente.

### Descargar archivos

- **Método:** `GET`
- **Ruta:** `/filemanager/files/download`
- **Descripción:** Descarga un archivo específico del servidor.

### Renombrar archivos

- **Método:** `POST`
- **Ruta:** `/filemanager/files/rename-file`
- **Descripción:** Renombra un archivo existente.

### Copiar archivos

- **Método:** `POST`
- **Ruta:** `/filemanager/files/copy-file`
- **Descripción:** Copia un archivo a una nueva ubicación.

### Mover archivos

- **Método:** `POST`
- **Ruta:** `/filemanager/files/move-file`
- **Descripción:** Mueve un archivo a una nueva ubicación.

### Eliminar carpetas

- **Método:** `DELETE`
- **Ruta:** `/filemanager/folders/delete`
- **Descripción:** Elimina una carpeta del sistema.

### Ver archivos

- **Método:** `GET`
- **Ruta:** `/filemanager/files/view`
- **Descripción:** Muestra un archivo específico.

### Obtener URL pública de un archivo

- **Método:** `GET`
- **Ruta:** `/filemanager/public-file-url`
- **Descripción:** Obtiene la URL pública de un archivo.

### Descargar carpetas como ZIP

- **Método:** `GET`
- **Ruta:** `/filemanager/folders/download`
- **Descripción:** Descarga una carpeta en formato ZIP.

### Obtener estructura de archivos y carpetas

- **Método:** `GET`
- **Ruta:** `/filemanager/files-tree`
- **Descripción:** Devuelve toda la estructura de archivos y carpetas.

### Obtener jerarquía y empresa del usuario

- **Método:** `GET`
- **Ruta:** `/filemanager/hierarchy-company`
- **Descripción:** Devuelve la jerarquía y la empresa a la que pertenece el usuario.

---
