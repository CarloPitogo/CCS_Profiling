<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Schedule;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $mockSchedules = [
            [
                'course_code' => 'CS301',
                'section' => 'CS3A',
                'faculty_id' => '1',
                'room' => 'CCS-401',
                'day' => 'Monday',
                'time_start' => '08:00',
                'time_end' => '11:00',
                'type' => 'Lecture',
            ],
            [
                'course_code' => 'CS302',
                'section' => 'CS3A',
                'faculty_id' => '2',
                'room' => 'CCS-402',
                'day' => 'Tuesday',
                'time_start' => '13:00',
                'time_end' => '16:00',
                'type' => 'Lecture',
            ],
            [
                'course_code' => 'CS303',
                'section' => 'CS3A',
                'faculty_id' => '2',
                'room' => 'CCS-Lab1',
                'day' => 'Wednesday',
                'time_start' => '08:00',
                'time_end' => '11:00',
                'type' => 'Laboratory',
            ],
        ];

        foreach ($mockSchedules as $schedule) {
            Schedule::create($schedule);
        }
    }
}
