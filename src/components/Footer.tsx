'use client'

import { useEffect, useState } from 'react'

export function Footer() {
  const [year, setYear] = useState<number | null>(null)
  useEffect(() => setYear(new Date().getFullYear()), [])
  return <footer className="footer">© {year ?? ''} Miraç Deprem</footer>
}
