import { useState, useMemo, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Search as SearchIcon,
  FileText,
  Download,
  Trophy,
  Code,
  Users,
  GraduationCap
} from 'lucide-react';
import { Student } from '../types';
import { toast } from 'sonner';
import { Link } from 'react-router';
import { fetchWithAuth } from '../context/AuthContext';

export function Search() {
  // Advanced Filters
  const [minGPA, setMinGPA] = useState('');
  const [maxGPA, setMaxGPA] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [selectedYearLevel, setSelectedYearLevel] = useState('All');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [minHeight, setMinHeight] = useState('');
  const [hasViolations, setHasViolations] = useState<'all' | 'yes' | 'no'>('all');

  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const response = await fetchWithAuth('/students');
        if (!response.ok) throw new Error('Failed to fetch students');
        const data = await response.json();
        setStudents(data.data || []);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load students');
      } finally {
        setIsLoading(false);
      }
    };
    loadStudents();
  }, []);

  // Get unique values for filters
  const allPrograms = Array.from(new Set(students.map(s => s.program)));
  const allTechnicalSkills = Array.from(new Set(students.flatMap(s => s.technicalSkills))).sort();
  const allSports = Array.from(new Set(students.flatMap(s => s.sportsSkills.map(ss => ss.sport)))).sort();

  // Filter students based on criteria
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // GPA filter
      if (minGPA && student.gpa < parseFloat(minGPA)) return false;
      if (maxGPA && student.gpa > parseFloat(maxGPA)) return false;

      // Program filter
      if (selectedProgram !== 'All' && student.program !== selectedProgram) return false;

      // Year Level filter
      if (selectedYearLevel !== 'All' && student.yearLevel !== parseInt(selectedYearLevel)) return false;

      // Technical Skills filter
      if (selectedSkills.length > 0) {
        const hasAllSkills = selectedSkills.every(skill =>
          student.technicalSkills.includes(skill)
        );
        if (!hasAllSkills) return false;
      }

      // Sports filter
      if (selectedSports.length > 0) {
        const hasAnySport = selectedSports.some(sport =>
          student.sportsSkills.some(ss => ss.sport === sport)
        );
        if (!hasAnySport) return false;
      }

      // Height filter (for sports)
      if (minHeight) {
        const maxStudentHeight = Math.max(
          ...student.sportsSkills.filter(ss => ss.height).map(ss => Number(ss.height) || 0)
        );
        if (maxStudentHeight < parseFloat(minHeight)) return false;
      }

      // Violations filter
      if (hasViolations === 'yes' && student.violations.length === 0) return false;
      if (hasViolations === 'no' && student.violations.length > 0) return false;

      return true;
    });
  }, [minGPA, maxGPA, selectedProgram, selectedYearLevel, selectedSkills, selectedSports, minHeight, hasViolations]);

  const resetFilters = () => {
    setMinGPA('');
    setMaxGPA('');
    setSelectedProgram('All');
    setSelectedYearLevel('All');
    setSelectedSkills([]);
    setSelectedSports([]);
    setMinHeight('');
    setHasViolations('all');
  };

  const generateReport = () => {
    if (filteredStudents.length === 0) {
      toast.error('No students found to generate report');
      return;
    }

    const doc = new jsPDF();

    // Add Header
    doc.setFontSize(22);
    doc.setTextColor(255, 127, 17); // #FF7F11
    doc.text('CCS Profiling System', 14, 20);

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Student Advanced Search Report', 14, 30);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 38);
    doc.text(`Applied Filters: ${selectedProgram} Program, Year ${selectedYearLevel}, Min GPA: ${minGPA || 'N/A'}`, 14, 44);
    doc.text(`Total Records Found: ${filteredStudents.length}`, 14, 50);

    // Prepare table data
    const tableColumn = ["Full Name", "Student ID", "Program", "Year", "GPA", "Status", "Skills Preview"];
    const tableRows = filteredStudents.map(student => [
      `${student.firstName} ${student.lastName}`,
      student.studentNumber,
      student.program,
      student.yearLevel,
      student.gpa.toFixed(2),
      student.status,
      student.technicalSkills.slice(0, 3).join(', ')
    ]);

    // Generate Table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 55,
      theme: 'striped',
      headStyles: { fillColor: [255, 127, 17], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { fontSize: 9 }
    });

    const fileName = `CCS_Report_2026.pdf`;

    // Using a Data URI as a fallback which can be more reliable for naming in some contexts
    const pdfData = doc.output('datauristring');
    const link = document.createElement('a');
    link.href = pdfData;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`PDF report exported successfully: ${fileName}`);
  };

  // Pre-defined report templates
  const runBasketballTryoutsReport = () => {
    setSelectedSports(['Basketball']);
    setMinHeight('175');
    setHasViolations('no');
    setMinGPA('2.5');
  };

  const runProgrammingContestReport = () => {
    setSelectedSkills(['Python', 'Java']);
    setMinGPA('3.0');
    setHasViolations('no');
  };

  const runDeansListReport = () => {
    setMinGPA('3.75');
    setHasViolations('no');
  };

  const runVarsityAthletesReport = () => {
    resetFilters();
    // Will need to filter by varsity level in the results display
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading student data for search...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#FF7F11] to-orange-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <SearchIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-[#FF7F11] tracking-tight">
              Search & Reports
            </h1>
            <p className="text-sm text-gray-500 font-medium font-sans mt-0.5">
              Advanced student profiling and comprehensive queries
            </p>
          </div>
        </div>
        <Badge variant="outline" className="hidden md:flex px-4 py-1.5 items-center gap-2 border-orange-200 bg-white text-orange-700 shadow-sm rounded-full">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          Real-time Indexing
        </Badge>
      </div>

      {/* Quick Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Quick Report Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={runBasketballTryoutsReport}
              variant="outline"
              className="h-auto flex-col items-start p-4 gap-2"
            >
              <Trophy className="w-5 h-5 text-orange-600" />
              <div className="text-left">
                <p className="font-semibold">Basketball Tryouts</p>
                <p className="text-xs text-gray-500">Height ≥175cm, No violations</p>
              </div>
            </Button>

            <Button
              onClick={runProgrammingContestReport}
              variant="outline"
              className="h-auto flex-col items-start p-4 gap-2"
            >
              <Code className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <p className="font-semibold">Programming Contest</p>
                <p className="text-xs text-gray-500">Python/Java, GPA ≥3.0</p>
              </div>
            </Button>

            <Button
              onClick={runDeansListReport}
              variant="outline"
              className="h-auto flex-col items-start p-4 gap-2"
            >
              <GraduationCap className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <p className="font-semibold">Dean's List</p>
                <p className="text-xs text-gray-500">GPA ≥3.75, No violations</p>
              </div>
            </Button>

            <Button
              onClick={runVarsityAthletesReport}
              variant="outline"
              className="h-auto flex-col items-start p-4 gap-2"
            >
              <Users className="w-5 h-5 text-purple-600" />
              <div className="text-left">
                <p className="font-semibold">Varsity Athletes</p>
                <p className="text-xs text-gray-500">All varsity level players</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SearchIcon className="w-5 h-5" />
                Advanced Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Academic Filters */}
              <div>
                <h4 className="font-semibold text-sm mb-3">Academic</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Minimum GPA</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={minGPA}
                      onChange={(e) => setMinGPA(e.target.value)}
                      placeholder="e.g., 3.0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Maximum GPA</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={maxGPA}
                      onChange={(e) => setMaxGPA(e.target.value)}
                      placeholder="e.g., 4.0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Program</Label>
                    <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Programs</SelectItem>
                        {allPrograms.map(program => (
                          <SelectItem key={program} value={program}>{program}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Year Level</Label>
                    <Select value={selectedYearLevel} onValueChange={setSelectedYearLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Years</SelectItem>
                        <SelectItem value="1">Year 1</SelectItem>
                        <SelectItem value="2">Year 2</SelectItem>
                        <SelectItem value="3">Year 3</SelectItem>
                        <SelectItem value="4">Year 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Technical Skills */}
              <div>
                <h4 className="font-semibold text-sm mb-3">Technical Skills</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {allTechnicalSkills.slice(0, 10).map(skill => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={`skill-${skill}`}
                        checked={selectedSkills.includes(skill)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSkills([...selectedSkills, skill]);
                          } else {
                            setSelectedSkills(selectedSkills.filter(s => s !== skill));
                          }
                        }}
                      />
                      <label
                        htmlFor={`skill-${skill}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {skill}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedSkills.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {selectedSkills.length} skill(s) selected
                  </p>
                )}
              </div>

              {/* Sports */}
              <div>
                <h4 className="font-semibold text-sm mb-3">Sports</h4>
                <div className="space-y-2">
                  {allSports.map(sport => (
                    <div key={sport} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sport-${sport}`}
                        checked={selectedSports.includes(sport)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSports([...selectedSports, sport]);
                          } else {
                            setSelectedSports(selectedSports.filter(s => s !== sport));
                          }
                        }}
                      />
                      <label
                        htmlFor={`sport-${sport}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {sport}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <Label className="text-xs">Minimum Height (cm)</Label>
                  <Input
                    type="number"
                    value={minHeight}
                    onChange={(e) => setMinHeight(e.target.value)}
                    placeholder="e.g., 175"
                  />
                </div>
              </div>

              {/* Violations */}
              <div>
                <h4 className="font-semibold text-sm mb-3">Violations</h4>
                <Select value={hasViolations} onValueChange={(val) => setHasViolations(val as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="no">No Violations</SelectItem>
                    <SelectItem value="yes">Has Violations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-4 border-t">
                <Button onClick={resetFilters} variant="outline" className="w-full">
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Search Results</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                <Button onClick={generateReport} size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No students match the selected criteria</p>
                    <Button onClick={resetFilters} variant="link" className="mt-2">
                      Reset filters
                    </Button>
                  </div>
                ) : (
                  filteredStudents.map(student => (
                    <ResultCard key={student.id} student={student} />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ student }: { student: Student }) {
  return (
    <div className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-[#FF7F11] to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
            {student.firstName[0]}{student.lastName[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Link to={`/students/${student.id}`}>
                <h4 className="font-semibold text-gray-900 hover:text-blue-600">
                  {student.firstName} {student.lastName}
                </h4>
              </Link>
              <Badge variant="outline" className="text-xs">{student.studentNumber}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-2">
              <div>
                <span className="text-gray-500">Program:</span>
                <span className="ml-1 text-gray-900">Year {student.yearLevel}</span>
              </div>
              <div>
                <span className="text-gray-500">GPA:</span>
                <span className="ml-1 font-semibold text-blue-600">{student.gpa.toFixed(2)}</span>
              </div>
            </div>

            {/* Skills Preview */}
            <div className="flex flex-wrap gap-1 mb-2">
              {student.technicalSkills.slice(0, 3).map(skill => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {student.technicalSkills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{student.technicalSkills.length - 3}
                </Badge>
              )}
            </div>

            {/* Sports Preview */}
            {student.sportsSkills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {student.sportsSkills.map((sport, idx) => (
                  <Badge
                    key={idx}
                    className={sport.level === 'Varsity' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}
                  >
                    {sport.sport} ({sport.level})
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <Link to={`/students/${student.id}`}>
          <Button variant="outline" size="sm">
            View Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}