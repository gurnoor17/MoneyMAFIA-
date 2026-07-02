import React from 'react';
import { Search, RefreshCw, Download } from 'lucide-react';

const CATEGORIES = [
  'Food', 'Travel', 'Shopping', 'Bills', 'Health', 'Education', 'Entertainment', 'Salary', 'Freelance', 'Investment', 'Business', 'Others'
];

export default function TransactionTableFilters({
  params,
  onParamsChange,
  onExport
}) {
  const handleParamChange = (key, value) => {
    onParamsChange({ ...params, [key]: value });
  };

  const clearFilters = () => {
    onParamsChange({
      search: '',
      type: '',
      category: '',
      startDate: '',
      endDate: '',
      sortBy: 'transaction_date',
      sortOrder: 'DESC'
    });
  };

  return (
    <div 
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', flexGrow: 1 }}>
        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '200px', flexGrow: 1, maxWidth: '300px' }}>
          <Search 
            size={16} 
            style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--text-muted)' 
            }} 
          />
          <input
            type="text"
            placeholder="Search description..."
            className="input-control"
            value={params.search || ''}
            onChange={(e) => handleParamChange('search', e.target.value)}
            style={{ paddingLeft: '36px', height: '42px' }}
          />
        </div>

        {/* Type Selector */}
        <div style={{ minWidth: '130px' }}>
          <select
            className="input-control"
            value={params.type || ''}
            onChange={(e) => handleParamChange('type', e.target.value)}
            style={{ height: '42px' }}
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        {/* Category Selector */}
        <div style={{ minWidth: '140px' }}>
          <select
            className="input-control"
            value={params.category || ''}
            onChange={(e) => handleParamChange('category', e.target.value)}
            style={{ height: '42px' }}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Start Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>From</span>
          <input
            type="date"
            className="input-control"
            value={params.startDate || ''}
            onChange={(e) => handleParamChange('startDate', e.target.value)}
            style={{ height: '42px', padding: '8px 12px' }}
          />
        </div>

        {/* End Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>To</span>
          <input
            type="date"
            className="input-control"
            value={params.endDate || ''}
            onChange={(e) => handleParamChange('endDate', e.target.value)}
            style={{ height: '42px', padding: '8px 12px' }}
          />
        </div>

        <button 
          className="btn btn-outline" 
          onClick={clearFilters}
          style={{ padding: '8px 14px', height: '42px' }}
          title="Reset Filters"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <button 
        className="btn btn-success" 
        onClick={onExport}
        style={{ height: '42px', padding: '8px 16px' }}
      >
        <Download size={16} />
        <span>Export CSV</span>
      </button>
    </div>
  );
}
