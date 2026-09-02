<?php

namespace Tests\Feature;

use App\Models\FriendMessage;
use App\Models\Friendship;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChatTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_send_chat_message_to_friend(): void
    {
        $user1 = User::factory()->create(['is_otp_verified' => true]);
        $user2 = User::factory()->create(['is_otp_verified' => true]);

        Friendship::create([
            'user_id' => $user1->id,
            'friend_id' => $user2->id,
            'status' => 'accepted',
        ]);

        $response = $this->actingAs($user1)->postJson("/friends/chat/{$user2->id}/send", [
            'message' => 'Ahoy matey!',
        ]);

        $response->assertStatus(200);
        $response->assertJsonFragment(['success' => true]);
        $this->assertDatabaseHas('friend_messages', [
            'sender_id' => $user1->id,
            'receiver_id' => $user2->id,
            'message' => 'Ahoy matey!',
        ]);
    }

    public function test_user_can_load_chat_history_with_friend(): void
    {
        $user1 = User::factory()->create(['is_otp_verified' => true]);
        $user2 = User::factory()->create(['is_otp_verified' => true]);

        Friendship::create([
            'user_id' => $user1->id,
            'friend_id' => $user2->id,
            'status' => 'accepted',
        ]);

        $msg = FriendMessage::create([
            'sender_id' => $user2->id,
            'receiver_id' => $user1->id,
            'message' => 'Shiver me timbers!',
            'is_read' => false,
        ]);

        $response = $this->actingAs($user1)->getJson("/friends/chat/{$user2->id}");

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'messages');

        $msg->refresh();
        $this->assertTrue($msg->is_read); // verify marked as read
    }

    public function test_cannot_chat_with_non_friend(): void
    {
        $user1 = User::factory()->create(['is_otp_verified' => true]);
        $user2 = User::factory()->create(['is_otp_verified' => true]);

        // No friendship exists

        $response = $this->actingAs($user1)->postJson("/friends/chat/{$user2->id}/send", [
            'message' => 'Bribing the guards!',
        ]);

        $response->assertStatus(403);
    }
}
