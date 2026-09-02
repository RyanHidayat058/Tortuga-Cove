<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GamePlayer extends Model
{
    protected $fillable = [
        'game_id',
        'user_id',
        'player_index',
        'is_ready',
    ];

    protected $casts = [
        'game_id' => 'integer',
        'user_id' => 'integer',
        'player_index' => 'integer',
        'is_ready' => 'boolean',
    ];

    /**
     * Get the game this player is part of.
     */
    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    /**
     * Get the user info of this player.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
