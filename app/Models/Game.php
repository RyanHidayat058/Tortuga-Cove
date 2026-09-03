<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Game extends Model
{
    protected $fillable = [
        'uuid',
        'creator_id',
        'status',
        'winner_id',
        'current_player_index',
        'board_state',
        'game_type',
        'difficulty',
        'max_players',
    ];

    protected $casts = [
        'board_state' => 'array',
        'current_player_index' => 'integer',
        'max_players' => 'integer',
    ];

    /**
     * Get the user who created this game.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    /**
     * Get the user who won this game.
     */
    public function winner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'winner_id');
    }

    /**
     * Get the players associated with this game.
     */
    public function gamePlayers(): HasMany
    {
        return $this->hasMany(GamePlayer::class)->orderBy('player_index');
    }
}
