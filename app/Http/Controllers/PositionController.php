<?php

namespace App\Http\Controllers;

use App\Models\Position;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator; // Para validación de datos

class PositionController extends Controller
{
    public function index()
    {
        $positions = Position::orderBy('name')->get();
        return response()->json($positions);
    }

    public function store(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'company_id' => 'required|integer|exists:companies,id',
            'hierarchy_level' => 'required|integer'
        ]);

        // Si la companñia ya tiene un cargo con el mismo nombre, se retorna un error
        $positionInCompany = Position::where('name', request('name'))->where('company_id', request('company_id'))->first();

        if ($positionInCompany) {
            return response()->json([
                'message' => 'The company already has a position with the same name'
            ], 480);
        }

        $position = Position::create([
            'name' => request('name'),
            'company_id' => request('company_id'),
            'hierarchy_level' => request('hierarchy_level')
        ]);

        return response()->json($position);
    }
}
