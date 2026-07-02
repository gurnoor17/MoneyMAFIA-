import React from 'react';
import { 
  ArrowUpDown, 
  Edit2, 
  Trash2, 
  Calendar
} from 'lucide-react';
import TransactionTableFilters from './TransactionTableFilters';
import TransactionTablePagination from './TransactionTablePagination';

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

  const handleSort = (field) => {
    const isSameField = params.sortBy === field;
    const newOrder = isSameField && params.sortOrder === 'DESC' ? 'ASC' : 'DESC';
    onParamsChange({
      ...params,
      sortBy: field,
      sortOrder: newOrder
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Search, Filter, Export Bar */}
      {showFilters && (
        <TransactionTableFilters
          params={params}
          onParamsChange={onParamsChange}
          onExport={onExport}
        />
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
      {/* Pagination Controls */}
      {pages > 1 && (
        <TransactionTablePagination
          currentPage={currentPage}
          pages={pages}
          total={total}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
