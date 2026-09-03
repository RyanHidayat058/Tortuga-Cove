<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'required',
                'string',
                'max:255',
                Rule::unique(User::class)->where(function ($query) {
                    return $query->where('username', $this->username)
                        ->where('hashtag', $this->hashtag);
                })->ignore($this->user()->id),
            ],
            'hashtag' => [
                'required',
                'string',
                'min:1',
                'max:6',
                'alpha_num',
            ],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
        ];
    }

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'username.unique' => 'The pirate tag combination '.$this->username.'#'.$this->hashtag.' is already taken by another pirate!',
            'hashtag.min' => 'Hashtag must be at least 1 character.',
            'hashtag.max' => 'Hashtag cannot exceed 6 characters.',
            'hashtag.alpha_num' => 'Hashtag can only contain letters and numbers.',
        ];
    }
}
