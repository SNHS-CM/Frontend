import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppShell from './layouts/AppShell'
import { useAuth } from './context/AuthContext'
import { useI18n } from './i18n'
import Onboarding from './pages/Onboarding'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Marketplace from './pages/Marketplace'
import ListingDetail from './pages/ListingDetail'
import ListingForm from './pages/ListingForm'
import Discover from './pages/Discover'
import PostDetail from './pages/PostDetail'
import OutfitBuilder from './pages/OutfitBuilder'
import ChatList from './pages/ChatList'
import ChatRoom from './pages/ChatRoom'
import Cart from './pages/Cart'
import Saved from './pages/Saved'
import Profile from './pages/Profile'

/** Screens reachable without a session. */
const PUBLIC_PATHS = ['/login', '/signup', '/onboarding']

/** Sends signed-out users to the login screen.
 *
 *  `signedIn` covers both a real session and the offline fallback, so an
 *  unreachable backend no longer means an open app — but it never traps the
 *  user either, because the login screen works locally when the server is down.
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { status, signedIn } = useAuth()
  const { t } = useI18n()
  const { pathname } = useLocation()

  if (status === 'checking') {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-sand-50 text-sm text-moss-500">
        {t('auth.checking')}
      </div>
    )
  }

  if (!signedIn && !PUBLIC_PATHS.includes(pathname)) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

/** First screen of the app.
 *
 *  A live session goes straight to the feed; everyone else starts at the
 *  onboarding intro, which explains the app and then hands off to signup/login.
 */
function Landing() {
  const { signedIn } = useAuth()
  return <Navigate to={signedIn ? '/home' : '/onboarding'} replace />
}

function App() {
  return (
    <AuthGate>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/shop" element={<Navigate to="/home" replace />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/market" element={<Marketplace />} />
          <Route path="/market/new" element={<ListingForm />} />
          <Route path="/market/:id/edit" element={<ListingForm />} />
          <Route path="/market/:id" element={<ListingDetail />} />
          <Route path="/outfit" element={<OutfitBuilder />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/discover/:id" element={<PostDetail />} />
          <Route path="/chat" element={<ChatList />} />
          <Route path="/chat/:id" element={<ChatRoom />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/wishlist" element={<Navigate to="/saved" replace />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </AuthGate>
  )
}

export default App
