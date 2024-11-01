<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Middleware;
use Illuminate\Support\Facades\Auth;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determina la versión actual del asset.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define las props que se comparten por defecto.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function share(Request $request): array
    {
        $user = Auth::user();

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name_1' => $user->last_name_1,
                    'last_name_2' => $user->last_name_2,
                    'position_id' => $user->position_id,
                    'username' => $user->username,
                    'registered_at' => $user->registered_at,
                    'last_login_at' => $user->last_login_at,
                    'company_id' => $user->position->company_id ?? null,
                    'position' => [
                        'id' => $user->position->id,
                        'name' => $user->position->name,
                        'company_id' => $user->position->company_id,
                        'hierarchy_level' => $user->position->hierarchy_level,
                        'company' => [
                            'id' => $user->position->company->id,
                            'name' => $user->position->company->name,
                        ],
                        'hierarchy_level_detail' => [
                            'level' => $user->position->hierarchy_level_detail->level,
                            'name' => $user->position->hierarchy_level_detail->name,
                        ],
                    ],
                    'permissions' => $user->permissions->pluck('name'), // Array de nombres de permisos
                ] : null,
            ],
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }
}
