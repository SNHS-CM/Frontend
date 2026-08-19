import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './layouts/AppShell'
import Onboarding from './pages/Onboarding'
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

function App() {
  return (
    <Routes>
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
  )
}

export default App
