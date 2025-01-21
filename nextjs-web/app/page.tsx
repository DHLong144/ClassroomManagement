'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@headlessui/react';
import axios from 'axios';

const LoginPage = () => {
  const [Name, setName] = useState<string>('');
  const [Password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5178/api/Login', {
        Name,
        Password,
      });

      const token = response.data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('username', Name);
      router.push(`/admin`);
    } catch (error: any) {
      console.log(error);
      setError(error.response.data);
    }
  };

  return (
    <form className="login-css" onSubmit={handleLogin}>
      <h1 className="text-2xl font-bold mb-4 text-center">LOGIN</h1>

      <div>
        <label className="input-label">Username:</label>
        <Input
          type="text"
          name="username"
          value={Name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your username"
          className="input-form"
        />
      </div>

      <div>
        <label className="input-label">Password:</label>
        <Input
          type="password"
          name="password"
          value={Password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="input-form"
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <button
        type='submit'
        className="login-button"
      >
        Login
      </button>
    </form>
  );
};

export default LoginPage;
