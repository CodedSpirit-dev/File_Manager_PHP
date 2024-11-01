# Permissions Implementation Guide

This guide provides an overview of how permissions are implemented in the project, specifically focusing on the `Home.tsx` component. The permission system ensures that users have appropriate access to various parts of the application based on their roles and permissions.

## Table of Contents

- [Overview](#overview)
- [Permissions Context](#permissions-context)
- [Using the `hasPermission` Utility](#using-the-haspermission-utility)
- [Wrapping Components with `PermissionsProvider`](#wrapping-components-with-permissionsprovider)
- [Implementing Permissions in `Home.tsx`](#implementing-permissions-in-hometsx)
- [Adding New Permissions](#adding-new-permissions)
- [Example: Admin Dropdown](#example-admin-dropdown)
- [Handling Permissions in Other Components](#handling-permissions-in-other-components)
- [Conclusion](#conclusion)

## Overview

The permissions system is designed to control access to various components and functionalities within the application. It leverages React's Context API to provide permission data throughout the component tree, enabling components to conditionally render based on user permissions.

## Permissions Context

The core of the permissions system is the `PermissionsContext`. This context provides the `hasPermission` function, which components can use to check if the current user possesses a specific permission.

### `PermissionsContext.tsx`

```tsx
// src/contexts/PermissionsContext.tsx

import React, { createContext, useContext } from 'react';
import { EmployeePageProps } from '@/types';
import { usePage } from '@inertiajs/react';

interface PermissionsContextType {
  hasPermission: (permission: string) => boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC = ({ children }) => {
  const { auth } = usePage<EmployeePageProps>().props;
  const employee = auth.employee;

  const hasPermission = (permission: string): boolean => {
    return employee.permissions.includes(permission);
  };

  return (
    <PermissionsContext.Provider value={{ hasPermission }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = (): PermissionsContextType => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};
```

## Using the `hasPermission` Utility

The `hasPermission` function is used to check if the current user has a specific permission. It is accessed via the `usePermissions` hook provided by the `PermissionsContext`.

### Example Usage

```tsx
import { usePermissions } from '@/contexts/PermissionsContext';

const ExampleComponent: React.FC = () => {
  const { hasPermission } = usePermissions();

  return (
    <>
      {hasPermission('can_edit') && <button>Edit</button>}
    </>
  );
};
```

## Wrapping Components with `PermissionsProvider`

To make permissions available throughout your component tree, wrap your main component (e.g., `HomeContent`) with the `PermissionsProvider`.

### In `Home.tsx`

```tsx
import { PermissionsProvider } from '@/contexts/PermissionsContext';

const Home: React.FC = () => {
  return (
    <PermissionsProvider>
      <HomeContent />
    </PermissionsProvider>
  );
};
```

## Implementing Permissions in `Home.tsx`

The `Home.tsx` component utilizes the permissions system to conditionally render buttons and components based on the user's permissions.

### Key Implementations

1. **Accessing Permissions:**

   ```tsx
   const { hasPermission } = usePermissions();
   ```

2. **Conditional Rendering:**

   ```tsx
   {hasPermission('can_read_files') && (
     <Button
       className="btn btn-ghost nav__bar__button hover:text-black"
       onClick={() => renderComponent('FileManager')}
     >
       Explorador de archivos
     </Button>
   )}
   ```

3. **Admin Dropdown:**

   The `AdminDropdown` component likely contains additional permission-based options.

   ```tsx
   <AdminDropdown renderComponent={renderComponent} />
   ```

## Adding New Permissions

To add a new permission:

1. **Define the Permission:**

   Add the new permission string to your backend and ensure it's assigned to relevant user roles.

2. **Update Frontend Permissions:**

   Ensure that the permission is included in the `employee.permissions` array fetched from the backend.

3. **Use the Permission in Components:**

   ```tsx
   {hasPermission('can_new_feature') && <NewFeatureComponent />}
   ```

## Example: Admin Dropdown

Assuming `AdminDropdown` uses permissions to show admin-specific options:

```tsx
// src/Components/AdminDropdown.tsx

import React from 'react';
import { usePermissions } from '@/contexts/PermissionsContext';

interface AdminDropdownProps {
  renderComponent: (componentName: string) => void;
}

const AdminDropdown: React.FC<AdminDropdownProps> = ({ renderComponent }) => {
  const { hasPermission } = usePermissions();

  return (
    <div className="dropdown">
      <button className="btn">Admin</button>
      <div className="dropdown-content">
        {hasPermission('can_create_employee') && (
          <a onClick={() => renderComponent('CreateEmployee')}>Create Employee</a>
        )}
        {hasPermission('can_create_company') && (
          <a onClick={() => renderComponent('CreateCompany')}>Create Company</a>
        )}
        {hasPermission('can_create_position') && (
          <a onClick={() => renderComponent('CreatePosition')}>Create Position</a>
        )}
        {hasPermission('can_view_employees') && (
          <a onClick={() => renderComponent('EmployeeList')}>Employee List</a>
        )}
      </div>
    </div>
  );
};

export default AdminDropdown;
```

## Handling Permissions in Other Components

The same pattern used in `Home.tsx` can be applied to other components:

1. **Import and use the `usePermissions` hook.**
2. **Conditionally render UI elements based on permissions.**

### Example: FileManager Component

```tsx
import React from 'react';
import { usePermissions } from '@/contexts/PermissionsContext';

const FileManager: React.FC = () => {
  const { hasPermission } = usePermissions();

  return (
    <div>
      {hasPermission('can_upload_files') && <UploadButton />}
      {hasPermission('can_delete_files') && <DeleteButton />}
      {/* Rest of the FileManager */}
    </div>
  );
};
```
