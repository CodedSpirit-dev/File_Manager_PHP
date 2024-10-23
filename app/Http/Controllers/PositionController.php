<?php

namespace App\Http\Controllers;

use App\Models\Position;
use Illuminate\Http\Request;

class PositionController extends Controller
{
    public function index()
    {
        $positions = Position::all(['id', 'name', 'company_id', 'hierarchy_level']);
        return response()->json($positions);
    }

    public function store(){
        $position = Position::create([
            'name' => request('name'),
            'company_id' => request('company_id'),
            'hierarchy_level' => request('hierarchy_level')
        ]);

        return response()->json($position);
    }
}
