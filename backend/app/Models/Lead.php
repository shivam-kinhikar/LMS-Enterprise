<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lead extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'company',
        'email',
        'phone',
        'address',
        'industry',
        'source_id',
        'campaign',
        'product',
        'budget',
        'priority',
        'status_id',
        'assigned_user_id',
        'followup_date',
        'notes',
        'created_by'
    ];

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function followups()
    {
        return $this->hasMany(Followup::class);
    }

    public function status()
    {
        return $this->belongsTo(LeadStatus::class, 'status_id');
    }

    public function source()
    {
        return $this->belongsTo(LeadSource::class, 'source_id');
    }
}
