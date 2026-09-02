<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\OtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OtpVerificationController extends Controller
{
    protected OtpService $otpService;

    public function __construct(OtpService $otpService)
    {
        $this->otpService = $otpService;
    }

    /**
     * Display the OTP verification view.
     */
    public function show(Request $request): Response
    {
        // For development convenience, we pass the code if in local mode,
        // so the user can easily see it in their browser/UI.
        $lastOtp = null;
        if (config('app.env') === 'local') {
            $lastOtp = $request->user()->otp_code;
        }

        return Inertia::render('Auth/VerifyOtp', [
            'status' => session('status'),
            'email' => $request->user()->email,
            'devOtp' => $lastOtp, // Mock email preview
        ]);
    }

    /**
     * Handle the OTP verification request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $verified = $this->otpService->verifyOtpForUser($request->user(), $request->code);

        if (! $verified) {
            throw ValidationException::withMessages([
                'code' => __('The provided One-Time Password is invalid or has expired.'),
            ]);
        }

        $intended = session()->pull('url.intended');
        if ($intended) {
            $path = parse_url($intended, PHP_URL_PATH) ?? '';
            if (str_starts_with($path, '/friends') || str_contains($path, '/state') || str_contains($path, '/check') || str_contains($path, '/api')) {
                $intended = null;
            }
        }

        return redirect()->to($intended ?: route('dashboard', absolute: false));
    }

    /**
     * Resend the OTP verification code.
     */
    public function resend(Request $request): RedirectResponse
    {
        $this->otpService->generateOtpForUser($request->user());

        return back()->with('status', 'A new verification code has been generated and sent to your email log.');
    }
}
