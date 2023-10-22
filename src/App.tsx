import { Home } from './views/Home'
import { Eg } from './views/Eg'
import AppProvider, { AppContext } from './context/AppContext'
import { useContext } from 'react'

export default function App() {
  return (
    <AppProvider>
      <div className='app-root'>
        <Router />
      </div>
    </AppProvider>
  )
}

function Router() {
  const { activeView, router } = useContext(AppContext)
  return (
    <>
      {(activeView === undefined) ? (
        <div style={{ marginTop: 200 }}>
          <button onClick={() => router.navigate("/home")}>Home</button>
          <button onClick={() => router.navigate("/eg")}>Eg</button>
        </div>
      ) : (activeView === "home") ? (
        <Home />
      ) : (activeView === "eg") ? (
        <Eg />
      ) : <></>}
    </>
  )
}