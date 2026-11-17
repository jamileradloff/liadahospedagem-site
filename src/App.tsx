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
// Loaded on its own too, so the sales page doesn't grow the free page's bundle.
const SalesScreen = lazy(() => import('./sales/SalesScreen').then((module) => ({ default: module.SalesScreen })))

export function App() {
  const location = useLocation()
  const lazyScreen = location.screen === 'pede-assim' || location.screen === 'sales'

  useEffect(() => {
    // The lazy screens land by themselves once they have rendered.
    if (!lazyScreen) landOn(location)
  }, [location, lazyScreen])

  if (lazyScreen) {
    return (
      <Suspense fallback={null}>
        {location.screen === 'sales' ? <SalesScreen location={location} /> : <PedeAssimScreen location={location} />}
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
