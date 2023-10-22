import { useState } from 'react'
import { Home } from './views/Home'
import { Eg } from './views/Eg'

function App() {
  const [view, setView] = useState<"home" | "eg">("eg")

  if (view === "home") {
    return (
      <Home />
    )
  } else {
    return (
      <Eg />
    )
  }

}

export default App