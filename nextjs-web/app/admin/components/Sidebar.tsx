'use client';

import React from 'react'
import { Menu, MenuButton, MenuItem, MenuItems, Button } from '@headlessui/react'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


type SidebarProps = {
    setSelection: (selection: string) => void;
};

export default function Sidebar({ setSelection }: SidebarProps) {
    const [isEduOpen, setEduOpen] = useState(false);
    const [isAcaOpen, setAcaOpen] = useState(false);

    const handleEduToggle = () => {
        setEduOpen(!isEduOpen);
    };

    const handleAcaToggle = () => {
        setAcaOpen(!isAcaOpen);
    };


    return (
        <div className='fixed w-1/5 pt-1 h-full shadow-xl bg-white flex flex-col items-start'>

            <Menu>
                <MenuButton onClick={handleEduToggle} className='sidebar-menu-button'>1.Administration</MenuButton>

                <AnimatePresence>
                    {isEduOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className='sidebar-item'
                        >
                            <div className='sidebar-item'>
                                <MenuItem>
                                    <Button className='sidebar-button' onClick={() => setSelection('category')}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3 mr-1 ml-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
                                        </svg>

                                        Add category
                                    </Button>
                                </MenuItem>

                                <MenuItem>
                                    <Button className='sidebar-button' onClick={() => setSelection('teacher')}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3 mr-1 ml-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
                                        </svg>

                                        Teacher
                                    </Button>
                                </MenuItem>

                                <MenuItem>
                                    <Button className='sidebar-button' onClick={() => setSelection('student')}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3 mr-1 ml-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
                                    </svg>
                                        Student</Button>
                                </MenuItem>

                                <MenuItem>
                                    <Button className='sidebar-button' onClick={() => setSelection('subject')}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3 mr-1 ml-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
                                    </svg>Subject</Button>
                                </MenuItem>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Menu>

            <Menu>
                <MenuButton onClick={handleAcaToggle} className='sidebar-menu-button'>2.Education</MenuButton>

                <AnimatePresence>
                    {isAcaOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className='sidebar-item'
                        >
                            <div className='sidebar-item'>
                                <MenuItem>
                                    <Button className='sidebar-button' onClick={() => setSelection('classroom')}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3 mr-1 ml-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
                                    </svg>Classroom</Button>
                                </MenuItem>

                                <MenuItem>
                                    <Button className='sidebar-button' onClick={() => setSelection('score')}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3 mr-1 ml-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
                                    </svg>Score</Button>
                                </MenuItem>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Menu>
        </div>
    )
}

