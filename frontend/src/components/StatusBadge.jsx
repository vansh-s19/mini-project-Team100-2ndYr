import React from 'react';

export default function StatusBadge({ status }) {
  const styles = {
    verified: 'badge-verified',
    pending: 'badge-pending',
    rejected: 'badge-rejected',
  };

  const labels = {
    verified: '✓ Verified',
    pending: '⏳ Pending',
    rejected: '✕ Rejected',
  };

  return (
    <span className={styles[status] || styles.pending}>
      {labels[status] || 'Unknown'}
    </span>
  );
}
