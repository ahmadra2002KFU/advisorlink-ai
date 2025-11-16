import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, Student, CreateStudentData, UpdateStudentData } from '@/api/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, UserPlus, Pencil, Trash2, GraduationCap, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const StudentManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state for create
  const [createForm, setCreateForm] = useState<CreateStudentData>({
    email: '',
    password: '',
    fullName: '',
    studentId: '',
    birthdate: '',
    levelId: 1,
    sectionId: 1,
    gpa: 0.0,
    attendancePercentage: 100.0
  });

  // Form state for edit
  const [editForm, setEditForm] = useState<UpdateStudentData>({});

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: adminApi.getAllStudents
  });

  // Filter students
  const filteredStudents = students.filter((student: Student) => {
    const matchesSearch =
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateStudentData) => adminApi.createStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsCreateDialogOpen(false);
      setCreateForm({
        email: '',
        password: '',
        fullName: '',
        studentId: '',
        birthdate: '',
        levelId: 1,
        sectionId: 1,
        gpa: 0.0,
        attendancePercentage: 100.0
      });
      toast({
        title: 'Success',
        description: 'Student created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create student',
        variant: 'destructive',
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStudentData }) =>
      adminApi.updateStudent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsEditDialogOpen(false);
      setSelectedStudent(null);
      setEditForm({});
      toast({
        title: 'Success',
        description: 'Student updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update student',
        variant: 'destructive',
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsDeleteDialogOpen(false);
      setSelectedStudent(null);
      toast({
        title: 'Success',
        description: 'Student deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete student',
        variant: 'destructive',
      });
    }
  });

  const handleCreate = () => {
    createMutation.mutate(createForm);
  };

  const handleEdit = () => {
    if (!selectedStudent) return;
    updateMutation.mutate({ id: selectedStudent.id, data: editForm });
  };

  const handleDelete = () => {
    if (!selectedStudent) return;
    deleteMutation.mutate(selectedStudent.id);
  };

  const openEditDialog = (student: Student) => {
    setSelectedStudent(student);
    setEditForm({
      email: student.email,
      fullName: student.full_name,
      studentIdNumber: student.student_id,
      birthdate: student.birthdate,
      gpa: student.gpa,
      attendancePercentage: student.attendance_percentage
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold">Student Management</h3>
          <p className="text-muted-foreground">Manage all students in the system</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or student ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Total Students</div>
            <div className="text-2xl font-bold mt-1">{students.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">With Advisors</div>
            <div className="text-2xl font-bold mt-1 text-green-600">
              {students.filter((s: Student) => s.has_advisor).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Without Advisors</div>
            <div className="text-2xl font-bold mt-1 text-amber-600">
              {students.filter((s: Student) => !s.has_advisor).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No students found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>GPA</TableHead>
                  <TableHead>Advisor</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student: Student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.student_id}</TableCell>
                    <TableCell>{student.full_name}</TableCell>
                    <TableCell className="text-muted-foreground">{student.email}</TableCell>
                    <TableCell>{student.level_name}</TableCell>
                    <TableCell>{student.section_name}</TableCell>
                    <TableCell>
                      <span className={student.gpa >= 3.0 ? 'text-green-600 font-semibold' : student.gpa >= 2.0 ? 'text-amber-600' : 'text-red-600 font-semibold'}>
                        {student.gpa.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {student.has_advisor ? (
                        <span className="text-green-600">✓ Assigned</span>
                      ) : (
                        <span className="text-amber-600">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(student)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(student)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground text-center">
        Showing {filteredStudents.length} of {students.length} students
      </p>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Create a new student account with their details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID *</Label>
                <Input
                  id="studentId"
                  value={createForm.studentId}
                  onChange={(e) => setCreateForm({ ...createForm, studentId: e.target.value })}
                  placeholder="S2024001"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="student@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthdate">Birthdate *</Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={createForm.birthdate}
                  onChange={(e) => setCreateForm({ ...createForm, birthdate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="levelId">Level *</Label>
                <Select
                  value={createForm.levelId.toString()}
                  onValueChange={(value) => setCreateForm({ ...createForm, levelId: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <SelectItem key={level} value={level.toString()}>
                        Level {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sectionId">Section *</Label>
                <Select
                  value={createForm.sectionId.toString()}
                  onValueChange={(value) => setCreateForm({ ...createForm, sectionId: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Section IDs: 1=Level1-A, 2=Level1-B, 3=Level1-C, etc. */}
                    {(() => {
                      const levelOffset = (createForm.levelId - 1) * 3;
                      return ['A', 'B', 'C'].map((section, idx) => (
                        <SelectItem key={idx} value={(levelOffset + idx + 1).toString()}>
                          Section {section}
                        </SelectItem>
                      ));
                    })()}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gpa">GPA (0.0 - 4.0)</Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={createForm.gpa}
                  onChange={(e) => setCreateForm({ ...createForm, gpa: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendance">Attendance % (0 - 100)</Label>
                <Input
                  id="attendance"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={createForm.attendancePercentage}
                  onChange={(e) => setCreateForm({ ...createForm, attendancePercentage: parseFloat(e.target.value) || 100 })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Student'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update student information (leave fields empty to keep current values)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editFullName">Full Name</Label>
                <Input
                  id="editFullName"
                  value={editForm.fullName || ''}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  placeholder={selectedStudent?.full_name}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editStudentId">Student ID</Label>
                <Input
                  id="editStudentId"
                  value={editForm.studentIdNumber || ''}
                  onChange={(e) => setEditForm({ ...editForm, studentIdNumber: e.target.value })}
                  placeholder={selectedStudent?.student_id}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder={selectedStudent?.email}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editBirthdate">Birthdate</Label>
              <Input
                id="editBirthdate"
                type="date"
                value={editForm.birthdate || ''}
                onChange={(e) => setEditForm({ ...editForm, birthdate: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editGpa">GPA (0.0 - 4.0)</Label>
                <Input
                  id="editGpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={editForm.gpa ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, gpa: parseFloat(e.target.value) })}
                  placeholder={selectedStudent?.gpa.toFixed(2)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editAttendance">Attendance % (0 - 100)</Label>
                <Input
                  id="editAttendance"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={editForm.attendancePercentage ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, attendancePercentage: parseFloat(e.target.value) })}
                  placeholder={selectedStudent?.attendance_percentage.toFixed(1)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update Student'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this student? This action cannot be undone.
              All associated data including conversations and messages will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="bg-muted p-4 rounded-lg space-y-1">
              <p><strong>Name:</strong> {selectedStudent.full_name}</p>
              <p><strong>Student ID:</strong> {selectedStudent.student_id}</p>
              <p><strong>Email:</strong> {selectedStudent.email}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Student'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentManager;
