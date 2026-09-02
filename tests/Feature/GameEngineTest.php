<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\GamePlayer;
use App\Models\User;
use App\Services\GameEngine;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class GameEngineTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_game_lobby(): void
    {
        $user = User::factory()->create(['is_otp_verified' => true]);

        $response = $this->actingAs($user)->post('/games');

        $game = Game::first();
        $this->assertNotNull($game);
        $response->assertRedirect("/games/{$game->uuid}");

        $this->assertDatabaseHas('game_players', [
            'game_id' => $game->id,
            'user_id' => $user->id,
            'player_index' => 0,
        ]);
    }

    public function test_game_creation_and_starting_initialises_state(): void
    {
        $creator = User::factory()->create(['is_otp_verified' => true]);
        $opponent = User::factory()->create(['is_otp_verified' => true]);

        $game = Game::create([
            'uuid' => (string) Str::uuid(),
            'creator_id' => $creator->id,
            'status' => 'waiting',
        ]);

        GamePlayer::create(['game_id' => $game->id, 'user_id' => $creator->id, 'player_index' => 0]);
        GamePlayer::create(['game_id' => $game->id, 'user_id' => $opponent->id, 'player_index' => 1, 'is_ready' => true]);

        $response = $this->actingAs($creator)->post("/games/{$game->uuid}/start");

        $game->refresh();
        $this->assertEquals('playing', $game->status);
        $this->assertNotNull($game->board_state);

        $state = $game->board_state;
        $this->assertCount(4, $state['cards']['tier1']);
        $this->assertCount(4, $state['cards']['tier2']);
        $this->assertCount(4, $state['cards']['tier3']);
        $this->assertCount(3, $state['nobles']); // 2 players + 1 = 3 nobles

        // 2 players = 4 tokens of each color, 5 gold
        $this->assertEquals(4, $state['tokens']['pearl']);
        $this->assertEquals(5, $state['tokens']['gold']);
    }

    public function test_player_can_draft_three_different_tokens(): void
    {
        $creator = User::factory()->create(['is_otp_verified' => true]);
        $opponent = User::factory()->create(['is_otp_verified' => true]);

        $game = Game::create([
            'uuid' => (string) Str::uuid(),
            'creator_id' => $creator->id,
            'status' => 'waiting',
        ]);

        GamePlayer::create(['game_id' => $game->id, 'user_id' => $creator->id, 'player_index' => 0]);
        GamePlayer::create(['game_id' => $game->id, 'user_id' => $opponent->id, 'player_index' => 1]);

        // Start game
        app(GameEngine::class)->initGame($game, [$creator, $opponent]);

        // Creator takes 3 different tokens
        $response = $this->actingAs($creator)->post("/games/{$game->uuid}/take-tokens", [
            'tokens' => ['pearl', 'sapphire', 'emerald'],
        ]);

        $response->assertSessionHasNoErrors();
        $game->refresh();

        // Assert turn switched
        $this->assertEquals(1, $game->current_player_index);

        $state = $game->board_state;
        // Verify board counts decremented
        $this->assertEquals(3, $state['tokens']['pearl']);
        $this->assertEquals(3, $state['tokens']['sapphire']);
        $this->assertEquals(3, $state['tokens']['emerald']);

        // Verify player counts incremented
        $playerState = $state['players'][$creator->id];
        $this->assertEquals(1, $playerState['tokens']['pearl']);
        $this->assertEquals(1, $playerState['tokens']['sapphire']);
        $this->assertEquals(1, $playerState['tokens']['emerald']);
    }

    public function test_invalid_draft_fails(): void
    {
        $creator = User::factory()->create(['is_otp_verified' => true]);
        $opponent = User::factory()->create(['is_otp_verified' => true]);

        $game = Game::create([
            'uuid' => (string) Str::uuid(),
            'creator_id' => $creator->id,
            'status' => 'waiting',
        ]);

        GamePlayer::create(['game_id' => $game->id, 'user_id' => $creator->id, 'player_index' => 0]);
        GamePlayer::create(['game_id' => $game->id, 'user_id' => $opponent->id, 'player_index' => 1]);

        app(GameEngine::class)->initGame($game, [$creator, $opponent]);

        // Attempt to take Gold
        $response = $this->actingAs($creator)->post("/games/{$game->uuid}/take-tokens", [
            'tokens' => ['gold'],
        ]);

        $response->assertSessionHasErrors('action_error');
    }

    public function test_player_can_draft_two_identical_tokens_with_pool_size_of_four(): void
    {
        $creator = User::factory()->create(['is_otp_verified' => true]);
        $opponent = User::factory()->create(['is_otp_verified' => true]);

        $game = Game::create([
            'uuid' => (string) Str::uuid(),
            'creator_id' => $creator->id,
            'status' => 'waiting',
        ]);

        GamePlayer::create(['game_id' => $game->id, 'user_id' => $creator->id, 'player_index' => 0]);
        GamePlayer::create(['game_id' => $game->id, 'user_id' => $opponent->id, 'player_index' => 1]);

        app(GameEngine::class)->initGame($game, [$creator, $opponent]);

        // Manually modify token pool of 'pearl' to 4 (normally 4 anyway in 2-player game)
        $boardState = $game->board_state;
        $boardState['tokens']['pearl'] = 4;
        $game->board_state = $boardState;
        $game->save();

        // Creator takes 2 pearl tokens
        $response = $this->actingAs($creator)->post("/games/{$game->uuid}/take-tokens", [
            'tokens' => ['pearl', 'pearl'],
        ]);

        $response->assertSessionHasNoErrors();
        $game->refresh();

        $state = $game->board_state;
        // Verify board counts decremented
        $this->assertEquals(2, $state['tokens']['pearl']);

        // Verify player counts incremented
        $playerState = $state['players'][$creator->id];
        $this->assertEquals(2, $playerState['tokens']['pearl']);
    }

    public function test_player_cannot_draft_two_identical_tokens_with_pool_size_less_than_four(): void
    {
        $creator = User::factory()->create(['is_otp_verified' => true]);
        $opponent = User::factory()->create(['is_otp_verified' => true]);

        $game = Game::create([
            'uuid' => (string) Str::uuid(),
            'creator_id' => $creator->id,
            'status' => 'waiting',
        ]);

        GamePlayer::create(['game_id' => $game->id, 'user_id' => $creator->id, 'player_index' => 0]);
        GamePlayer::create(['game_id' => $game->id, 'user_id' => $opponent->id, 'player_index' => 1]);

        app(GameEngine::class)->initGame($game, [$creator, $opponent]);

        // Manually modify token pool of 'pearl' to 3
        $boardState = $game->board_state;
        $boardState['tokens']['pearl'] = 3;
        $game->board_state = $boardState;
        $game->save();

        // Creator attempts to take 2 pearl tokens
        $response = $this->actingAs($creator)->post("/games/{$game->uuid}/take-tokens", [
            'tokens' => ['pearl', 'pearl'],
        ]);

        $response->assertSessionHasErrors('action_error');
    }

    public function test_player_can_surrender_game(): void
    {
        $creator = User::factory()->create(['is_otp_verified' => true]);
        $opponent = User::factory()->create(['is_otp_verified' => true]);

        $game = Game::create([
            'uuid' => (string) Str::uuid(),
            'creator_id' => $creator->id,
            'status' => 'waiting',
        ]);

        GamePlayer::create(['game_id' => $game->id, 'user_id' => $creator->id, 'player_index' => 0]);
        GamePlayer::create(['game_id' => $game->id, 'user_id' => $opponent->id, 'player_index' => 1]);

        app(GameEngine::class)->initGame($game, [$creator, $opponent]);

        // Opponent surrenders
        $response = $this->actingAs($opponent)->post("/games/{$game->uuid}/surrender");

        $response->assertSessionHasNoErrors();
        $game->refresh();

        $this->assertEquals('finished', $game->status);
        $this->assertEquals($creator->id, $game->winner_id);
        $this->assertStringContainsString('has surrendered', $game->board_state['log'][count($game->board_state['log']) - 1]);
    }

    public function test_player_can_roll_die_in_snakes_game_with_specific_roll(): void
    {
        $creator = User::factory()->create(['is_otp_verified' => true]);
        $opponent = User::factory()->create(['is_otp_verified' => true]);

        $game = Game::create([
            'uuid' => (string) Str::uuid(),
            'creator_id' => $creator->id,
            'game_type' => 'snakes',
            'status' => 'waiting',
        ]);

        GamePlayer::create(['game_id' => $game->id, 'user_id' => $creator->id, 'player_index' => 0]);
        GamePlayer::create(['game_id' => $game->id, 'user_id' => $opponent->id, 'player_index' => 1]);

        app(GameEngine::class)->initGame($game, [$creator, $opponent]);

        // Creator rolls exactly 5 (starting from cell 1 -> reaches 6, which is not a ladder or snake)
        $response = $this->actingAs($creator)->post("/games/{$game->uuid}/roll-die", [
            'roll' => 5,
        ]);

        $response->assertSessionHasNoErrors();
        $game->refresh();

        $this->assertEquals(5, $game->board_state['last_roll']);
        $this->assertEquals(6, $game->board_state['players'][$creator->id]['position']);
        $this->assertEquals(1, $game->current_player_index);
    }
}
