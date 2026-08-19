import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './layouts/AppShell'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Shop from './pages/Shop'
import OutfitBuilder from './pages/OutfitBuilder'
import ProductDetail from './pages/ProductDetail'
import Marketplace from './pages/Marketplace'
import ListingDetail from './pages/ListingDetail'
import ListingForm from './pages/ListingForm'
import ChatList from './pages/ChatList'
import ChatRoom from './pages/ChatRoom'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import Profile from './pages/Profile'

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/onboarding" replace />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/home" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/outfit" element={<OutfitBuilder />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/market" element={<Marketplace />} />
        <Route path="/market/new" element={<ListingForm />} />
        <Route path="/market/:id/edit" element={<ListingForm />} />
        <Route path="/market/:id" element={<ListingDetail />} />
        <Route path="/chat" element={<ChatList />} />
        <Route path="/chat/:id" element={<ChatRoom />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  )
}

export default App
