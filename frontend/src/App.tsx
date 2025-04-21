import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import EditPage from "./pages/EditPage";

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/edit" element={<EditPage />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
