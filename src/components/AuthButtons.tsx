'use client'

import { useSession, signIn, signOut } from "next-auth/react"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"

export default function AuthButtons() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Menü dışına tıklandığında menüyü kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Dropdown menünün pozisyonunu hesapla
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })

  useEffect(() => {
    if (isMenuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      })
    }
  }, [isMenuOpen])

  if (session) {
    return (
      <>
        <button
          ref={buttonRef}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {session.user?.image && (
            <Image
              src={session.user.image}
              alt={session.user.name || ""}
              width={28}
              height={28}
              className="rounded-full"
            />
          )}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
            {session.user?.name}
          </span>
        </button>

        {/* Dropdown Menu Portal */}
        {isMenuOpen && typeof window !== 'undefined' && createPortal(
          <div 
            ref={menuRef}
            style={{
              position: 'fixed',
              top: `${menuPosition.top}px`,
              right: `${menuPosition.right}px`,
            }}
            className="w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-[9999]"
          >
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 sm:hidden">
                {session.user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {session.user?.email}
              </p>
            </div>
            <button
              onClick={() => signOut()}
              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Çıkış Yap
            </button>
          </div>,
          document.body
        )}
      </>
    )
  }

  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-md shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
    >
      <Image
        src="/google.svg"
        alt="Google"
        width={18}
        height={18}
        className="dark:invert"
      />
      <span className="text-sm font-medium">
        Google
      </span>
    </button>
  )
} 