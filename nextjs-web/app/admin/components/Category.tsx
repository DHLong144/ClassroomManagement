'use client';

import React from 'react'
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import api from './api';
import { useRouter } from 'next/navigation';
import Pagination from '@mui/material/Pagination';
import { PaginationItem } from '@mui/material';
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Button, Input, Combobox, ComboboxInput, ComboboxOption, ComboboxOptions, ComboboxButton, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';

interface Category {
    id: number;
    categoryName: string;
    parentCategory: string;
    url: string
}

export default function Classroom() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<Boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(true);
    const [editedCategory, setEditedCategory] = useState<Category | null>(null);
    const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchCategoryQuery, setSearchCategoryQuery] = useState<string>('');
    const [sortColumn, setSortColumn] = useState<string | null>("id");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [totalPage, setTotalPage] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [newCategoryName, setNewCategoryName] = useState<string>('');
    const [newUrl, setNewUrl] = useState<string>('');
    const [newParentCategory, setNewParentCategory] = useState<string | null>(null);
    const [allCategory, setAllCategory] = useState<Category[]>([]);
    const router = useRouter();

    useEffect(() => {
        const allCategory = async () => {
            const response = await api.get(`/Menu/get-all`);
            setAllCategory(response.data);
        }

        allCategory();
    }, []);

    useEffect(() => {
        const dataCategory = async () => {
            try {
                const response = await api.get(`/Menu/get-page-data?pageNumber=${currentPage}`);
                setCategories(response.data.data);
                setTotalPage(response.data.totalPage);
            } catch (error: any) {
                console.error('Error fetching data:', error);
                setError('Failed to fetch data.');
            } finally {
                setLoading(false);
            }
        };

        dataCategory();
    }, [currentPage]);

    const getNewCategories = async (Page: number) => {
        try {
            const response = await api.get(`/Menu/get-page-data?pageNumber=${Page}`);
            setTotalPage(response.data.totalPage);
            setCategories(response.data.data);
        } catch (error) {
            setError('Failed to fetch data.');
        }
    };

    const handleChangePage = (event: React.ChangeEvent<unknown>, currentPage: number) => {
        setCurrentPage(currentPage);
    };

    const filteredCategories = categories.filter((category) =>
        category.categoryName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        category.parentCategory.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        category.url.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    const handleSort = (column: keyof Category) => {
        const newOrder = sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
        const sortedCategories = [...categories].sort((a, b) => {
            if (a[column] < b[column]) return newOrder === "asc" ? -1 : 1;
            if (a[column] > b[column]) return newOrder === "asc" ? 1 : -1;
            return 0;
        });
        setCategories(sortedCategories);
        setSortColumn(column);
        setSortOrder(newOrder);
    };

    const handleAdd = async (e: FormEvent) => {
        try {
            if (newParentCategory == null) {
                const response = await api.post(`/Menu/add?categoryName=${newCategoryName}&url=${newUrl}`);
                getNewCategories(currentPage);
                setAllCategory(preAllCategory => [...preAllCategory, response.data]);
                alert('Add successful.');
                setNewCategoryName('');
                setNewParentCategory('');
                setNewUrl('');
                setIsAddOpen(false);
            } else {
                const response = await api.post(`/Menu/add?categoryName=${newCategoryName}&url=${newUrl}&parentCategory=${newParentCategory}`);
                getNewCategories(currentPage);
                setAllCategory(preAllCategory => [...preAllCategory, response.data]);
                alert('Add successful.');
                setNewCategoryName('');
                setNewParentCategory('');
                setNewUrl('');
                setIsAddOpen(false);
            };
        } catch (error) {
            console.log(error);
            alert('Add failed.');
        }
    };

    const handleDelete = async (category: Category) => {
        if (category) {
            try {
                await api.delete(`/Menu/delete?id=${category.id}`);
                alert('delete successful');
                getNewCategories(currentPage);
                window.location.reload();
            } catch (error) {
                alert('delete failed');
            }
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (editedCategory) {
            setEditedCategory({
                ...editedCategory,
                [e.target.name]: e.target.value
            });
        }
    };

    const saveChanges = async (e: FormEvent) => {
        if (editedCategory) {
            try {
                await api.patch(`/Menu/edit?id=${editedCategory.id}&name=${editedCategory.categoryName}&url=${editedCategory.url}&parentCategory=${editedCategory.parentCategory}`);
                editedCategory.id = selectedCategory!.id;
                setCategories(categories.map(category => category.id === editedCategory.id ? editedCategory : category));
                alert('Update successful!');
                setIsModalOpen(false);
                setIsEditing(true);
            } catch (error) {
                alert('Update failed.');
            }
        }
    };

    const cancelEdit = () => {
        setEditedCategory(selectedCategory);
        setIsEditing(true);
        setIsModalOpen(false);
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
                    <div className='bg-white rounded shadow-lg p-6 w-2/4 flex flex-col items-center'>
                        <Button onClick={() => { setIsAddOpen(false); setNewCategoryName(''); setNewParentCategory(''); setNewUrl('') }} className='bg-gray-300 hover:text-red-500 shadow-lg flex ml-auto px-0.5 py-0.5'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </Button>
                        <h1 className='text-center uppercase font-bold pb-3'>Add category</h1>
                        <form className='flex flex-col w-11/12' onSubmit={handleAdd}>
                            <div className='flex flex-row justify-between'>

                                <div className='flex flex-col'>
                                    <label>Category name:</label>
                                    <Input
                                        type='text'
                                        name='category name'
                                        value={newCategoryName}
                                        placeholder='Enter category name'
                                        required
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className={`py-0.5 pl-0.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black`}
                                    />
                                </div>

                                <div className='flex flex-col'>
                                    <label>Parent category:</label>
                                    <Combobox value={newParentCategory} onChange={setNewParentCategory} onClose={() => setSearchCategoryQuery('')}>
                                        <div className='relative'>
                                            <div className='flex flex-row'>
                                                <ComboboxInput
                                                    onChange={(event) => setSearchCategoryQuery(event.target.value)}
                                                    className="border p-2 rounded w-full text-ellipsis overflow-hidden whitespace-nowrap"
                                                    placeholder="Select a category"
                                                    displayValue={(parentCategory: string | null) => (parentCategory ? `${parentCategory}` : '')}
                                                />
                                                <ComboboxButton className="absolute inset-y-0 -right-2.5 px-2.5">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                                    </svg>
                                                </ComboboxButton>
                                            </div>
                                            <ComboboxOptions className='absolute z-10 w-full bg-white border border-gray-300 rounded shadow-md max-h-60 overflow-auto'>
                                                {allCategory.map((category) => (
                                                    <ComboboxOption key={category.id} value={category.categoryName} className='hover:bg-gray-300 cursor-pointer'>
                                                        {`${category.categoryName}`}
                                                    </ComboboxOption>
                                                ))}
                                            </ComboboxOptions>
                                        </div>
                                    </Combobox>
                                </div>

                            </div>

                            <div className='flex flex-col'>
                                <label>Url:</label>
                                <Input
                                    type='text'
                                    name='url'
                                    value={newUrl}
                                    placeholder='Choose a url for category'
                                    onChange={(e) => setNewUrl(e.target.value)}
                                    className={`py-0.5 pl-0.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black`}
                                />
                            </div>
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
                            <th onClick={() => handleSort("categoryName")} className="w-3/12 py-4 text-lg font-bold text-gray-500 uppercase tracking-wider text-left"><div className='inline-flex justify-center items-center'>Name <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ml-2 size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                            </svg>
                            </div></th>
                            <th onClick={() => handleSort("parentCategory")} className="w-3/12 py-4 text-lg font-bold text-gray-500 uppercase tracking-wider text-left"><div className='inline-flex justify-center items-center'>Parent category <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ml-2 size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                            </svg>
                            </div></th>
                            <th onClick={() => handleSort("url")} className="w-3/12 py-4 text-lg font-bold text-gray-500 uppercase tracking-wider text-left"><div className='inline-flex justify-center items-center'>Url <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ml-2 size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                            </svg>
                            </div></th>
                            <th className="w-2/12 py-4 text-lg font-bold text-gray-500 uppercase tracking-wider">Operation</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCategories.length > 0 ? (
                            filteredCategories.map((category) => (
                                <tr key={category.id} className="divide-x divide-gray-200 hover:bg-gray-100">
                                    <td className="w-1/12 py-2 text-sm text-gray-500 text-center">{category.id}</td>
                                    <td className="w-3/12 py-2 whitespace-nowrap text-sm text-gray-500">{category.categoryName}</td>
                                    <td className="w-3/12 py-2 whitespace-nowrap text-sm text-gray-500">{category.parentCategory}</td>
                                    <td className="w-3/12 py-2 whitespace-nowrap text-sm text-gray-500">{category.url}</td>
                                    <td className="w-2/12 py-2 text-sm text-gray-500 text-center">

                                        <Button className='hover:scale-110 hover:text-blue-500' onClick={() => { setIsModalOpen(true); setEditedCategory(category); setSelectedCategory(category) }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 mr-3 ">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                                            </svg>
                                        </Button>

                                        <Button className='hover:scale-110 hover:text-red-500' onClick={() => handleDelete(category)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 mr-3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                        </Button>

                                    </td>
                                </tr>
                            ))) : (
                            <tr>
                                <td className="border px-4 py-2" colSpan={5}>No categories found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && editedCategory && selectedCategory && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
                    <div className='bg-white rounded shadow-lg p-6 w-2/4 flex flex-col items-center'>
                        <Button onClick={() => { setIsModalOpen(false); setEditedCategory(null); setSelectedCategory(null); setIsEditing(true) }} className='bg-gray-300 hover:text-red-500 shadow-lg flex ml-auto px-0.5 py-0.5'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </Button>
                        <h1 className='text-center uppercase font-bold pb-3'>Category</h1>
                        <form className='flex flex-col w-11/12' onSubmit={saveChanges}>
                            <div className='flex flex-row justify-between'>

                                <div className='flex flex-col'>
                                    <label>Id:</label>
                                    <Input
                                        type='text'
                                        name='id'
                                        value={editedCategory.id}
                                        disabled={true}
                                        onChange={handleInputChange}
                                        className={`py-0.5 pl-0.5 border border-gray-300 bg-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black`}
                                    />
                                </div>

                                <div className='flex flex-col'>
                                    <label>Category name:</label>
                                    <Input
                                        type='text'
                                        name='categoryName'
                                        value={editedCategory.categoryName}
                                        placeholder='Enter category name'
                                        required
                                        disabled={isEditing}
                                        onChange={handleInputChange}
                                        className={`py-0.5 pl-0.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black ${isEditing ? 'bg-gray-300' : ''}`}
                                    />
                                </div>

                                <div className='flex flex-col'>
                                    <label>Parent category:</label>
                                    <Combobox value={editedCategory.parentCategory}
                                        onChange={(newParentCategory: string) => {
                                            setEditedCategory((prev) => prev ? { ...prev, parentCategory: newParentCategory } : null);
                                        }} onClose={() => setSearchCategoryQuery('')}>
                                        <div className='relative'>
                                            <div className='flex flex-row'>
                                                <ComboboxInput
                                                    onChange={(event) => setSearchCategoryQuery(event.target.value)}
                                                    className={`border p-2 rounded w-full text-ellipsis overflow-hidden whitespace-nowrap ${isEditing ? 'bg-gray-300' : ''}`}
                                                    placeholder="Select a category"
                                                    disabled={isEditing}
                                                    displayValue={(parentCategory: string | null) => (parentCategory ? `${parentCategory}` : '')}
                                                />
                                                <ComboboxButton className="absolute inset-y-0 -right-2.5 px-2.5" disabled={isEditing}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                                    </svg>
                                                </ComboboxButton>
                                            </div>
                                            <ComboboxOptions className='absolute z-10 w-full bg-white border border-gray-300 rounded shadow-md max-h-60 overflow-auto'>
                                                {allCategory.map((category) => (
                                                    <ComboboxOption key={category.id} value={category.categoryName} className='hover:bg-gray-300 cursor-pointer'>
                                                        {`${category.categoryName}`}
                                                    </ComboboxOption>
                                                ))}
                                            </ComboboxOptions>
                                        </div>
                                    </Combobox>
                                </div>

                            </div>

                            <div className='flex flex-col'>
                                <label>Url:</label>
                                <Input
                                    type='text'
                                    name='url'
                                    value={editedCategory.url}
                                    disabled={isEditing}
                                    placeholder='Choose a url for category'
                                    onChange={handleInputChange}
                                    className={`py-0.5 pl-0.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black ${isEditing ? 'bg-gray-300' : ''}`}
                                />
                            </div>

                            <div className='flex flex-row justify-between'>
                                <Button onClick={() => setIsEditing(!isEditing)} type='button' className='bg-green-500 hover:bg-green-700 rounded text-white mt-8 px-1.5 py-1 items-center'>Edit</Button>
                                <div className='flex flex-row'>
                                    <Button type='submit' className='bg-blue-500 hover:bg-blue-700 rounded text-white mt-8 px-1.5 py-1 items-center mr-2'>Save change</Button>
                                    <Button onClick={cancelEdit} type='button' className='bg-red-500 hover:bg-red-700 rounded text-white mt-8 px-1.5 py-1 items-center'>Cancel</Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

            )}

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
        </div>
    )
}
