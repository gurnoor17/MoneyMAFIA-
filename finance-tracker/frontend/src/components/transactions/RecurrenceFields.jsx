import React from 'react';

export default function RecurrenceFields({
  isRecurring,
  setIsRecurring,
  recurrencePeriod,
  setRecurrencePeriod
}) {
  return (
    <div 
      style={{
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
        padding: '16px',
        borderRadius: 'var(--border-radius-sm)',
        marginBottom: '24px',
        border: '1px solid var(--border-color)'
      }}
    >
      <label 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          fontWeight: 600, 
          cursor: 'pointer' 
        }}
      >
        <input 
          type="checkbox" 
          checked={isRecurring} 
          onChange={(e) => setIsRecurring(e.target.checked)}
          style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
        />
        <span>Recurring Transaction</span>
      </label>

      {isRecurring && (
        <div className="form-group" style={{ marginTop: '12px', marginBottom: 0 }}>
          <label>Recurrence Period</label>
          <select 
            className="input-control" 
            value={recurrencePeriod} 
            onChange={(e) => setRecurrencePeriod(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
            A new transaction will automatically spawn at the selected interval starting from the transaction date.
          </span>
        </div>
      )}
    </div>
  );
}
