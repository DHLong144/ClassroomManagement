'use client';

import React from 'react'
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import api from './api';
import { Button, Input, Combobox, ComboboxInput, ComboboxOption, ComboboxOptions, ComboboxButton, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';

interface Score {
    id: number;
    subjectScore: string;
    studentId: string;
    studentName: string;
    subjectId: string;
    subjectName: string
}

interface Student {
    id: string;
    name: string
}

interface Subject {
    id: string;
    name: string
}

interface Classroom {
    id: string;
    name: string;
    teacherId: string;
    subjectId: string
}

export default function Score() {
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<Boolean>(true);
    const [scores, setScores] = useState<Score[]>([]);
    const [scoreQuery, setScoreQuery] = useState<string>('');
    const [students, setStudents] = useState<Student[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isOpenEnterScore, setIsOpenEnterScore] = useState<Boolean>(false);
    const [isOpenAcademicTranscrip, setIsOpenAcademicTranscrip] = useState<Boolean>(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [studentQuery, setStudentQuery] = useState<string>('');
    const [subjectQuery, setSubjectQuery] = useState<string>('');
    const [academicTranscrip, setAcademicTranscrip] = useState<Score[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [enterPoints, setEnterPoints] = useState<Score[]>([]);
    const [isFixScoreOpen, setIsFixScoreOpen] = useState<Boolean>(false);
    const [selectedScore, setSelectedScore] = useState<Score | null>(null);
    const [fixedScore, setFixedScore] = useState<Score | null>(null);
    const [sortColumn, setSortColumn] = useState<string | null>("id");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    useEffect(() => {
        const dataScore = async () => {
            try {
                const responseScore = await api.get(`/Score/get-all`);
                const responseClassroom = await api.get('/ClassRoom/get-all');
                const responseSubject = await api.get('/General/get-all?Role=subject');
                const responseStudent = await api.get('/General/get-all?Role=student');
                setScores(responseScore.data);
                setClassrooms(responseClassroom.data);
                setStudents(responseStudent.data);
                setSubjects(responseSubject.data);
            } catch (error: any) {
                console.error('Error fetching data:', error);
                setError('Failed to fetch data.');
            } finally {
                setLoading(false);
            }
        };

        dataScore();
    }, []);

    const scoreView = scores.filter((score) => score.subjectScore !== 'null');

    const updatedScoresView = scoreView.map((score) => {
        const student = students.find((s) => s.id === score.studentId);

        const subject = subjects.find((s) => s.id === score.subjectId);

        return {
            ...score,
            studentName: student ? student.name : 'Unknown Student',
            subjectName: subject ? subject.name : 'Unknown Subject',
        };
    });

    const scoreEnterPoint = scores.filter((score) => score.subjectScore === 'null');

    const updatedScoresEnterPoint = scoreEnterPoint.map((score) => {
        const student = students.find((s) => s.id === score.studentId);

        const subject = subjects.find((s) => s.id === score.subjectId);

        return {
            ...score,
            studentName: student ? student.name : 'Unknown Student',
            subjectName: subject ? subject.name : 'Unknown Subject',
        };
    });

    useEffect(() => {
        if (selectedSubject) {
            const getEnterPoint = () => {
                const enterPoint = updatedScoresEnterPoint.filter((score) => score.subjectId === selectedSubject.id);
                setEnterPoints(enterPoint);
            };

            getEnterPoint();
        }
    }, [selectedSubject]);

    const filterScore = updatedScoresView.filter((score) =>
        score.studentName.toLocaleLowerCase().includes(scoreQuery.toLocaleLowerCase().trim()) ||
        score.subjectName.toLocaleLowerCase().includes(scoreQuery.toLocaleLowerCase().trim())
    );

    useEffect(() => {
        if (selectedStudent) {
            const getAcademicTranscrip = () => {

                const studentScores = updatedScoresView.filter((score) => score.studentId === selectedStudent.id);
                const sortedScores = studentScores.sort((a, b) => b.id - a.id);

                const transcrip: Score[] = [];
                sortedScores.forEach((score) => {

                    if (!transcrip.some(item => item.subjectId === score.subjectId)) {
                        transcrip.push(score);
                    }
                });

                setAcademicTranscrip(transcrip);
            };

            getAcademicTranscrip();
        }
    }, [selectedStudent]);


    const filteredStudent = students.filter((student) =>
        student.name.toLocaleLowerCase().includes(studentQuery.toLocaleLowerCase().trim()) ||
        student.id.toLocaleLowerCase().includes(studentQuery.toLocaleLowerCase().trim())
    );

    const filteredSubject = subjects.filter((subject) =>
        subject.name.toLowerCase().includes(subjectQuery.toLowerCase().trim()) ||
        subject.id.toLocaleLowerCase().includes(subjectQuery.toLocaleLowerCase().trim())
    );

    const handleInputPoint = (e: ChangeEvent<HTMLInputElement>, id: number) => {
        setEnterPoints((prevPoints) =>
            prevPoints.map((point) =>
                point.id === id ? { ...point, subjectScore: e.target.value } : point
            )
        );
    };

    const handleSavePoint = async (enterPoints: Score[]) => {
        if (enterPoints) {
            try {
                await api.post(`/Score/Enter-point`, enterPoints);
                alert('Successful.');
                setIsOpenEnterScore(false);
                setEnterPoints([]);
                setSelectedSubject(null);
                setScores((prevScores) =>
                    prevScores.map((score) => {
                        const updatedPoint = enterPoints.find((point) => point.id === score.id);
                        return updatedPoint ? { ...score, subjectScore: updatedPoint.subjectScore } : score;
                    }));
            } catch (error) {
                setError('Failed to enter point');
                alert('Failed.');
            }
        }
    };

    const handleDeleteScore = async (score: Score) => {
        if (score) {
            if (confirm(`Are you sure you want to delete this student?`)) {
                try {
                    await api.delete(`/Score/Subject/Student?SubjectId=${score.subjectId}&StudentId=${score.studentId}`);
                    setScores(scores.filter((s) => s.id !== score.id));
                    alert('Delete successful.');
                } catch (error) {
                    alert('Delete failed.');
                    setError('Failed to delete score.')
                }
            };
        }
    };

    const handleFixScore = async (e: FormEvent) => {
        e.preventDefault();
        if (fixedScore) {
            try {
                await api.patch(`/Score/Subject/Student?SubjectId=${fixedScore.subjectId}&StudentID=${fixedScore.studentId}&newscore=${fixedScore.subjectScore}`);
                setScores(scores.map(score => score.id === fixedScore.id ? fixedScore : score));
                setFixedScore(null);
                setSelectedScore(null);
                setIsFixScoreOpen(false);
                alert('Update score successful.');
            } catch (error) {
                setError('Failed to update score.');
                alert('Update score failed.');
            }
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (fixedScore) {
            setFixedScore({
                ...fixedScore,
                [e.target.name]: e.target.value
            });
        }
    };

    const handleSort = (column: keyof Score) => {
        const newOrder = sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
        const sortedScores = [...updatedScoresView].sort((a, b) => {
            if (a[column] < b[column]) return newOrder === "asc" ? -1 : 1;
            if (a[column] > b[column]) return newOrder === "asc" ? 1 : -1;
            return 0;
        });
        setScores(sortedScores);
        setSortColumn(column);
        setSortOrder(newOrder);
    };

    if (loading) return <div>Loading...</div>

    return (
        <div className='w-full'>
            <div className='flex flex-row justify-between p-2 rounded'>
                <div className='flex flex-row'>
                    <Button onClick={() => setIsOpenEnterScore(true)} className='flex justify-center items-center px-4 bg-green-500 hover:bg-green-700 rounded text-white mr-2'>Enter score</Button>

                    <Button onClick={() => setIsOpenAcademicTranscrip(true)} className='flex justify-center items-center px-4 bg-green-500 hover:bg-green-700 rounded text-white'>Academic transcript</Button>
                </div>

                <div className='flex flex-row relative justify-center items-center text-center py-1'>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={scoreQuery}
                        onChange={(e) => setScoreQuery(e.target.value)}
                        className="py-0.5 pl-0.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />

                    <div className='absolute inset-y-0 right-0 flex items-center pr-0.5'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="overflow-auto max-h-96 rounded">
                <table className="w-full table-auto border-collapse rounded shadow-md px-2">
                    <thead className="bg-gray-300 sticky z-0 top-0">
                        <tr className="divide-x divide-gray-200">
                            <th onClick={() => handleSort("id")} className="w-1/12 py-4 text-lg font-bold text-gray-500 uppercase tracking-wider"><div className='inline-flex justify-center items-center'>ID <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ml-2 size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                            </svg>
                            </div></th>
                            <th onClick={() => handleSort("studentId")} className="w-2/12 py-4 text-lg font-bold text-gray-500 uppercase tracking-wider text-left"><div className='inline-flex justify-center items-center'>Student ID <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ml-2 size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                            </svg>
                            </div></th>
                            <th onClick={() => handleSort("studentName")} className="w-3/12 py-4 text-lg font-bold text-gray-500 uppercase tracking-wider text-left"><div className='inline-flex justify-center items-center'>Student <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ml-2 size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                            </svg>
                            </div></th>
                            <th onClick={() => handleSort("subjectId")} className="w-2/12 py-4 text-lg font-bold text-gray-500 uppercase tracking-wider text-left"><div className='inline-flex justify-center items-center'>Subject ID <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ml-2 size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                            </svg>
                            </div></th>
                            <th onClick={() => handleSort("subjectName")} className="w-3/12 py-4 text-lg font-bold text-gray-500 uppercase tracking-wider text-left"><div className='inline-flex justify-center items-center'>Subject <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ml-2 size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                            </svg>
                            </div></th>
                            <th onClick={() => handleSort("subjectScore")} className="w-1/12 py-4 text-lg font-bold text-gray-500 uppercase tracking-wider"><div className='inline-flex justify-center items-center'>Score <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ml-2 size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                            </svg>
                            </div></th>
                            <th className="w-2/12 py-4 text-lg font-bold text-gray-500 uppercase tracking-wider">Operation</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filterScore.length > 0 ? (
                            filterScore.map((score) => (
                                <tr key={score.id} className="divide-x divide-gray-200 hover:bg-gray-100">
                                    <td className="w-1/12 py-2 text-sm text-gray-500 text-center">{score.id}</td>
                                    <td className="w-2/12 py-2 whitespace-nowrap text-sm text-gray-500">{score.studentId}</td>
                                    <td className="w-3/12 py-2 whitespace-nowrap text-sm text-gray-500">{score.studentName}</td>
                                    <td className="w-2/12 py-2 whitespace-nowrap text-sm text-gray-500">{score.subjectId}</td>
                                    <td className="w-3/12 py-2 whitespace-nowrap text-sm text-gray-500">{score.subjectName}</td>
                                    <td className="w-1/12 py-2 text-sm text-gray-500 text-center">{score.subjectScore}</td>
                                    <td className="w-2/12 py-2 text-sm text-gray-500 text-center">

                                        <Button onClick={() => { setIsFixScoreOpen(true); setSelectedScore(score); setFixedScore(score) }} className='hover:scale-110 hover:text-green-500 mr-2'>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                            </svg>

                                        </Button>

                                        <Button onClick={() => handleDeleteScore(score)} className='hover:scale-110 hover:text-red-500'>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                        </Button>

                                    </td>
                                </tr>
                            ))) : (
                            <tr>
                                <td className="border px-4 py-2" colSpan={7}>No score found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isFixScoreOpen && selectedScore && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'>
                    <div className='bg-white rounded shadow-lg p-8 w-4/12 h-5/6'>
                        <Button onClick={() => { setIsFixScoreOpen(false); setSelectedScore(null); setFixedScore(null) }} className='bg-gray-300 hover:text-red-500 shadow-lg flex ml-auto px-0.5 py-0.5'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                        </Button>

                        <form onSubmit={handleFixScore} className='flex flex-col'>
                            <h1 className='font-bold text-xl uppercase text-center my-2'>Score</h1>

                            <div className='my-5'>
                                <label>Student:</label>
                                <Combobox value={fixedScore}>
                                    <ComboboxInput
                                        className={`border p-2 rounded w-full text-ellipsis whitespace-nowrap overflow-hidden bg-gray-300`}
                                        disabled={true}
                                        displayValue={(score: Score) =>
                                            `Id: ${score.studentId} | Name: ${score.studentName}`}
                                    />
                                </Combobox>
                            </div>

                            <div className='my-2.5'>
                                <label>Subject:</label>
                                <Combobox value={fixedScore}>
                                    <ComboboxInput
                                        className={`border p-2 rounded w-full text-ellipsis whitespace-nowrap overflow-hidden bg-gray-300`}
                                        disabled={true}
                                        displayValue={(score: Score) =>
                                            `Id: ${score.subjectId} | Name: ${score.subjectName}`}
                                    />
                                </Combobox>
                            </div>

                            <div className='my-5'>
                                <label>Score:</label>
                                <Input
                                    type='text'
                                    name='subjectScore'
                                    value={fixedScore?.subjectScore}
                                    onChange={handleInputChange}
                                    className={`border border-gray-300 ml-1 w-1/5 text-center rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black`}
                                />
                            </div>

                            <div className='mt-6 flex flex-row justify-end'>
                                <Button type='submit' className='bg-green-500 hover:bg-green-700 text-white shadow rounded p-1.5 mr-2'>Save Change</Button>
                                <Button onClick={() => { setIsFixScoreOpen(false); setSelectedScore(null); setFixedScore(null) }} type='button' className='bg-red-500 hover:bg-red-700 text-white shadow rounded p-1.5'>Cancel</Button>
                            </div>
                        </form>

                    </div>
                </div>
            )}

            {isOpenEnterScore && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'>
                    <div className='bg-white rounded shadow-lg p-8 w-4/5 h-5/6'>
                        <Button onClick={() => { setIsOpenEnterScore(false), setSelectedSubject(null); setEnterPoints([]) }} className='bg-gray-300 hover:text-red-500 shadow-lg flex ml-auto px-0.5 py-0.5'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                        </Button>

                        <div>
                            <label>Subject:</label>
                            <Combobox value={selectedSubject} onChange={setSelectedSubject} onClose={() => setSubjectQuery('')}>
                                <div className='relative'>
                                    <div className='flex flex-row'>
                                        <ComboboxInput
                                            onChange={(event) => setSubjectQuery(event.target.value)}
                                            className={`border p-2 rounded w-full text-ellipsis whitespace-nowrap overflow-hidden`}
                                            placeholder="Select a subject"
                                            required
                                            displayValue={(subject: Subject | null) =>
                                                subject ? `Id: ${subject.id} | Name: ${subject.name}` : ``}
                                        />
                                        <ComboboxButton className='absolute inset-y-0 -right-2.5 px-2.5'>
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
                        </div>

                        {selectedSubject && (
                            <div>
                                <div className="overflow-auto max-h-72 rounded mt-2">
                                    <table className="w-full table-auto border-collapse rounded shadow-md px-2">
                                        <thead className="bg-gray-300 sticky z-0 top-0">
                                            <tr className="divide-x divide-gray-200">
                                                <th className="w-1/12 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">ID</th>
                                                <th className="w-2/12 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-left">Student ID</th>
                                                <th className="w-3/12 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-left">Student</th>
                                                <th className="w-2/12 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-left">Subject ID</th>
                                                <th className="w-3/12 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-left">Subject</th>
                                                <th className="w-1/12 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Score</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {enterPoints.length > 0 ? (
                                                enterPoints.map((score) => (
                                                    <tr key={score.id} className="divide-x divide-gray-200 hover:bg-gray-100">
                                                        <td className="w-1/12 py-2 text-sm text-gray-500 text-center">{score.id}</td>
                                                        <td className="w-2/12 py-2 whitespace-nowrap text-sm text-gray-500">{score.studentId}</td>
                                                        <td className="w-3/12 py-2 whitespace-nowrap text-sm text-gray-500">{score.studentName}</td>
                                                        <td className="w-2/12 py-2 whitespace-nowrap text-sm text-gray-500">{score.subjectId}</td>
                                                        <td className="w-3/12 py-2 whitespace-nowrap text-sm text-gray-500">{score.subjectName}</td>
                                                        <td className="w-1/12 py-2 text-sm text-gray-500 text-center">
                                                            <Input
                                                                type='text'
                                                                name='point'
                                                                value={score.subjectScore}
                                                                onChange={(e) => handleInputPoint(e, score.id)}
                                                                className='text-center w-3/5 rounded focus:outline-none focus:ring-2 focus:ring-black'
                                                            />
                                                        </td>
                                                    </tr>
                                                ))) : (
                                                <tr>
                                                    <td className="border px-4 py-2" colSpan={6}>No score found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <Button onClick={() => handleSavePoint(enterPoints)} className='bg-green-500 hover:bg-green-700 text-white flex rounded p-1.5 shadow ml-auto mt-2'>Save Change</Button>
                            </div>

                        )}
                    </div>
                </div>
            )}

            {isOpenAcademicTranscrip && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'>
                    <div className='bg-white rounded shadow-lg p-8 w-4/5 h-5/6'>
                        <Button onClick={() => { setIsOpenAcademicTranscrip(false), setSelectedStudent(null); setAcademicTranscrip([]) }} className='bg-gray-300 hover:text-red-500 shadow-lg flex ml-auto px-0.5 py-0.5'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                        </Button>

                        <div>
                            <label>Student:</label>
                            <Combobox value={selectedStudent} onChange={setSelectedStudent} onClose={() => setStudentQuery('')}>
                                <div className='relative'>
                                    <div className='flex flex-row'>
                                        <ComboboxInput
                                            onChange={(event) => setStudentQuery(event.target.value)}
                                            className={`border p-2 rounded w-full text-ellipsis whitespace-nowrap overflow-hidden`}
                                            placeholder="Select a student"
                                            required
                                            displayValue={(student: Student | null) =>
                                                student ? `Id: ${student.id} | Name: ${student.name}` : ``}
                                        />
                                        <ComboboxButton className='absolute inset-y-0 -right-2.5 px-2.5'>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                            </svg>
                                        </ComboboxButton>
                                    </div>
                                    <ComboboxOptions className='absolute z-10 w-full bg-white border border-gray-300 rounded shadow-md max-h-60 overflow-auto'>
                                        {filteredStudent.map((student) => (
                                            <ComboboxOption key={student.id} value={student} className='hover:bg-gray-300 cursor-pointer'>
                                                {`Id: ${student.id} | Name: ${student.name}`}
                                            </ComboboxOption>
                                        ))}
                                    </ComboboxOptions>
                                </div>
                            </Combobox>
                        </div>

                        {selectedStudent && (
                            <div className="overflow-auto max-h-72 rounded mt-2">
                                <table className="w-full table-auto border-collapse rounded shadow-md px-2">
                                    <thead className="bg-gray-300 sticky z-0 top-0">
                                        <tr className="divide-x divide-gray-200">
                                            <th className="w-2/5 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-left">SubjectID</th>
                                            <th className="w-2/5 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-left">Subject</th>
                                            <th className="w-1/5 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {academicTranscrip.length > 0 ? (
                                            academicTranscrip.map((score) => (
                                                <tr key={score.id} className="divide-x divide-gray-200 hover:bg-gray-100">
                                                    <td className="w-2/5 py-2 whitespace-nowrap text-sm text-gray-500">{score.subjectId}</td>
                                                    <td className="w-2/5 py-2 whitespace-nowrap text-sm text-gray-500">{score.subjectName}</td>
                                                    <td className="w-1/5 py-2 text-sm text-gray-500 text-center">{score.subjectScore}</td>
                                                </tr>
                                            ))) : (
                                            <tr>
                                                <td className="border px-4 py-2" colSpan={4}>No score found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                    </div>
                </div>
            )}

        </div>
    )
}
