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
 *  Only `guest` redirects: that means the server answered and rejected us. When
 *  the backend is unreachable the app stays in `offline` mode and every screen
 *  keeps working against localStorage, so we never trap the user behind a login
 *  form that cannot succeed.
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { status } = useAuth()
  const { t } = useI18n()
  const { pathname } = useLocation()

  if (status === 'checking') {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-sand-50 text-sm text-moss-500">
        {t('auth.checking')}
      </div>
    )
  }

  if (status === 'guest' && !PUBLIC_PATHS.includes(pathname)) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <AuthGate>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/onboarding" replace />} />
          <Route path="/onboarding" element={<Onboarding />} />
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
          <Route path="/outfit" element={<OutfitBuilder />} />
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
