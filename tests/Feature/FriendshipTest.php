<?php

namespace Tests\Feature;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FriendshipTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_send_friend_request(): void
    {
        $user1 = User::factory()->create(['is_otp_verified' => true]);
        $user2 = User::factory()->create(['is_otp_verified' => true]);

        $response = $this->actingAs($user1)->postJson('/friends/request', [
            'email' => "{$user2->username}#{$user2->hashtag}",
        ]);

        $response->assertStatus(200);
        $response->assertJsonFragment(['success' => 'Friend request sent successfully!']);

        $this->assertDatabaseHas('friendships', [
            'user_id' => $user1->id,
            'friend_id' => $user2->id,
            'status' => 'pending',
        ]);
    }

    public function test_user_can_accept_friend_request(): void
    {
        $user1 = User::factory()->create(['is_otp_verified' => true]);
        $user2 = User::factory()->create(['is_otp_verified' => true]);

        $friendship = Friendship::create([
            'user_id' => $user1->id,
            'friend_id' => $user2->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user2)->postJson("/friends/{$friendship->id}/accept");

        $response->assertStatus(200);
        $response->assertJsonFragment(['success' => 'Friend request accepted!']);

        $this->assertDatabaseHas('friendships', [
            'id' => $friendship->id,
            'status' => 'accepted',
        ]);
    }

    public function test_user_can_decline_friend_request(): void
    {
        $user1 = User::factory()->create(['is_otp_verified' => true]);
        $user2 = User::factory()->create(['is_otp_verified' => true]);

        $friendship = Friendship::create([
            'user_id' => $user1->id,
            'friend_id' => $user2->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user2)->postJson("/friends/{$friendship->id}/decline");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('friendships', ['id' => $friendship->id]);
    }

    public function test_friends_api_returns_status_and_friendship_lists(): void
    {
        $user1 = User::factory()->create(['is_otp_verified' => true]);
        $user2 = User::factory()->create(['is_otp_verified' => true]);
        $user3 = User::factory()->create(['is_otp_verified' => true]);

        // accepted friendship
        Friendship::create(['user_id' => $user1->id, 'friend_id' => $user2->id, 'status' => 'accepted']);
        // pending outgoing request from user 1 to user 3
        Friendship::create(['user_id' => $user1->id, 'friend_id' => $user3->id, 'status' => 'pending']);

        $response = $this->actingAs($user1)->getJson('/friends');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'friends',
            'incoming',
            'outgoing',
        ]);

        $this->assertCount(1, $response->json('friends'));
        $this->assertCount(1, $response->json('outgoing'));
    }
}
