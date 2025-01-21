'use client';
import { useState } from 'react';
import Menu from './components/Menu';

export default function UserPage() {
    const [selection, setSelection] = useState<string>('');

    return (
        <div className='bg-gray-200'>
            <Menu />
        </div>
    );
}