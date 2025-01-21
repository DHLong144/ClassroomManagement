'use client';

import React from 'react'
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import api from './api';
import Pagination from '@mui/material/Pagination';
import { PaginationItem } from '@mui/material';
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Button, Input, Combobox, ComboboxInput, ComboboxOption, ComboboxOptions, ComboboxButton, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';

interface Classroom {
    id: string;
    name: string;
    teacherId: string;
    subjectId: string
}

interface Teacher {
    id: string;
    name: string
}

interface Subject {
    id: string;
    name: string
}

interface Student {
    id: string;
    name: string
}


export default function Classroom() {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [loading, setLoading] = useState<Boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(true);
    const [editedClassroom, setEditedClassroom] = useState<Classroom | null>(null);
    const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [teacherQuery, setTeacherQuery] = useState<string>('');
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [subjectQuery, setSubjectQuery] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<Teacher | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [studentsInClass, setStudentsInClass] = useState<Student[]>([]);
    const [isAddStudentOpen, setIsAddStudentOpen] = useState<boolean>(false);
    const [studentQuery, setStudentQuery] = useState<string>('');
    const [studentListQuery, setStudentListQuery] = useState<string>('');
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [sortColumn, setSortColumn] = useState<string | null>("id");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [totalPage, setTotalPage] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<number>(1);

    useEffect(() => {
        const dataClassroom = async () => {
            try {
                const responseClassroom = await api.get(`/ClassRoom/get-page-data?pageNumber=${currentPage}`);
                const responseTeacher = await api.get('/General/get-all?Role=teacher');
                const responseSubject = await api.get('/General/get-all?Role=subject');
                const responseStudent = await api.get('/General/get-all?Role=student');
                setClassrooms(responseClassroom.data.data);
                setTotalPage(responseClassroom.data.totalPage);
                setTeachers(responseTeacher.data);
                setStudents(responseStudent.data);
                setSubjects(responseSubject.data);
            } catch (error: any) {
                console.error('Error fetching data:', error);
                setError('Failed to fetch data.');
            } finally {
                setLoading(false);
            }
        };

        dataClassroom();
    }, [currentPage]);

    const getNewClassrooms = async (Page: number) => {
        try {
            const response = await api.get(`/ClassRoom/get-page-data?pageNumber=${Page}`);
            setTotalPage(response.data.totalPage);
            setClassrooms(response.data.data);
        } catch (error) {
            setError('Failed to fetch data.');
        }
    };

    const handleChangePage = (event: React.ChangeEvent<unknown>, currentPage: number) => {
        setCurrentPage(currentPage);
    };

    const viewEditClassroom = async (classroom: Classroom) => {
        setSelectedClassroom(classroom);
        setEditedClassroom(classroom);
        setIsModalOpen(!isModalOpen);
        try {
            const response = await api.get(`/ClassRoom/class?classId=${classroom?.id}`);
            setStudentsInClass(response.data.students);
        } catch (error) {
            setError('Failed to fetch data student');
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (editedClassroom) {
            setEditedClassroom({
                ...editedClassroom,
                [e.target.name]: e.target.value
            });
        }
    };

    const saveChanges = async (e: FormEvent) => {
        e.preventDefault();
        if (editedClassroom) {
            try {
                await api.patch(`/ClassRoom/Class/switchteacher?ClassId=${editedClassroom.id}&newTeacherId=${selectedTeacher!.id}`);
                editedClassroom.teacherId = selectedTeacher!.id;
                setClassrooms(classrooms.map(classroom => classroom.id === editedClassroom.id ? editedClassroom : classroom));
                alert('Update successful!');
                setIsModalOpen(false);
                setSelectedSubject(null);
                setSelectedTeacher(null);
                setIsEditing(true);
            } catch (error) {
                alert('Update failed.');
            }
        }
    };

    const cancelEdit = () => {
        setEditedClassroom(selectedClassroom);
        setIsEditing(true);
        setIsModalOpen(false);
    };

    const deleteClassroom = async (classroomId: string) => {
        if (confirm(`Are you sure you want to delete this classroom?`)) {
            try {
                await api.delete(`/ClassRoom/class?classId=${classroomId}`);
                getNewClassrooms(currentPage);
                alert('Delete successful!');
            } catch (error: any) {
                alert('Delete failed.');
            }
        }
    };

    const handleAdd = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post(`/ClassRoom/add`, {
                teacherId: selectedTeacher?.id,
                subjectId: selectedSubject?.id
            });
            getNewClassrooms(currentPage);
            alert('Add successful.');
            setTeacherQuery('');
            setSubjectQuery('');
            setSelectedSubject(null);
            setSelectedTeacher(null);
            setIsAddOpen(false);
        } catch (error) {
            alert('Add failed.');
        }
    };

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const filteredClassrooms = classrooms.filter((classroom) =>
        classroom.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        classroom.id.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    const getTeacherName = (teacherId: string) => {
        const teacher = teachers.find(teacher => teacher.id === teacherId);
        return teacher ? teacher.name : 'No teacher assigned';
    };

    const getSubjectName = (subjectId: string) => {
        const subject = subjects.find(subject => subject.id === subjectId);
        return subject ? subject.name : 'No subject assigned';
    };

    const filteredTeacher = teachers.filter((teacher) =>
        teacher.name.toLowerCase().includes(teacherQuery.toLowerCase().trim())
    );

    const filteredSubject = subjects.filter((subject) =>
        subject.name.toLowerCase().includes(subjectQuery.toLowerCase().trim())
    );

    const filteredStudentList = studentsInClass.filter((student) =>
        student.name.toLocaleLowerCase().includes(studentListQuery.toLocaleLowerCase().trim()) ||
        student.id.toLocaleLowerCase().includes(studentListQuery.toLocaleLowerCase().trim())
    );

    const filteredStudent = students.filter((student) =>
        student.name.toLocaleLowerCase().includes(studentQuery.toLocaleLowerCase().trim()) ||
        student.id.toLocaleLowerCase().includes(studentQuery.toLocaleLowerCase().trim())
    );

    const deleteStudent = async (studentId: string, classId: string) => {
        if (confirm(`Are you sure you want to delete this student?`)) {
            try {
                await api.delete(`/ClassRoom/class/student?classId=${classId}&studentId=${studentId}`);
                setStudentsInClass(studentsInClass.filter(student => student.id !== studentId));
                alert('Delete successful!');
            } catch (error: any) {
                alert('Delete failed.');
            }
        }
    };

    const handleRowClick = (studentId: string) => {
        if (selectedStudentIds.includes(studentId)) {
            setSelectedStudentIds(selectedStudentIds.filter(id => id !== studentId));
        } else {
            setSelectedStudentIds([...selectedStudentIds, studentId]);
        }
    };

    const handleAddStudent = async (classId: string) => {
        if (selectedStudentIds) {
            try {
                await api.post(`/ClassRoom/class/student?classId=${classId}`, selectedStudentIds);
                const newStudents = students.filter(student => selectedStudentIds.includes(student.id));
                setStudentsInClass(prevStudentsInClass => [...prevStudentsInClass, ...newStudents]);
                setIsAddStudentOpen(false);
                setStudentQuery('');
                setSelectedStudentIds([]);
                alert('Add successful');
            } catch (error) {
                alert('Add failed');
            }
        };
    };

    const handleSort = (column: keyof Classroom) => {
        const newOrder = sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
        const sortedClassrooms = [...classrooms].sort((a, b) => {
            if (a[column] < b[column]) return newOrder === "asc" ? -1 : 1;
            if (a[column] > b[column]) return newOrder === "asc" ? 1 : -1;
            return 0;
        });
        setClassrooms(sortedClassrooms);
        setSortColumn(column);
        setSortOrder(newOrder);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>

    return (
        <div className='w-full'>
            <div className='flex flex-row justify-between h-1/6 mx-2 my-2'>
                <Button onClick={() => setIsAddOpen(!isAddOpen)} className='flex flex-row justify-center items-center px-4 bg-green-500 hover:bg-green-700 rounded text-white'>Add <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                </Button>

                <div className='flex flex-row relative justify-center items-center text-center py-1'>
                    <input
                        type="text"
                        placeholder="Search classroom..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="py-0.5 pl-0.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <div className='absolute inset-y-0 right-0 flex items-center pr-0.5'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </div>
                </div>
            </div>

            {isAddOpen && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
                    <div className='bg-white rounded shadow-lg p-6 w-1/4 flex flex-col items-center'>
                        <Button onClick={() => { setIsAddOpen(false); setSelectedTeacher(null); setSelectedSubject(null) }} className='bg-gray-300 hover:text-red-500 shadow-lg flex ml-auto px-0.5 py-0.5'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </Button>
                        <h1 className='text-center uppercase font-bold pb-3'>Add classroom</h1>
                        <form className='flex flex-col w-11/12' onSubmit={handleAdd}>
                            <label>Subject:</label>
                            <Combobox value={selectedSubject} onChange={setSelectedSubject} onClose={() => setSubjectQuery('')}>
                                <div className='relative'>
                                    <div className='flex flex-row'>
                                        <ComboboxInput
                                            onChange={(event) => setSubjectQuery(event.target.value)}
                                            className="border p-2 rounded w-full text-ellipsis overflow-hidden whitespace-nowrap"
                                            placeholder="Select a subject"
                                            required
                                            displayValue={(subject: Subject | null) => (subject ? `Id: ${subject.id} | Name: ${subject.name}` : '')}
                                        />
                                        <ComboboxButton className="absolute inset-y-0 -right-2.5 px-2.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                            </svg>
                                        </ComboboxButton>
                                    </div>
                                    <ComboboxOptions className='absolute z-10 w-full bg-white border border-gray-300 rounded shadow-md max-h-60 overflow-auto'>
                                        {filteredSubject.map((subject) => (
                                            <ComboboxOption key={subject.id} value={subject} className='hover:bg-gray-300 cursor-pointer'>
                                                {`Id: ${subject.id} | Name: ${subject.name}`}
                                            </ComboboxOption>
                                        ))}
                                    </ComboboxOptions>
                                </div>
                            </Combobox>

                            <label>Teacher:</label>
                            <Combobox value={selectedTeacher} onChange={setSelectedTeacher} onClose={() => setTeacherQuery('')}>
                                <div className='relative'>
                                    <div className='flex flex-row'>
                                        <ComboboxInput
                                            onChange={(event) => setTeacherQuery(event.target.value)}
                                            className="border p-2 rounded w-full text-ellipsis overflow-hidden whitespace-nowrap"
                                            placeholder="Select a teacher"
                                            required
                                            displayValue={(teacher: Teacher | null) => (teacher ? `Id: ${teacher.id} | Name: ${teacher.name}` : '')}
                                        />
                                        <ComboboxButton className='absolute inset-y-0 -right-2.5 px-2.5'>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                            </svg>
                                        </ComboboxButton>
                                    </div>
                                    <ComboboxOptions className='absolute z-10 w-full bg-white border border-gray-300 rounded shadow-md max-h-60 overflow-auto'>
                                        {filteredTeacher.map((teacher) => (
                                            <ComboboxOption key={teacher.id} value={teacher} className='hover:bg-gray-300 cursor-pointer'>
                                                {`Id: ${teacher.id} | Name: ${teacher.name}`}
                                            </ComboboxOption>
                                        ))}
                                    </ComboboxOptions>
                                </div>
                            </Combobox>

                            <Button type='submit' className='bg-green-500 hover:bg-green-700 rounded text-white mt-8 px-1.5 py-1 items-center'>Add</Button>
                        </form>
                    </div>
                </div>

            )}

            <div className="overflow-auto max-h-96 rounded">
                <table className="w-full table-auto border-collapse rounded shadow-md px-2">
                    <thead className="bg-gray-300 sticky z-0 top-0">
                        <tr className="divide-x divide-gray-200">
                            <th onClick={() => handleSort("id")} className="w-1/12 py-4 text-lg font-bold text-gray-500 uppercase tracking-wider"><div className='inline-flex justify-center items-center'>ID <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ml-2 size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                            </svg>
                            </div></th>
                            <th onClick={() => handleSort("name")} className="w-3/12 py-4 text-lg font-bold text-gray-500 uppercase tracking-wider text-left"><div className='inline-flex justify-center items-center'>Name <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ml-2 size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                            </svg>
                            </div></th>
                            <th onClick={() => handleSort("teacherId")} className="w-3/12 py-4 text-lg font-bold text-gray-500 uppercase tracking-wider text-left"><div className='inline-flex justify-center items-center'>Teacher <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ml-2 size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                            </svg>
                            </div></th>
                            <th onClick={() => handleSort("subjectId")} className="w-3/12 py-4 text-lg font-bold text-gray-500 uppercase tracking-wider text-left"><div className='inline-flex justify-center items-center'>Subject <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ml-2 size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                            </svg>
                            </div></th>
                            <th className="w-2/12 py-4 text-lg font-bold text-gray-500 uppercase tracking-wider">Operation</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredClassrooms.length > 0 ? (
                            filteredClassrooms.map((classroom) => (
                                <tr key={classroom.id} className="divide-x divide-gray-200 hover:bg-gray-100">
                                    <td className="w-1/12 py-2 text-sm text-gray-500 text-center">{classroom.id}</td>
                                    <td className="w-3/12 py-2 whitespace-nowrap text-sm text-gray-500">{classroom.name}</td>
                                    <td className="w-3/12 py-2 whitespace-nowrap text-sm text-gray-500">{getTeacherName(classroom.teacherId)}</td>
                                    <td className="w-3/12 py-2 whitespace-nowrap text-sm text-gray-500">{getSubjectName(classroom.subjectId)}</td>
                                    <td className="w-2/12 py-2 text-sm text-gray-500 text-center">

                                        <Button onClick={() => viewEditClassroom(classroom)} className='hover:scale-110 hover:text-blue-500'>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 mr-3 ">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                                            </svg>
                                        </Button>

                                        <Button onClick={() => deleteClassroom(classroom.id)} className='hover:scale-110 hover:text-red-500'>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 mr-3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                        </Button>

                                    </td>
                                </tr>
                            ))) : (
                            <tr>
                                <td className="border px-4 py-2" colSpan={3}>No classrooms found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className='flex justify-end mt-8 mb-1'>
                <Pagination
                    count={totalPage}
                    onChange={handleChangePage}
                    page={currentPage}
                    defaultPage={1}
                    showFirstButton
                    showLastButton
                    shape="rounded"
                    renderItem={(item) => (
                        <PaginationItem
                            slots={{
                                previous: (props) => (
                                    <ChevronLeftIcon {...props} className="size-4" />
                                ),
                                next: (props) => (
                                    <ChevronRightIcon {...props} className="size-4" />
                                ),
                                first: (props) => (
                                    <ChevronDoubleLeftIcon {...props} className="size-4" />
                                ),
                                last: (props) => (
                                    <ChevronDoubleRightIcon {...props} className="size-4" />
                                ),
                            }}
                            {...item}
                        />
                    )}
                />
            </div>

            {isModalOpen && selectedClassroom && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'>
                    <div className='bg-white rounded shadow-lg p-8 w-4/12 h-5/6'>
                        <Button onClick={() => { setIsModalOpen(false); setIsEditing(true); setStudentsInClass([]) }} className='bg-gray-300 hover:text-red-500 shadow-lg flex ml-auto px-0.5 py-0.5'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                        </Button>
                        <h1 className='font-bold text-center mb-4 uppercase mt-2'>Classroom information</h1>
                        <TabGroup>
                            <TabList>
                                <Tab className={({ selected }) =>
                                    selected
                                        ? 'rounded-md bg-gray-500 text-white p-1 mb-2 shadow-lg border-b-4 border-gray-700'
                                        : 'rounded-md bg-gray-200 text-gray-500 p-1 mb-2 hover:bg-gray-300 hover:text-gray-700'
                                }>Information</Tab>
                                <Tab className={({ selected }) =>
                                    selected
                                        ? 'rounded-md bg-gray-500 text-white p-1 mb-2 shadow-lg border-b-4 border-gray-700'
                                        : 'rounded-md bg-gray-200 text-gray-500 p-1 mb-2 hover:bg-gray-300 hover:text-gray-700'
                                }>Student list</Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel>
                                    <form onSubmit={saveChanges}>
                                        <div>
                                            <div className='flex flex-col'>
                                                <label>ID:</label>
                                                <Input
                                                    type='text'
                                                    name='id'
                                                    value={editedClassroom?.id}
                                                    onChange={handleInputChange}
                                                    disabled={true}
                                                    className={`py-0.5 pl-0.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black bg-gray-300`}
                                                />
                                            </div>

                                            <div className='flex flex-col mb-1.5'>
                                                <label>Classroom name:</label>
                                                <Input
                                                    type='text'
                                                    name='name'
                                                    value={editedClassroom?.name}
                                                    onChange={handleInputChange}
                                                    disabled={true}
                                                    className={`py-0.5 pl-0.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black bg-gray-300`}
                                                />
                                            </div>

                                            <div>
                                                <label>Subject:</label>
                                                <Combobox value={selectedSubject} onChange={setSelectedSubject} onClose={() => setSubjectQuery('')}>
                                                    <div className='relative'>
                                                        <div className='flex flex-row'>
                                                            <ComboboxInput
                                                                onChange={(event) => setSubjectQuery(event.target.value)}
                                                                className="border p-2 rounded w-full text-ellipsis whitespace-nowrap overflow-hidden bg-gray-300"
                                                                placeholder="Select a subject"
                                                                disabled={true}
                                                                displayValue={() => `Id: ${editedClassroom?.subjectId} | Name: ${getSubjectName(editedClassroom!.subjectId)}`}
                                                            />
                                                            <ComboboxButton disabled={true} className="absolute inset-y-0 -right-2.5 px-2.5">
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                                                </svg>
                                                            </ComboboxButton>
                                                        </div>
                                                        <ComboboxOptions className='absolute z-10 w-full bg-white border border-gray-300 rounded shadow-md max-h-60 overflow-auto'>
                                                            {filteredSubject.map((subject) => (
                                                                <ComboboxOption key={subject.id} value={subject}>
                                                                    {`Id: ${subject.id} | Name: ${subject.name}`}
                                                                </ComboboxOption>
                                                            ))}
                                                        </ComboboxOptions>
                                                    </div>
                                                </Combobox>
                                            </div>

                                            <div>
                                                <label>Teacher:</label>
                                                <Combobox value={selectedTeacher} onChange={setSelectedTeacher} onClose={() => setTeacherQuery('')}>
                                                    <div className='relative'>
                                                        <div className='flex flex-row'>
                                                            <ComboboxInput
                                                                onChange={(event) => setTeacherQuery(event.target.value)}
                                                                className={`border p-2 rounded w-full text-ellipsis whitespace-nowrap overflow-hidden ${isEditing ? 'bg-gray-300' : ''}`}
                                                                placeholder="Select a teacher"
                                                                required
                                                                disabled={isEditing}
                                                                displayValue={(teacher: Teacher | null) =>
                                                                    teacher ? `Id: ${teacher.id} | Name: ${teacher.name}` : `Id: ${editedClassroom?.teacherId} | Name: ${getTeacherName(editedClassroom!.teacherId)}`}
                                                            />
                                                            <ComboboxButton disabled={isEditing} className='absolute inset-y-0 -right-2.5 px-2.5'>
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                                                </svg>
                                                            </ComboboxButton>
                                                        </div>
                                                        <ComboboxOptions className='absolute z-10 w-full bg-white border border-gray-300 rounded shadow-md max-h-60 overflow-auto'>
                                                            {filteredTeacher.map((teacher) => (
                                                                <ComboboxOption key={teacher.id} value={teacher} className='hover:bg-gray-300 cursor-pointer'>
                                                                    {`Id: ${teacher.id} | Name: ${teacher.name}`}
                                                                </ComboboxOption>
                                                            ))}
                                                        </ComboboxOptions>
                                                    </div>
                                                </Combobox>
                                            </div>

                                            <div className='flex flex-row justify-between mt-8'>
                                                <Button onClick={() => setIsEditing(!isEditing)} className='flex flex-row bg-green-500 hover:bg-green-700 text-white rounded items-center p-1.5'>Edit <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                </svg>
                                                </Button>

                                                <div className='ml-20'>
                                                    <Button type='submit' className='bg-blue-500 hover:bg-blue-700 text-white rounded p-1.5 mr-2'>Save</Button>
                                                    <Button onClick={cancelEdit} type='button' className='bg-red-500 hover:bg-red-700 text-white rounded p-1.5'>Cancel</Button>
                                                </div>
                                            </div>

                                        </div>
                                    </form>
                                </TabPanel>

                                <TabPanel>
                                    <div className='flex flex-row justify-between mb-0.5'>
                                        <Button onClick={() => setIsAddStudentOpen(!isAddStudentOpen)} className='rounded text-white p-1 bg-green-500 hover:bg-green-700'>Add student</Button>
                                        <div className='flex flex-row relative justify-end items-center py-1'>
                                            <input
                                                type="text"
                                                placeholder="Search ..."
                                                value={studentListQuery}
                                                onChange={(e) => setStudentListQuery(e.target.value)}
                                                className="py-0.5 pl-0.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            />

                                            <div className='absolute inset-y-0 right-0 flex items-center pr-0.5'>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='overflow-auto max-h-60 shadow-md mt-2 rounded'>
                                        <table className="w-full table-auto border-collapse rounded shadow-md px-2">
                                            <thead className="bg-gray-300 sticky z-0 top-0">
                                                <tr className="divide-x divide-gray-200">
                                                    <th className="w-1/4 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">ID</th>
                                                    <th className="w-2/4 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-left">Name</th>
                                                    <th className="w-1/4 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Operation</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredStudentList.length > 0 ? (
                                                    filteredStudentList.map((student) => (
                                                        <tr key={student.id} className="divide-x divide-gray-200 hover:bg-gray-100">
                                                            <td className="w-1/4 py-2 text-sm text-gray-500 text-center">{student.id}</td>
                                                            <td className="w-2/4 py-2 whitespace-nowrap text-sm text-gray-500">{student.name}</td>
                                                            <td className="w-1/4 py-2 text-sm text-gray-500 text-center">
                                                                <Button onClick={() => deleteStudent(student.id, selectedClassroom.id)} className='hover:scale-110 hover:text-red-500'>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                                    </svg>
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))) : (
                                                    <tr>
                                                        <td className="border px-4 py-2" colSpan={3}>No student found.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                </TabPanel>
                            </TabPanels>
                        </TabGroup>
                    </div>
                </div>
            )}

            {isAddStudentOpen && selectedClassroom && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'>
                    <div className='bg-white rounded flex flex-col shadow-lg p-8 w-4/12 h-5/6'>

                        <Button onClick={() => { setIsAddStudentOpen(false); setSelectedStudentIds([]); setStudentQuery('') }} className='bg-gray-300 hover:text-red-500 shadow-lg flex ml-auto px-0.5 py-0.5'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                        </Button>

                        <h1 className='text-center font-bold uppercase'>Students</h1>

                        <div className='flex flex-row relative justify-end items-center py-1'>
                            <input
                                type="text"
                                placeholder="Search ..."
                                value={studentQuery}
                                onChange={(e) => setStudentQuery(e.target.value)}
                                className="py-0.5 pl-0.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />

                            <div className='absolute inset-y-0 right-0 flex items-center pr-0.5'>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                            </div>
                        </div>

                        <div className="overflow-auto max-h-72 shadow-md rounded">
                            <table className="w-full table-auto border-collapse rounded shadow-md px-2">
                                <thead className="bg-gray-300 sticky z-0 top-0">
                                    <tr className="divide-x divide-gray-200">
                                        <th className="w-1/12 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="w-3/12 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-left">Name</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredStudent.length > 0 ? (
                                        filteredStudent.map((student) => (
                                            <tr key={student.id} onClick={() => handleRowClick(student.id)} className={`divide-x divide-gray-200 hover:bg-gray-100 cursor-pointer border ${selectedStudentIds.includes(student.id) ? 'bg-green-200' : ''} ${studentsInClass.find(existingStudent => existingStudent.id === student.id) ? 'bg-green-100' : ''}`}>
                                                <td className="w-1/12 py-2 text-sm text-gray-500 text-center">{student.id}</td>
                                                <td className="w-3/12 py-2 whitespace-nowrap text-sm text-gray-500">{student.name}</td>
                                            </tr>
                                        ))) : (
                                        <tr>
                                            <td className="border px-4 py-2" colSpan={2}>No classrooms found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <Button onClick={() => { handleAddStudent(selectedClassroom.id) }} className='text-white rounded p-1 shadow-sm bg-green-500 hover:bg-green-700 mt-4'>ADD</Button>
                    </div>
                </div>
            )}

        </div>
    )
}
