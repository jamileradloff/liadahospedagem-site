import { lazy, Suspense, useEffect } from 'react'
import { landOn, useLocation } from './router'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { HomeScreen } from './screens/HomeScreen'
import { MessagesScreen } from './screens/MessagesScreen'
import { ThanksScreen } from './screens/ThanksScreen'

// Loaded on its own, so the paid guide's text stays out of the free page's bundle.
const PedeAssimScreen = lazy(() =>
  import('./pedeAssim/PedeAssimScreen').then((module) => ({ default: module.PedeAssimScreen })),
)

export function App() {
  const location = useLocation()

  useEffect(() => {
    // The lazy Pede assim screen lands by itself once it has rendered.
    if (location.screen !== 'pede-assim') landOn(location)
  }, [location])

  if (location.screen === 'pede-assim') {
    return (
      <Suspense fallback={null}>
        <PedeAssimScreen location={location} />
      </Suspense>
    )
  }

  return (
    <div className="page">
      <Header />
      {location.screen === 'messages' ? (
        <MessagesScreen anchor={location.anchor} navigationKey={location.key} />
      ) : location.screen === 'thanks' ? (
        <ThanksScreen />
      ) : (
        <HomeScreen />
      )}
      <Footer />
    </div>
  )
}
