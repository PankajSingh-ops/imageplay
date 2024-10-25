import { useRouter } from 'next/navigation'
import React from 'react'

export default function Header() {
    const navigate=useRouter()
  return (
    <header className="p-4 bg-gray-900 text-white shadow-lg sticky top-0 z-50 flex justify-between items-center">
    <h1 className="text-xl font-bold cursor-pointer" onClick={()=>navigate.push("/")}>Image Play</h1>
  </header>
 )
}
