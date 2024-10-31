<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\Company;

class CompanyController extends Controller
{
    public function index()
    {
        $companies = Company::orderBy("name", "asc")->get();
        return response()->json($companies);
    }

    /**
     * Display the company registration form.
     *
     * @return \Illuminate\View\View
     */
    public function create()
    {
        return view('admin.companies.create');
    }

    /**
     * Store a newly created company in the database.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validationRules = [
            'name' => 'required|string|max:255|unique:companies,name',
        ];

        $validator = Validator::make($request->all(), $validationRules);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $company = new Company();
        $company->name = $request->name;
        $company->save();

        $companyFolderPath = 'public/' . $company->name;

        if (!Storage::exists($companyFolderPath)) {
            Storage::makeDirectory($companyFolderPath);
        }

        return response()->json([
            'message' => 'Company registered and folder created successfully.',
            'company' => $company,
        ], 201);
    }
}
