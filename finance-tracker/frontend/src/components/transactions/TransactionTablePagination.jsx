import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function TransactionTablePagination({
  currentPage,
  pages,
  total,
  onPageChange
}) {
  return (
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
  );
}
