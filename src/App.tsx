import { useScreen } from './router'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { HomeScreen } from './screens/HomeScreen'
import { MessagesScreen } from './screens/MessagesScreen'

export function App() {
  const screen = useScreen()
  return (
    <div className="page">
      <Header />
      {screen === 'messages' ? <MessagesScreen /> : <HomeScreen />}
      <Footer />
    </div>
  )
}
