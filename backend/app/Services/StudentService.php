<?php

namespace App\Services;

use App\Models\Student;

class StudentService
{
    /**
     * Get all students for the listing view, applying an optional skill filter query.
     */
    public function getAllStudents($skillFilter = null)
    {
        $query = Student::with([
            'academicHistories',
            'sportsSkills',
            'affiliations',
            'violations',
            'activities'
        ]);

        if (!empty($skillFilter)) {
            // Because technical_skills is cast to a JSON array, we can use a basic LIKE query against the raw JSON string
            // We use whereRaw to enforce lowercase fuzzy SQL matching
            $term = strtolower(trim($skillFilter));
            
            $query->where(function($q) use ($term) {
                // If the user types 'git', we can look for '%git%'
                // To allow slight typos like 'gir', we can take the first 2 characters for our fuzzy SQL
                $fuzzyTerm = strlen($term) >= 3 ? substr($term, 0, 2) . '%' : '%' . $term . '%';
                
                $q->whereRaw('LOWER(technical_skills) LIKE ?', ["%{$term}%"])
                  ->orWhereRaw('LOWER(other_skills) LIKE ?', ["%{$term}%"])
                  // Fallback to fuzzy substring targeting to simulate Levenshtein variance inside traditional MySQL
                  ->orWhereRaw('LOWER(technical_skills) LIKE ?', ["%{$fuzzyTerm}"])
                  ->orWhereRaw('LOWER(other_skills) LIKE ?', ["%{$fuzzyTerm}"]);
            });
        }

        return $query->get();
    }

    /**
     * Get a specific student with all their detailed relationships.
     */
    public function getStudentWithRelations($id): Student
    {
        return Student::with([
            'academicHistories',
            'sportsSkills',
            'affiliations',
            'violations',
            'activities'
        ])->findOrFail($id);
    }

    /**
     * Update a specific student's basic details.
     */
    public function updateStudent($id, array $data): Student
    {
        $student = Student::findOrFail($id);
        
        $mappedData = [
            'first_name' => $data['firstName'] ?? null,
            'last_name' => $data['lastName'] ?? null,
            'student_number' => $data['studentNumber'] ?? null,
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'date_of_birth' => $data['dateOfBirth'] ?? null,
            'gender' => $data['gender'] ?? null,
            'address' => $data['address'] ?? null,
            'enrollment_date' => $data['enrollmentDate'] ?? null,
            'program' => $data['program'] ?? null,
            'year_level' => $data['yearLevel'] ?? null,
            'status' => $data['status'] ?? null,
            'gpa' => $data['gpa'] ?? null,
            'technical_skills' => $data['technicalSkills'] ?? null,
            'other_skills' => $data['otherSkills'] ?? null,
        ];

        $mappedData = array_filter($mappedData, function($value) {
            return $value !== null;
        });

        // Use DB transaction to rollback in case of future nested inserts failing
        \Illuminate\Support\Facades\DB::transaction(function () use ($student, $mappedData, $data) {
            $student->update($mappedData);
            
            // Sync Sports Skills
            if (isset($data['sportsSkills']) && is_array($data['sportsSkills'])) {
                $student->sportsSkills()->delete(); // Clear existing sports relations
                foreach ($data['sportsSkills'] as $sport) {
                    if (!empty($sport['sport'])) {
                        $student->sportsSkills()->create([
                            'sport'    => $sport['sport'],
                            'level'    => $sport['level'] ?? 'Beginner',
                            'height'   => $sport['height'] ?? null,
                            'weight'   => $sport['weight'] ?? null,
                            'position' => $sport['position'] ?? null,
                        ]);
                    }
                }
            }

            // Sync Affiliations
            if (isset($data['affiliations']) && is_array($data['affiliations'])) {
                $student->affiliations()->delete(); // Clear existing affiliations
                foreach ($data['affiliations'] as $aff) {
                    if (!empty($aff['organization'])) {
                        $student->affiliations()->create([
                            'organization' => $aff['organization'],
                            'role'         => $aff['role'] ?? null,
                            'join_date'    => $aff['joinDate'] ?? null,
                            'status'       => $aff['status'] ?? 'Active',
                        ]);
                    }
                }
            }

            // Sync Violations
            $hasActiveSuspension = false;
            if (isset($data['violations']) && is_array($data['violations'])) {
                $student->violations()->delete(); // Clear existing violations
                foreach ($data['violations'] as $violation) {
                    if (!empty($violation['type'])) {
                        $student->violations()->create([
                            'type'            => $violation['type'],
                            'date'            => $violation['date'] ?? null,
                            'description'     => $violation['description'] ?? null,
                            'severity'        => $violation['severity'] ?? 'Minor',
                            'resolution'      => $violation['resolution'] ?? null,
                            'suspended_until' => $violation['suspendedUntil'] ?? null,
                        ]);
                        
                        // Check if this violation warrants an active suspension
                        if (!empty($violation['suspendedUntil']) && strtotime($violation['suspendedUntil']) >= strtotime(date('Y-m-d'))) {
                            $hasActiveSuspension = true;
                        }
                    }
                }
            }

            // Immediately enforce suspension status
            if ($hasActiveSuspension) {
                $student->update(['status' => 'Suspended']);
            } elseif ($student->status === 'Suspended' && isset($data['violations'])) {
                $student->update(['status' => 'Active']);
            }

            // Sync Non Academic Activities
            if (isset($data['nonAcademicActivities']) && is_array($data['nonAcademicActivities'])) {
                $student->activities()->delete();
                foreach ($data['nonAcademicActivities'] as $act) {
                    if (!empty($act['name'])) {
                        $student->activities()->create([
                            'name'        => $act['name'],
                            'type'        => $act['type'] ?? 'Extra-Curricular',
                            'date'        => $act['date'] ?? null,
                            'description' => $act['description'] ?? null,
                            'award'       => $act['award'] ?? null,
                        ]);
                    }
                }
            }
        });
        
        return $this->getStudentWithRelations($id);
    }

