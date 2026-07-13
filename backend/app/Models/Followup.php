<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Followup extends Model
{
    protected $fillable = [
        'lead_id',
        'user_id',
        'type',
        'date',
        'time',
        'status',
        'remarks'
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
