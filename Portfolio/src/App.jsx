import { useEffect, useState } from 'react'
import SplashScreen from './components/SplashScreen'
import HomeBackground from './components/HomeBackground'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Skills from './components/Skills'
import Projects from './components/Projects'
import About from './components/About'
import Contact from './components/Contact'
import { setThemeColor, THEME } from './utils/themeColor'
import './App.css'

function App() {
  const [loading, setLoading] = useState(true)

  // Keep the browser UI color in sync with the current background.
  // Black while the splash plays, page background once it's revealed.
  useEffect(() => {
    setThemeColor(loading ? THEME.splash : THEME.bg)
  }, [loading])

  return (
    <>
      {loading && <SplashScreen onFinish={() => setLoading(false)} />}

      <main className={`app${loading ? ' app--hidden' : ' app--reveal'}`}>
        <HomeBackground />
        <div className="home-bg-vignette" />
        <Navbar />

        {/* Main portfolio index page */}
        <Hero />
        <Skills />
        <Projects />
        <About />
        <Contact />
      </main>
    </>
  )
}

export default App
