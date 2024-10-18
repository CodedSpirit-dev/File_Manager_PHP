<?php

namespace App\Http\Controllers;

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CounterController extends Controller
{
    public function increment(Request $request)
    {
        $count = session()->get('count', 0);
        $count++;
        session(['count' => $count]);

        return response()->json(['count' => $count]);
    }
}
