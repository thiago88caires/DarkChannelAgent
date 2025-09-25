import React from 'react'

export default function CreditBadge({ credits }) {
  return (
    <span style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: 6 }}>
      Créditos: <strong>{credits ?? 0}</strong>
    </span>
  )
}

