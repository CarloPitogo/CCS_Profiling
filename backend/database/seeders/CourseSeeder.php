<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $mockCourses = [
            [
                'code' => 'CS301',
                'name' => 'Data Structures',
                'description' => 'Study of fundamental data structures and their applications',
                'units' => 3,
                'program' => 'Bachelor of Science in Computer Science',
                'year_level' => 3,
                'semester' => '1st Semester',
            ],
            [
                'code' => 'CS302',
                'name' => 'Algorithms',
                'description' => 'Analysis and design of computer algorithms',
                'units' => 3,
                'program' => 'Bachelor of Science in Computer Science',
                'year_level' => 3,
                'semester' => '1st Semester',
            ],
            [
                'code' => 'CS303',
                'name' => 'Web Development',
                'description' => 'Modern web technologies and frameworks',
                'units' => 3,
                'program' => 'Bachelor of Science in Computer Science',
                'year_level' => 3,
                'semester' => '1st Semester',
            ],
        ];

        foreach ($mockCourses as $course) {
            Course::create($course);
        }
    }
}