    /**
     * Create a new student.
     */
    public function createStudent(array $data): Student
    {
        $mappedData = [
            'first_name' => $data['firstName'] ?? null,
            'last_name' => $data['lastName'] ?? null,
            'student_number' => $data['studentNumber'] ?? null,
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'date_of_birth' => $data['dateOfBirth'] ?? null,
            'gender' => $data['gender'] ?? null,
            'address' => $data['address'] ?? null,
            'enrollment_date' => $data['enrollmentDate'] ?? null,
            'program' => $data['program'] ?? null,
            'year_level' => $data['yearLevel'] ?? 1,
            'status' => $data['status'] ?? 'Active',
            'gpa' => $data['gpa'] ?? 0.0,
            'technical_skills' => $data['technicalSkills'] ?? [],
            'other_skills' => $data['otherSkills'] ?? [],
        ];

        $mappedData = array_filter($mappedData, function($value) {
            return $value !== null;
        });

        // Wrap the insert in a database transaction to ensure rollback if any part fails
        $student = \Illuminate\Support\Facades\DB::transaction(function () use ($mappedData, $data) {
            $newStudent = Student::create($mappedData);
            
            // Sync Sports Skills
            if (isset($data['sportsSkills']) && is_array($data['sportsSkills'])) {
                foreach ($data['sportsSkills'] as $sport) {
                    if (!empty($sport['sport'])) {
                        $newStudent->sportsSkills()->create([
                            'sport'    => $sport['sport'],
                            'level'    => $sport['level'] ?? 'Beginner',
                            'height'   => $sport['height'] ?? null,
                            'weight'   => $sport['weight'] ?? null,
                            'position' => $sport['position'] ?? null,
                        ]);
                    }
                }
            }

            // Sync Affiliations
            if (isset($data['affiliations']) && is_array($data['affiliations'])) {
                foreach ($data['affiliations'] as $aff) {
                    if (!empty($aff['organization'])) {
                        $newStudent->affiliations()->create([
                            'organization' => $aff['organization'],
                            'role'         => $aff['role'] ?? null,
                            'join_date'    => $aff['joinDate'] ?? null,
                            'status'       => $aff['status'] ?? 'Active',
                        ]);
                    }
                }
            }

            // Sync Violations
            $hasActiveSuspension = false;
            if (isset($data['violations']) && is_array($data['violations'])) {
                foreach ($data['violations'] as $violation) {
                    if (!empty($violation['type'])) {
                        $newStudent->violations()->create([
                            'type'            => $violation['type'],
                            'date'            => $violation['date'] ?? null,
                            'description'     => $violation['description'] ?? null,
                            'severity'        => $violation['severity'] ?? 'Minor',
                            'resolution'      => $violation['resolution'] ?? null,
                            'suspended_until' => $violation['suspendedUntil'] ?? null,
                        ]);
                        
                        if (!empty($violation['suspendedUntil']) && strtotime($violation['suspendedUntil']) >= strtotime(date('Y-m-d'))) {
                            $hasActiveSuspension = true;
                        }
                    }
                }
            }
            
            if ($hasActiveSuspension) {
                $newStudent->update(['status' => 'Suspended']);
            }

            // Sync Non Academic Activities
            if (isset($data['nonAcademicActivities']) && is_array($data['nonAcademicActivities'])) {
                foreach ($data['nonAcademicActivities'] as $act) {
                    if (!empty($act['name'])) {
                        $newStudent->activities()->create([
                            'name'        => $act['name'],
                            'type'        => $act['type'] ?? 'Extra-Curricular',
                            'date'        => $act['date'] ?? null,
                            'description' => $act['description'] ?? null,
                            'award'       => $act['award'] ?? null,
                        ]);
                    }
                }
            }
            
            return $newStudent;
        });
        
        return $this->getStudentWithRelations($student->id);
    }

    /**
     * Delete a student and all associated relational records securely.
     */
    public function deleteStudent(string $id): void
    {
        $student = Student::findOrFail($id);
        
        \Illuminate\Support\Facades\DB::transaction(function () use ($student) {
            // Delete associated relational dependencies explicitly, 
            // incase foreign key cascades aren't fully configured
            $student->academicHistories()->delete();
            $student->sportsSkills()->delete();
            $student->affiliations()->delete();
            $student->violations()->delete();
            $student->activities()->delete();
            
            // Finally delete the student record
            $student->delete();
        });
    }
}
