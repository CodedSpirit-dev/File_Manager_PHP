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
}
