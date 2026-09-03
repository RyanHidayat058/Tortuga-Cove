<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\GamePlayer;
use App\Services\GameEngine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\JsonResponse;

class GameController extends Controller
{
    /**
     * Display the games lobby.
     */
    public function index(): Response
    {
        return $this->renderLobby('lobby');
    }

    public function indexDeck(): Response
    {
        return $this->renderLobby('deck');
    }

    public function indexCrew(): Response
    {
        return $this->renderLobby('crew');
    }

    private function renderLobby(string $activeTab): Response
    {
        $userId = Auth::id();

        // Get games that are active (waiting or playing) or finished recently
        $games = Game::with(['creator', 'gamePlayers.user'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($game) use ($userId) {
                $players = $game->gamePlayers;
                $isJoined = $players->contains('user_id', $userId);

                return [
                    'id' => $game->id,
                    'uuid' => $game->uuid,
                    'game_type' => $game->game_type ?? 'splendor',
                    'difficulty' => $game->difficulty ?? 'normal',
                    'creator_id' => $game->creator_id,
                    'creator' => $game->creator->username ?? 'Unknown',
                    'status' => $game->status,
                    'player_count' => $players->count(),
                    'max_players' => $game->max_players ?? 4,
                    'is_joined' => $isJoined,
                    'players' => $players->map(fn ($gp) => $gp->user->username)->toArray(),
                ];
            });

        return Inertia::render('Lobby', [
            'games' => $games,
            'activeTab' => $activeTab,
            'user' => Auth::user(),
        ]);
    }

    /**
     * Create a new game room.
     */
    public function create(Request $request): RedirectResponse
    {
        $request->validate([
            'game_type' => 'nullable|string|in:splendor,snakes,wordle,sudoku',
            'difficulty' => 'nullable|string|in:easy,normal,hard,extreme',
            'max_players' => 'nullable|integer|min:1|max:4',
        ]);

        $user = Auth::user();
        $gameType = $request->input('game_type', 'splendor');
        $difficulty = $request->input('difficulty', 'normal');
        $maxPlayers = $request->input('max_players', 4);

        $game = Game::create([
            'uuid' => (string) Str::uuid(),
            'creator_id' => $user->id,
            'status' => 'waiting',
            'game_type' => $gameType,
            'difficulty' => $difficulty,
            'max_players' => $maxPlayers,
        ]);

        GamePlayer::create([
            'game_id' => $game->id,
            'user_id' => $user->id,
            'player_index' => 0,
        ]);

        return redirect()->route('games.show', $game->uuid);
    }

    /**
     * Join an existing game room.
     */
    public function join(string $uuid): RedirectResponse
    {
        $game = Game::where('uuid', $uuid)->firstOrFail();
        $user = Auth::user();

        // Check if already in game
        $existingPlayer = GamePlayer::where('game_id', $game->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingPlayer) {
            return redirect()->route('games.show', $game->uuid);
        }

        if ($game->status !== 'waiting') {
            return redirect()->route('lobby')->with('error', 'That ship has already sailed, matey!');
        }

        $playerCount = GamePlayer::where('game_id', $game->id)->count();
        if ($playerCount >= ($game->max_players ?? 4)) {
            return redirect()->route('lobby')->with('error', 'The crew is full! Maximum '.($game->max_players ?? 4).' pirates per ship.');
        }

        GamePlayer::create([
            'game_id' => $game->id,
            'user_id' => $user->id,
            'player_index' => $playerCount,
        ]);

        return redirect()->route('games.show', $game->uuid);
    }

    /**
     * Show the game room.
     */
    public function show(string $uuid): Response|RedirectResponse
    {
        $game = Game::with(['creator', 'gamePlayers.user'])->where('uuid', $uuid)->firstOrFail();
        $user = Auth::user();

        // Check if player is in game
        $isJoined = $game->gamePlayers->contains('user_id', $user->id);

        if (! $isJoined) {
            if ($game->status === 'waiting') {
                $playerCount = $game->gamePlayers->count();
                if ($playerCount < ($game->max_players ?? 4)) {
                    // Auto-join the player
                    GamePlayer::create([
                        'game_id' => $game->id,
                        'user_id' => $user->id,
                        'player_index' => $playerCount,
                    ]);

                    // Refresh relations
                    $game->load(['gamePlayers.user']);
                } else {
                    return redirect()->route('lobby')->with('error', 'Crew is full.');
                }
            } else {
                return redirect()->route('lobby')->with('error', 'Ye are not part of this crew.');
            }
        }

        $component = match ($game->game_type ?? 'splendor') {
            'snakes' => 'Snakes/GameRoom',
            'wordle' => 'Wordle/GameRoom',
            'sudoku' => 'Sudoku/GameRoom',
            default => 'Splendor/GameRoom',
        };

        return Inertia::render($component, [
            'game' => [
                'id' => $game->id,
                'uuid' => $game->uuid,
                'creator_id' => $game->creator_id,
                'status' => $game->status,
                'current_player_index' => $game->current_player_index,
                'winner_id' => $game->winner_id,
                'board_state' => $game->board_state,
                'game_type' => $game->game_type ?? 'splendor',
                'difficulty' => $game->difficulty ?? 'normal',
                'max_players' => $game->max_players ?? 4,
                'creator' => $game->creator,
            ],
            'gamePlayers' => $game->gamePlayers->map(fn ($gp) => [
                'user_id' => $gp->user_id,
                'name' => $gp->user?->name ?? 'Pirate',
                'username' => $gp->user?->username ?? '',
                'hashtag' => $gp->user?->hashtag ?? '0000',
                'is_creator' => $gp->user_id === $game->creator_id,
                'player_index' => $gp->player_index,
                'is_ready' => (bool) $gp->is_ready,
                'user' => [
                    'id' => $gp->user?->id,
                    'name' => $gp->user?->name,
                    'username' => $gp->user?->username,
                    'hashtag' => $gp->user?->hashtag,
                ],
            ])->toArray(),
            'authUserId' => $user->id,
        ]);
    }

    /**
     * Start the game (Creator only).
     */
    public function start(string $uuid, GameEngine $engine): RedirectResponse
    {
        $game = Game::where('uuid', $uuid)->firstOrFail();
        $user = Auth::user();

        if ($game->creator_id !== $user->id) {
            return back()->withErrors(['error' => 'Only the captain who created this ship can set sail!']);
        }

        if ($game->status !== 'waiting') {
            return back()->withErrors(['error' => 'The voyage has already started.']);
        }

        $players = $game->gamePlayers;
        if (($game->max_players ?? 4) > 1 && count($players) < 2) {
            return back()->withErrors(['error' => 'Ye need at least 2 pirates to start a multiplayer game!']);
        }

        // Check if everyone is ready
        foreach ($players as $p) {
            if ($p->user_id !== $game->creator_id && ! $p->is_ready) {
                return back()->withErrors(['error' => 'Not all crew members are ready!']);
            }
        }

        $engine->initGame($game, $players->map->user->all());

        return redirect()->route('games.show', $game->uuid);
    }

    public function ready(string $uuid): RedirectResponse
    {
        $game = Game::where('uuid', $uuid)->firstOrFail();
        $user = Auth::user();

        if ($game->status !== 'waiting') {
            return back()->withErrors(['error' => 'Cannot toggle ready after game starts.']);
        }

        $player = GamePlayer::where('game_id', $game->id)->where('user_id', $user->id)->first();
        if ($player && $player->user_id !== $game->creator_id) {
            $player->is_ready = ! $player->is_ready;
            $player->save();
        }

        return back();
    }

    public function kick(Request $request, string $uuid): RedirectResponse
    {
        $game = Game::where('uuid', $uuid)->firstOrFail();
        $user = Auth::user();

        if ($game->creator_id !== $user->id) {
            return back()->withErrors(['error' => 'Only the captain can kick!']);
        }
        if ($game->status !== 'waiting') {
            return back()->withErrors(['error' => 'Cannot kick after game starts.']);
        }

        $userIdToKick = $request->input('user_id');
        if ($userIdToKick == $game->creator_id) {
            return back()->withErrors(['error' => 'You cannot kick yourself!']);
        }

        GamePlayer::where('game_id', $game->id)->where('user_id', $userIdToKick)->delete();

        // Re-index remaining players
        $remaining = GamePlayer::where('game_id', $game->id)->orderBy('id')->get();
        foreach ($remaining as $index => $rp) {
            $rp->player_index = $index;
            $rp->save();
        }

        return back();
    }

    /**
     * Delete/Disband the game room (Creator only).
     */
    public function destroy(string $uuid): RedirectResponse
    {
        $game = Game::where('uuid', $uuid)->firstOrFail();
        $user = Auth::user();

        if ($game->creator_id !== $user->id) {
            return back()->withErrors(['error' => 'Only the captain who created this ship can disband it!']);
        }

        // Delete the game and its players (cascading or manual)
        GamePlayer::where('game_id', $game->id)->delete();
        $game->delete();

        return redirect()->route('dashboard')->with('success', 'The voyage has been disbanded!');
    }

    /**
     * Retrieve current state JSON (for polling).
     */
    public function state(string $uuid): JsonResponse
    {
        $game = Game::where('uuid', $uuid)->firstOrFail();
        $user = Auth::user();

        $isJoined = GamePlayer::where('game_id', $game->id)->where('user_id', $user->id)->exists();
        if (! $isJoined) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json([
            'status' => $game->status,
            'current_player_index' => $game->current_player_index,
            'winner_id' => $game->winner_id,
            'board_state' => $game->board_state,
            'game_players' => $game->gamePlayers()->with('user')->get(),
        ]);
    }

    public function check(string $uuid): JsonResponse
    {
        $game = Game::where('uuid', $uuid)->first();

        if (! $game) {
            return response()->json(['status' => 'disbanded']);
        }

        $playerCount = GamePlayer::where('game_id', $game->id)->count();
        if ($game->status === 'waiting' && $playerCount >= ($game->max_players ?? 4)) {
            // Wait! Are we already joined?
            $isJoined = GamePlayer::where('game_id', $game->id)->where('user_id', Auth::id())->exists();
            if (! $isJoined) {
                return response()->json(['status' => 'full']);
            }
        }

        return response()->json(['status' => $game->status]);
    }

    /**
     * Action: Take tokens.
     */
    public function takeTokens(Request $request, string $uuid, GameEngine $engine): RedirectResponse|JsonResponse
    {
        $game = Game::where('uuid', $uuid)->firstOrFail();

        $request->validate([
            'tokens' => 'required|array',
        ]);

        try {
            $engine->takeTokens($game, Auth::user(), $request->tokens);

            return back();
        } catch (\Exception $e) {
            return back()->withErrors(['action_error' => $e->getMessage()]);
        }
    }

    /**
     * Action: Reserve card.
     */
    public function reserveCard(Request $request, string $uuid, GameEngine $engine): RedirectResponse|JsonResponse
    {
        $game = Game::where('uuid', $uuid)->firstOrFail();

        $request->validate([
            'card_id' => 'required|integer',
            'tier' => 'required|string|in:tier1,tier2,tier3',
        ]);

        try {
            $engine->reserveCard($game, Auth::user(), $request->card_id, $request->tier);

            return back();
        } catch (\Exception $e) {
            return back()->withErrors(['action_error' => $e->getMessage()]);
        }
    }

    /**
     * Action: Buy card.
     */
    public function buyCard(Request $request, string $uuid, GameEngine $engine): RedirectResponse|JsonResponse
    {
        $game = Game::where('uuid', $uuid)->firstOrFail();

        $request->validate([
            'card_id' => 'required|integer',
            'tier' => 'required|string|in:tier1,tier2,tier3',
            'from_reserved' => 'required|boolean',
        ]);

        try {
            $engine->buyCard(
                $game,
                Auth::user(),
                $request->card_id,
                $request->tier,
                $request->from_reserved
            );

            return back();
        } catch (\Exception $e) {
            return back()->withErrors(['action_error' => $e->getMessage()]);
        }
    }

    /**
     * Action: Surrender / Forfeit.
     */
    public function surrender(string $uuid, GameEngine $engine): RedirectResponse|JsonResponse
    {
        $game = Game::where('uuid', $uuid)->firstOrFail();

        try {
            if (($game->game_type ?? 'splendor') === 'wordle') {
                $engine->surrenderWordle($game, Auth::user());
            } elseif (($game->game_type ?? 'splendor') === 'sudoku') {
                $engine->surrenderSudoku($game, Auth::user());
            } else {
                $engine->forfeitGame($game, Auth::user());
            }

            return back();
        } catch (\Exception $e) {
            return back()->withErrors(['action_error' => $e->getMessage()]);
        }
    }

    /**
     * Action: Roll the die (Snakes and Ladders).
     */
    public function rollDie(Request $request, string $uuid, GameEngine $engine): RedirectResponse|JsonResponse
    {
        $game = Game::where('uuid', $uuid)->firstOrFail();

        try {
            $clientRoll = $request->has('roll') ? (int) $request->input('roll') : null;
            $engine->rollDie($game, Auth::user(), $clientRoll);

            return back();
        } catch (\Exception $e) {
            return back()->withErrors(['action_error' => $e->getMessage()]);
        }
    }

    /**
     * Action: Submit a 5-letter guess in Sandi Tortuga (Wordle).
     */
    public function submitGuess(Request $request, string $uuid, GameEngine $engine): RedirectResponse|JsonResponse
    {
        $game = Game::where('uuid', $uuid)->firstOrFail();

        $request->validate([
            'guess' => 'required|string|size:5',
        ]);

        try {
            $engine->submitWordleGuess($game, Auth::user(), $request->input('guess'));

            return back();
        } catch (\Exception $e) {
            return back()->withErrors(['action_error' => $e->getMessage()]);
        }
    }

    /**
     * Action: Fill a cell in Sudoku Tortuga.
     */
    public function fillSudokuCell(Request $request, string $uuid, GameEngine $engine): RedirectResponse|JsonResponse
    {
        $game = Game::where('uuid', $uuid)->firstOrFail();

        $request->validate([
            'row' => 'required|integer|min:0|max:8',
            'col' => 'required|integer|min:0|max:8',
            'val' => 'required|integer|min:0|max:9',
        ]);

        try {
            $engine->fillSudokuCell(
                $game,
                Auth::user(),
                (int) $request->input('row'),
                (int) $request->input('col'),
                (int) $request->input('val')
            );

            if ($request->wantsJson()) {
                $game->refresh();

                return response()->json([
                    'success' => true,
                    'status' => $game->status,
                    'winner_id' => $game->winner_id,
                    'board_state' => $game->board_state,
                ]);
            }

            return back();
        } catch (\Exception $e) {
            if ($request->wantsJson()) {
                return response()->json(['error' => $e->getMessage()], 422);
            }

            return back()->withErrors(['action_error' => $e->getMessage()]);
        }
    }

    /**
     * Action: Vote for / Start Rematch.
     */
    public function rematch(string $uuid, GameEngine $engine): RedirectResponse|JsonResponse
    {
        $game = Game::with(['gamePlayers.user'])->where('uuid', $uuid)->firstOrFail();
        $user = Auth::user();

        try {
            $players = $game->gamePlayers->map->user->all();
            if (($game->game_type ?? 'splendor') === 'wordle') {
                $engine->rematchWordle($game, $user, $players);
            } elseif (($game->game_type ?? 'splendor') === 'sudoku') {
                $engine->rematchSudoku($game, $user, $players);
            }

            return back();
        } catch (\Exception $e) {
            return back()->withErrors(['action_error' => $e->getMessage()]);
        }
    }

    /**
     * Action: Decline Rematch and return to tavern.
     */
    public function declineRematch(string $uuid, GameEngine $engine): RedirectResponse
    {
        $game = Game::where('uuid', $uuid)->firstOrFail();
        $user = Auth::user();

        try {
            if (($game->game_type ?? 'splendor') === 'wordle') {
                $engine->declineRematchWordle($game, $user);
            } elseif (($game->game_type ?? 'splendor') === 'sudoku') {
                $engine->declineRematchSudoku($game, $user);
            }

            return redirect()->route('dashboard');
        } catch (\Exception $e) {
            return redirect()->route('dashboard');
        }
    }
}
