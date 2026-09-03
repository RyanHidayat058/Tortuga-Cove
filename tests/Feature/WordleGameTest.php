<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\GamePlayer;
use App\Models\User;
use App\Services\GameEngine;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WordleGameTest extends TestCase
{
    use RefreshDatabase;

    public function test_player_can_create_wordle_room(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('games.create'), [
            'game_type' => 'wordle',
            'max_players' => 2,
        ]);

        $game = Game::where('creator_id', $user->id)->first();
        $this->assertNotNull($game);
        $this->assertEquals('wordle', $game->game_type);
        $this->assertEquals(2, $game->max_players);
        $this->assertEquals('waiting', $game->status);

        $response->assertRedirect(route('games.show', $game->uuid));
    }

    public function test_wordle_game_engine_evaluates_colors_correctly(): void
    {
        $engine = new GameEngine;

        // Exact match
        $colors = $engine->evaluateWordleGuess('KAPAL', 'KAPAL');
        $this->assertEquals(['green', 'green', 'green', 'green', 'green'], $colors);

        // Displaced letters
        // Secret: KAPAL, Guess: LAPAK
        // L: index 0 (yellow, secret has L at 4)
        // A: index 1 (green, secret has A at 1)
        // P: index 2 (green, secret has P at 2)
        // A: index 3 (green, secret has A at 3)
        // K: index 4 (yellow, secret has K at 0)
        $colors = $engine->evaluateWordleGuess('KAPAL', 'LAPAK');
        $this->assertEquals(['yellow', 'green', 'green', 'green', 'yellow'], $colors);

        // Duplicate letter constraint
        // Secret: BADAI (two As), Guess: ABADI
        // A: index 0 (yellow)
        // B: index 1 (yellow)
        // A: index 2 (yellow)
        // D: index 3 (yellow)
        // I: index 4 (green)
        $colors = $engine->evaluateWordleGuess('BADAI', 'ABADI');
        $this->assertEquals(['yellow', 'yellow', 'yellow', 'yellow', 'green'], $colors);
    }

    public function test_wordle_game_initializes_with_distinct_secret_words(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $game = Game::create([
            'uuid' => 'wordle-test-uuid',
            'creator_id' => $user1->id,
            'status' => 'waiting',
            'game_type' => 'wordle',
            'max_players' => 2,
        ]);

        GamePlayer::create(['game_id' => $game->id, 'user_id' => $user1->id, 'player_index' => 0]);
        GamePlayer::create(['game_id' => $game->id, 'user_id' => $user2->id, 'player_index' => 1]);

        $engine = new GameEngine;
        $engine->initGame($game, [$user1, $user2]);

        $game->refresh();
        $this->assertEquals('playing', $game->status);
        $this->assertArrayHasKey('players', $game->board_state);
        $this->assertArrayHasKey($user1->id, $game->board_state['players']);
        $this->assertArrayHasKey($user2->id, $game->board_state['players']);

        $p1Word = $game->board_state['players'][$user1->id]['secret_word'];
        $p2Word = $game->board_state['players'][$user2->id]['secret_word'];

        $this->assertEquals(5, strlen($p1Word));
        $this->assertEquals(5, strlen($p2Word));
    }

    public function test_player_can_submit_valid_guess_and_win(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $game = Game::create([
            'uuid' => 'wordle-guess-test',
            'creator_id' => $user1->id,
            'status' => 'playing',
            'game_type' => 'wordle',
            'max_players' => 2,
            'board_state' => [
                'game_type' => 'wordle',
                'players' => [
                    $user1->id => [
                        'user_id' => $user1->id,
                        'name' => $user1->name,
                        'index' => 0,
                        'secret_word' => 'KAPAL',
                        'guesses' => [],
                        'keyboard' => [],
                        'solved' => false,
                        'failed' => false,
                        'surrendered' => false,
                        'finish_order' => null,
                    ],
                    $user2->id => [
                        'user_id' => $user2->id,
                        'name' => $user2->name,
                        'index' => 1,
                        'secret_word' => 'BADAI',
                        'guesses' => [],
                        'keyboard' => [],
                        'solved' => false,
                        'failed' => false,
                        'surrendered' => false,
                        'finish_order' => null,
                    ],
                ],
                'finished_count' => 0,
                'log' => [],
            ],
        ]);

        GamePlayer::create(['game_id' => $game->id, 'user_id' => $user1->id, 'player_index' => 0]);
        GamePlayer::create(['game_id' => $game->id, 'user_id' => $user2->id, 'player_index' => 1]);

        // Submit first non-winning guess
        $response = $this->actingAs($user1)->post(route('games.guess', $game->uuid), [
            'guess' => 'SURAT',
        ]);
        $response->assertRedirect();

        $game->refresh();
        $this->assertCount(1, $game->board_state['players'][$user1->id]['guesses']);
        $this->assertFalse($game->board_state['players'][$user1->id]['solved']);

        // Submit winning guess
        $response = $this->actingAs($user1)->post(route('games.guess', $game->uuid), [
            'guess' => 'KAPAL',
        ]);
        $response->assertRedirect();

        $game->refresh();
        $this->assertTrue($game->board_state['players'][$user1->id]['solved']);
        $this->assertEquals(1, $game->board_state['players'][$user1->id]['finish_order']);
        $this->assertEquals($user1->id, $game->winner_id);

        // Game should STILL be playing because user2 has not finished yet!
        $this->assertEquals('playing', $game->status);

        // User2 surrenders
        $this->actingAs($user2)->post(route('games.surrender', $game->uuid));
        $game->refresh();

        // Now both finished -> game status is finished!
        $this->assertTrue($game->board_state['players'][$user2->id]['surrendered']);
        $this->assertEquals('finished', $game->status);
    }

    public function test_invalid_kbbi_word_is_rejected(): void
    {
        $user = User::factory()->create();

        $game = Game::create([
            'uuid' => 'wordle-invalid-guess-test',
            'creator_id' => $user->id,
            'status' => 'playing',
            'game_type' => 'wordle',
            'max_players' => 1,
            'board_state' => [
                'game_type' => 'wordle',
                'players' => [
                    $user->id => [
                        'user_id' => $user->id,
                        'name' => $user->name,
                        'index' => 0,
                        'secret_word' => 'KAPAL',
                        'guesses' => [],
                        'keyboard' => [],
                        'solved' => false,
                        'failed' => false,
                        'surrendered' => false,
                        'finish_order' => null,
                    ],
                ],
                'finished_count' => 0,
                'log' => [],
            ],
        ]);

        GamePlayer::create(['game_id' => $game->id, 'user_id' => $user->id, 'player_index' => 0]);

        $response = $this->actingAs($user)->post(route('games.guess', $game->uuid), [
            'guess' => 'XXXXX', // Not a word in KBBI
        ]);

        $response->assertSessionHasErrors(['action_error']);
        $game->refresh();
        $this->assertCount(0, $game->board_state['players'][$user->id]['guesses']);
    }

    public function test_everyday_indonesian_words_like_sujud_and_wujud_are_valid(): void
    {
        $this->assertTrue(WordleWordBank::isValidWord('SUJUD'));
        $this->assertTrue(WordleWordBank::isValidWord('WUJUD'));
        $this->assertTrue(WordleWordBank::isValidWord('MANDI'));
        $this->assertTrue(WordleWordBank::isValidWord('SALAT'));
        $this->assertTrue(WordleWordBank::isValidWord('ZIKIR'));
        $this->assertFalse(WordleWordBank::isValidWord('XYZ')); // Too short
        $this->assertFalse(WordleWordBank::isValidWord('XXXXX')); // No vowels
    }
}
