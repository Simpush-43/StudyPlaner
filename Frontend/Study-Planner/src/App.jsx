import { useState } from 'react'

import './App.css'
import StudyPlanner from './Componets/StudyPlanner'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <StudyPlanner/>
    </>
  )
}

export default App
