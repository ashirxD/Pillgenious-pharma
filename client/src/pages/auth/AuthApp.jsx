import React, { useState } from 'react'
import LoginPage from './Login'
import SignupPage from './SignUp'

export default function AuthApp({ initialPage = 'login' }) {
  const [currentPage, setCurrentPage] = useState(initialPage || 'login')

  return (
    <div>
      {currentPage === 'login' ? (
        <LoginPage onNavigate={setCurrentPage} />
      ) : (
        <SignupPage onNavigate={setCurrentPage} />
      )}
    </div>
  )
}
