import { useEffect } from 'react'
import { landOn, useLocation } from './router'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { HomeScreen } from './screens/HomeScreen'
import { MessagesScreen } from './screens/MessagesScreen'

export function App() {
  const location = useLocation()

  useEffect(() => {
    landOn(location)
  }, [location])

  return (
    <div className="page">
      <Header />
      {location.screen === 'messages' ? (
        <MessagesScreen anchor={location.anchor} navigationKey={location.key} />
      ) : (
        <HomeScreen />
      )}
      <Footer />
    </div>
  )
}
