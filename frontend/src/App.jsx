import React from 'react'
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';

import ProtectedRoute from "./components/auth/ProtectedRoute"

import LoginPage from "./pages/Auth/LoginPage"
import RegisterPage from "./pages/Auth/RegisterPage"

import DashboardPage from "./pages/Dashboard/DashboardPage"

import DocumentDetailPage from "./pages/Documents/DocumentDetailPage"
import DocumentListPage from "./pages/Documents/DocumentListPage"

import FlashcardListPage from "./pages/Flashcards/FlashcardListPage"
import FlashcardPage from "./pages/Flashcards/FlashcardPage"

import ProfilePage from "./pages/Profile/ProfilePage"

import QuizzNotFound from "./pages/Quizzes/QuizzNotFound"
import QuizzTakePlace from "./pages/Quizzes/QuizzTakePlace"
import QuizzResultPage from "./pages/Quizzes/QuizzResultPage"
import { useAuth } from './context/AuthContext';

const App = () => {
  const {isAuthenticated, loading} = useAuth()

  if(loading){
    return(
      <>
      <div className='flex items-center justify-center h-screen'>
        <p>Loading...</p>
      </div>
      </>
    )
  }
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={isAuthenticated ? <Navigate to="/dashboard" replace/> : <Navigate to="/login" replace/> }/>
            
          <Route path='/login' element={<LoginPage/>} />
          <Route path='/register' element={<RegisterPage/>} />

          {/* Protected Route */}
            <Route element={<ProtectedRoute/>}>
            <Route path='/dashboard' element={<DashboardPage/>} />
            
            <Route path='/documents' element={<DocumentListPage/>} />
            <Route path='/document/:id' element={<DocumentDetailPage/>} />
            
            <Route path='/flashcards' element={<FlashcardListPage/>} />
            <Route path='/flashcards/:documentId' element={<FlashcardPage/>} />
            
            <Route path='/profile' element={<ProfilePage/>} />
            
            <Route path='/quizzes/:quizId/results' element={<QuizzResultPage/>} />
            <Route path='/quizzes/:quizId/notfound' element={<QuizzNotFound/>} />
            <Route path='/quizzes/:quizId' element={<QuizzTakePlace/>} />
          </Route>

            {/* <Route path='*' element={<NotFound/>} /> */}

        </Routes>
        </Router>  
    </>
  )
}

export default App