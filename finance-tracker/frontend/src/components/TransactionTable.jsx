import React from 'react';
import { 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Edit2, 
  Trash2, 
  Search, 
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

const CATEGORIES = [
  'Food', 'Travel', 'Shopping', 'Bills', 'Health', 'Education', 'Entertainment', 'Salary', 'Freelance', 'Investment', 'Business', 'Others'
];

export default function TransactionTable({
  transactions = [],
  pagination = { total: 0, pages: 1, currentPage: 1, limit: 10 },
  params = { search: '', type: '', category: '', startDate: '', endDate: '', sortBy: 'transaction_date', sortOrder: 'DESC' },
  onParamsChange = () => {},
  onPageChange = () => {},
  onEdit = () => {},
  onDelete = () => {},
  onExport = () => {},
  showFilters = true
}) {
  const { total, pages, currentPage } = pagination;

  const handleParamChange = (key, value) => {
    onParamsChange({ ...params, [key]: value });
  };

  const handleSort = (field) => {
    const isSameField = params.sortBy === field;
    const newOrder = isSameField && params.sortOrder === 'DESC' ? 'ASC' : 'DESC';
    onParamsChange({
      ...params,
      sortBy: field,
      sortOrder: newOrder
    });
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Search, Filter, Export Bar */}
      {showFilters && (
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
      )}

      {/* Main Table */}
      <div className="glass-panel table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('transaction_date')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Date <ArrowUpDown size={14} />
                </div>
              </th>
              <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Title <ArrowUpDown size={14} />
                </div>
              </th>
              <th onClick={() => handleSort('category')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Category <ArrowUpDown size={14} />
                </div>
              </th>
              <th onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Type <ArrowUpDown size={14} />
                </div>
              </th>
              <th onClick={() => handleSort('amount')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                  Amount <ArrowUpDown size={14} />
                </div>
              </th>
              <th>Notes</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No transactions found. Click Add Transaction to start recording!
                </td>
              </tr>
            ) : (
              transactions.map((t) => {
                const dateVal = new Date(t.transaction_date);
                const formattedDate = dateVal.toLocaleDateString(undefined, {
                  year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC'
                });

                return (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                        <span>{formattedDate}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {t.title}
                      {t.is_recurring && (
                        <span 
                          style={{
                            fontSize: '0.65rem',
                            padding: '2px 6px',
                            backgroundColor: 'var(--primary-light)',
                            color: 'var(--primary)',
                            borderRadius: '10px',
                            marginLeft: '8px',
                            fontWeight: 700,
                            textTransform: 'uppercase'
                          }}
                        >
                          🔁 {t.recurrence_period}
                        </span>
                      )}
                    </td>
                    <td>
                      <span 
                        style={{
                          fontSize: '0.8rem',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-color)',
                          fontWeight: 500
                        }}
                      >
                        {t.category}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${t.type}`}>
                        {t.type}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: t.type === 'expense' ? 'var(--danger)' : 'var(--success)' }}>
                      {t.type === 'expense' ? '-' : '+'}${parseFloat(t.amount).toFixed(2)}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.notes}>
                      {t.notes || '-'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                        <button 
                          onClick={() => onEdit(t)}
                          style={{
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            color: 'var(--primary)',
                            padding: '4px'
                          }}
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            console.log('Delete button clicked for ID:', t.id);
                            onDelete(t.id);
                          }}
                          style={{
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            color: 'var(--danger)',
                            padding: '4px'
                          }}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pages > 1 && (
        <div 
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '8px'
          }}
        >
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Showing page <strong>{currentPage}</strong> of <strong>{pages}</strong> ({total} entries total)
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-outline"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              style={{ padding: '8px 12px' }}
            >
              <ChevronLeft size={16} />
              <span>Prev</span>
            </button>
            <button
              className="btn btn-outline"
              disabled={currentPage === pages}
              onClick={() => onPageChange(currentPage + 1)}
              style={{ padding: '8px 12px' }}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
