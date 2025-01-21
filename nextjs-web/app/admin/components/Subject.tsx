'use client';

import React from 'react'
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import api from './api';
import { Button, Input } from '@headlessui/react';
import Pagination from '@mui/material/Pagination';
import { PaginationItem } from '@mui/material';
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Object {
    id: string;
    name: string;
}

export default function Object() {
    const [objects, setObjects] = useState<Object[]>([]);
    const [loading, setLoading] = useState<Boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedObject, setSelectedObject] = useState<Object | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(true);
    const [editedObject, setEditedObject] = useState<Object | null>(null);
    const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
    const [newObjectName, setNewObjectName] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortColumn, setSortColumn] = useState<string | null>("id");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [totalPage, setTotalPage] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const Role = 'Subject';
    const role = 'subject';


    useEffect(() => {
        const dataObject = async (Role: string) => {
            try {
                const response = await api.get(`/General/get-page-data?Role=${Role}&pageNumber=${currentPage}`);
                setTotalPage(response.data.totalPage);
                setObjects(response.data.data);
            } catch (error) {
                setError('Failed to fetch data.');
            } finally {
                setLoading(false);
            }
        };

        dataObject(role);
    }, [currentPage]);

    const getNewObjects = async (Page: number, Role: string) => {
        try {
            const response = await api.get(`/General/get-page-data?Role=${Role}&pageNumber=${Page}`);
            setTotalPage(response.data.totalPage);
            setObjects(response.data.data);
        } catch (error) {
            setError('Failed to fetch data.');
        }
    };

    const handleChangePage = (event: React.ChangeEvent<unknown>, currentPage: number) => {
        setCurrentPage(currentPage);
    };

    const viewEditObject = (object: Object) => {
        setSelectedObject(object);
        setEditedObject(object);
        setIsModalOpen(!isModalOpen);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (editedObject) {
            setEditedObject({
                ...editedObject,
                [e.target.name]: e.target.value
            });
        }
    };

    const saveChanges = async (e: FormEvent) => {
        e.preventDefault();
        if (editedObject) {
            try {
                await api.patch(`/General?id=${editedObject.id}`, {
                    name: editedObject.name
                });
                setObjects(objects.map(object => object.id === editedObject.id ? editedObject : object));
                alert('Update successful!');
                setIsModalOpen(false);
                setIsEditing(true);
            } catch (error) {
                alert('Update failed.');
            }
        }
    };

    const cancelEdit = () => {
        setEditedObject(selectedObject);
        setIsEditing(true);
        setIsModalOpen(false);
    };

    const deleteObject = async (objectId: string) => {
        if (confirm(`Are you sure you want to delete this ${role}?`)) {
            try {
                await api.delete(`/General?id=${objectId}`);
                getNewObjects(currentPage, role);
                alert('Delete successful!');
            } catch (error: any) {
                alert('Delete failed.');
            }
        }
    };

    const handleAdd = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post(`/General/add`, {
                name: newObjectName,
                role
            });
            getNewObjects(currentPage, role);
            alert('Add successful.');
            setIsAddOpen(false);
            setNewObjectName('');
        } catch (error) {
            alert('Add failed.');
        }
    };

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const filteredObjects = objects.filter((object) =>
        object.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        object.id.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    const handleSort = (column: keyof Object) => {
        const newOrder = sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
        const sortedObjects = [...objects].sort((a, b) => {
            if (a[column] < b[column]) return newOrder === "asc" ? -1 : 1;
            if (a[column] > b[column]) return newOrder === "asc" ? 1 : -1;
            return 0;
        });
        setObjects(sortedObjects);
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
                        placeholder="Search..."
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
                    <div className='bg-white rounded shadow-lg p-6'>
                        <Button onClick={() => setIsAddOpen(false)} className='bg-gray-300 hover:text-red-500 shadow-lg flex ml-auto px-0.5 py-0.5'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                        </Button>
                        <h1 className='text-center uppercase font-bold pb-3'>Add {role}</h1>
                        <form className='flex flex-col' onSubmit={handleAdd}>
                            <label>Name of {role}: </label>
                            <Input
                                type='text'
                                value={newObjectName}
                                onChange={(e) => setNewObjectName(e.target.value)}
                                placeholder={`Enter name of ${role}`}
                                required
                                className='border border-gray-300 rounded-md py-1 pl-1 focus:outline-none focus:ring-2 focus:ring-black'
                            />
                            <Button type='submit' className='bg-green-500 hover:bg-green-700 rounded text-white mt-8 px-1.5 py-1 items-center'>Add</Button>
                        </form>
                    </div>
                </div>
            )}

            <div className="overflow-auto max-h-96 rounded">
                <table className="w-full table-auto border-collapse rounded shadow-md px-2 ">
                    <thead className="bg-gray-300 sticky z-0 top-0">
                        <tr className="divide-x divide-gray-200">
                            <th onClick={() => handleSort("id")} className="w-1/4 py-4 text-lg font-bold text-gray-500 uppercase tracking-wider"><div className='inline-flex items-center'>ID <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ml-2 size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                            </svg>
                            </div>
                            </th>
                            <th onClick={() => handleSort("name")} className="w-2/4 py-4 text-lg font-bold text-gray-500 uppercase tracking-wider text-start"><div className='inline-flex items-center'>Name <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ml-2 size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                            </svg>
                            </div></th>
                            <th className="w-1/4 py-4 text-lg font-bold text-gray-500 uppercase tracking-wider">Operation</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredObjects.length > 0 ? (
                            filteredObjects.map((object) => (
                                <tr key={object.id} className="divide-x divide-gray-200 hover:bg-gray-100">
                                    <td className="w-1/4 py-2 text-sm text-gray-500 text-center">{object.id}</td>
                                    <td className="w-2/4 py-2 whitespace-nowrap text-sm text-gray-500">{object.name}</td>
                                    <td className="w-1/4 py-2 text-sm text-gray-500 text-center">

                                        <Button onClick={() => viewEditObject(object)} className='hover:scale-110 hover:text-blue-500'>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 mr-3 ">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                                            </svg>
                                        </Button>

                                        <Button onClick={() => deleteObject(object.id)} className='hover:scale-110 hover:text-red-500'>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 mr-3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                        </Button>

                                    </td>
                                </tr>
                            ))) : (
                            <tr>
                                <td className="border px-4 py-2" colSpan={3}>No {role}s found.</td>
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

            {isModalOpen && selectedObject && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'>
                    <div className='bg-white rounded shadow-lg p-8'>
                        <Button onClick={() => { setIsModalOpen(false); setIsEditing(true) }} className='bg-gray-300 hover:text-red-500 shadow-lg flex ml-auto px-0.5 py-0.5'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                        </Button>
                        <h1 className='font-bold text-center mb-2 uppercase mt-2'>{Role} information</h1>
                        <form onSubmit={saveChanges}>
                            <div>
                                <div className='flex flex-col mb-1.5'>
                                    <label>ID:</label>
                                    <Input
                                        type='text'
                                        name='id'
                                        value={editedObject?.id}
                                        onChange={handleInputChange}
                                        disabled={true}
                                        className={`py-0.5 pl-0.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black bg-gray-300`}
                                    />
                                </div>

                                <div className='flex flex-col mb-1.5'>
                                    <label>{Role} name:</label>
                                    <Input
                                        type='text'
                                        name='name'
                                        value={editedObject?.name}
                                        onChange={handleInputChange}
                                        disabled={isEditing}
                                        required
                                        className={`py-0.5 pl-0.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black ${isEditing ? 'bg-gray-300' : ''}`}
                                    />
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
                    </div>
                </div>
            )}
        </div>
    )
}
