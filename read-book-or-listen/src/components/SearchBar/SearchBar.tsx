'use client';

import { useState } from 'react';

export default function SearchBar() {
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search books..."
        className="w-full px-6 py-3 bg-gray-900 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 font-arial"
      />
    </form>
  );
} 