<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;

#[Fillable(['name', 'email', 'username', 'hashtag', 'password', 'otp_code', 'otp_expires_at', 'is_otp_verified', 'last_seen_at', 'current_game_id'])]
#[Hidden(['password', 'remember_token', 'otp_code'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'otp_expires_at' => 'datetime',
            'is_otp_verified' => 'boolean',
            'last_seen_at' => 'datetime',
        ];
    }

    /**
     * Get the user's active game.
     */
    public function currentGame(): BelongsTo
    {
        return $this->belongsTo(Game::class, 'current_game_id');
    }

    /**
     * Check if user is online (active in the last 60 seconds).
     */
    public function getIsOnlineAttribute(): bool
    {
        if (! $this->last_seen_at) {
            return false;
        }

        return abs(now()->timestamp - $this->last_seen_at->timestamp) <= 60;
    }

    /**
     * Get activity status string.
     */
    public function getActivityStatusAttribute(): string
    {
        if (! $this->is_online) {
            return 'offline';
        }

        if ($this->current_game_id) {
            $game = Game::find($this->current_game_id);
            if ($game && $game->status === 'playing') {
                if (($game->game_type ?? 'splendor') === 'snakes') {
                    return 'Playing Snakes & Ladders: Ular Tangga';
                }

                return 'Playing Splendor: Corsair\'s Cove';
            }
        }

        return 'online';
    }

    /**
     * Get user's accepted friends.
     */
    public function getFriendsAttribute(): Collection
    {
        $sentIds = Friendship::where('user_id', $this->id)
            ->where('status', 'accepted')
            ->pluck('friend_id')
            ->toArray();

        $receivedIds = Friendship::where('friend_id', $this->id)
            ->where('status', 'accepted')
            ->pluck('user_id')
            ->toArray();

        $friendIds = array_merge($sentIds, $receivedIds);

        return User::whereIn('id', $friendIds)->get();
    }
}
