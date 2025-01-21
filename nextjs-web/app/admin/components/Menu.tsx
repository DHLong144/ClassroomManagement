'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import api from './api';

interface MenuItem {
    id: number;
    categoryName: string;
    parentCategory: string | null;
    url: string;
    children?: MenuItem[];
}

interface Category {
    id: number;
    categoryName: string;
    parentCategory: string;
    url: string;
}

export default function Menu() {
    const CreateMenuTree = (menus: Category[]) => {
        const menuMap = new Map<number, MenuItem>();
        menus.forEach(menu => {
            menuMap.set(menu.id, { ...menu, children: [] });
        });

        const menuTree: MenuItem[] = [];
        menus.forEach(menu => {
            if (menu.parentCategory) {
                const parent = menus.find(m => m.categoryName === menu.parentCategory);
                if (parent) {
                    menuMap.get(parent!.id)?.children?.push(menuMap.get(menu.id)!);
                }
            } else {
                menuTree.push(menuMap.get(menu.id)!);
            }
        });
        return menuTree;
    };

    const [menus, setMenus] = useState<Category[]>([]);
    const [openCategories, setOpenCategories] = useState<Set<number>>(new Set());

    useEffect(() => {
        const menuData = async () => {
            try {
                const response = await api.get(`/Menu/get-all`);
                setMenus(response.data);
            } catch (error) {
                console.log(error);
                alert('failed to fetch menu data');
            }
        };

        menuData();
    }, []);

    const menuTree = CreateMenuTree(menus);
    console.log(menuTree);

    const handleToggle = (categoryId: number) => {
        setOpenCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    const [ActiveComponent, setActiveComponent] = useState<React.ComponentType | null>(null);

    const renderComponent = (url: string) => {
        if (!url) return;
        const Component = dynamic(() => import(`@/app/admin/${url}`));
        setActiveComponent(() => Component);
    };

    const renderMenuItems = (menus: MenuItem[], prefix: string = '') => {
        return menus.map((menu, index) => {
            const newPrefix = prefix ? `${prefix}${index + 1}.` : `${index + 1}.`;

            return (
                <div key={menu.id}>
                    <button
                        onClick={() => {
                            renderComponent(menu.url);
                            handleToggle(menu.id);
                        }}
                        className="sidebar-menu-button"
                    >
                        {newPrefix} {menu.categoryName}
                    </button>

                    <AnimatePresence>
                        {openCategories.has(menu.id) && menu.children && menu.children.length !== 0 && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                            >
                                <div className="sidebar-item">
                                    {renderMenuItems(menu.children, newPrefix)}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            );
        });
    };

    return (
        <div className="flex">
            {/* menu */}
            <div className="fixed w-1/5 pt-1 h-full shadow-xl bg-white flex flex-col items-start">
                <div className='ml-2'>
                    {renderMenuItems(menuTree)}
                </div>
            </div>

            {/* content */}
            <div className="flex-1 ml-72 pr-1">
                {ActiveComponent ? <ActiveComponent /> : <p className='mx-auto text-center font-bold'>Welcome to classroom management.</p>}
            </div>
        </div>
    );
}

