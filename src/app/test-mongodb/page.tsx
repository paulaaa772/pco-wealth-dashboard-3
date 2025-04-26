'use client';

import { useState, useEffect } from 'react';

export default function TestMongoDB() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    userId: 'user123',
    name: 'Test Portfolio',
    type: 'PERSONAL',
    cashBalance: 10000,
    stats: {
      totalValue: 10000,
      cashBalance: 10000
    }
  });

  useEffect(() => {
    fetchPortfolios();
  }, []);

  async function fetchPortfolios() {
    try {
      setLoading(true);
      const response = await fetch('/api/portfolios');
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      console.log('MongoDB data:', data);
      setPortfolios(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch:', err);
      setError('Failed to fetch data');
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setMessage('');
      const response = await fetch('/api/portfolios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add portfolio');
      }
      
      const result = await response.json();
      setMessage('Portfolio added successfully!');
      fetchPortfolios(); // Refresh the list
    } catch (err) {
      console.error('Error adding portfolio:', err);
      setMessage(`Error: ${err.message}`);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: Number(value)
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === 'cashBalance' ? Number(value) : value
      });
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">MongoDB Connection Test</h1>
      
      <div className="mb-8 p-4 border border-blue-200 rounded bg-blue-50">
        <h2 className="text-xl font-semibold mb-4">Add New Portfolio</h2>
        {message && (
          <div className={`p-2 mb-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">User ID</label>
              <input
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Portfolio Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="PERSONAL">Personal</option>
                <option value="RETIREMENT">Retirement</option>
                <option value="EDUCATION">Education</option>
                <option value="INVESTMENT">Investment</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cash Balance</label>
              <input
                type="number"
                name="cashBalance"
                value={formData.cashBalance}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Value (Stats)</label>
              <input
                type="number"
                name="stats.totalValue"
                value={formData.stats.totalValue}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cash Balance (Stats)</label>
              <input
                type="number"
                name="stats.cashBalance"
                value={formData.stats.cashBalance}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Portfolio
          </button>
        </form>
      </div>
      
      {loading ? (
        <p>Loading portfolios...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div>
          <p className="text-green-500 mb-4">Connected to MongoDB successfully!</p>
          <h2 className="text-xl font-semibold mb-2">Portfolios ({portfolios.length}):</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(portfolios, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 