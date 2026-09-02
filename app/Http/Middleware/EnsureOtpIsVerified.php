<?php

namespace App\Http\Middleware;

use App\Models\Game;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureOtpIsVerified
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = $request->user();

            // Update last_seen_at (throttled to save database writes)
            if (! $user->last_seen_at || $user->last_seen_at->diffInSeconds(now()) > 10) {
                $user->forceFill(['last_seen_at' => now()])->save();
            }

            // Track active board game being played
            if ($request->routeIs('games.show')) {
                $uuid = $request->route('uuid');
                if ($uuid) {
                    $game = Game::where('uuid', $uuid)->first();
                    if ($game && $user->current_game_id !== $game->id) {
                        $user->forceFill(['current_game_id' => $game->id])->save();
                    }
                }
            } elseif ($user->current_game_id && ! $request->routeIs('games.state')) {
                // Clear active game if they navigated away
                $user->forceFill(['current_game_id' => null])->save();
            }

            // If user is not OTP verified and not on the verification page or logout, redirect to verify-otp
            if (! $user->is_otp_verified &&
                ! $request->routeIs('otp.verify') &&
                ! $request->routeIs('otp.verify.store') &&
                ! $request->routeIs('otp.resend') &&
                ! $request->routeIs('logout')) {

                if ($request->expectsJson() || $request->is('friends*') || $request->is('games/*/state') || $request->is('games/*/check') || $request->is('api/*')) {
                    return response()->json(['message' => 'OTP verification required.'], 403);
                }

                return redirect()->route('otp.verify');
            }

            // If user IS OTP verified, but tries to access verification page, redirect to dashboard
            if ($user->is_otp_verified &&
                ($request->routeIs('otp.verify') || $request->routeIs('otp.verify.store'))) {
                return redirect()->route('dashboard');
            }
        }

        return $next($request);
    }
}
