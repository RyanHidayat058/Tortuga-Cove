<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class OtpService
{
    /**
     * Generate a new 6-digit OTP code for a user, save it, and log it.
     */
    public function generateOtpForUser(User $user): string
    {
        $code = (string) rand(100000, 999999);

        $user->forceFill([
            'otp_code' => $code,
            'otp_expires_at' => Carbon::now()->addMinutes(10),
            'is_otp_verified' => false,
        ])->save();

        Log::info("=== MOCK OTP EMAIL SENT TO: {$user->email} ===");
        Log::info("Code: {$code}");
        Log::info('Expires in: 10 minutes');
        Log::info('==============================================');

        return $code;
    }

    /**
     * Verify the user's OTP code.
     */
    public function verifyOtpForUser(User $user, string $code): bool
    {
        if (! $user->otp_code || ! $user->otp_expires_at) {
            return false;
        }

        if (Carbon::now()->isAfter($user->otp_expires_at)) {
            return false;
        }

        if ($user->otp_code === $code) {
            $user->forceFill([
                'otp_code' => null,
                'otp_expires_at' => null,
                'is_otp_verified' => true,
            ])->save();

            return true;
        }

        return false;
    }
}
