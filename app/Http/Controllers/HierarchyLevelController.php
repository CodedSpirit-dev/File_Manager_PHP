<?php

namespace App\Http\Controllers;

use App\Models\HierarchyLevel;
use Illuminate\Http\Request;

class HierarchyLevelController extends Controller
{
    public function index()
    {
        $hierarchyLevels = HierarchyLevel::all(['level', 'name']);
        return response()->json($hierarchyLevels);
    }
}
