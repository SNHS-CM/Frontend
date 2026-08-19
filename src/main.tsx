import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { I18nProvider } from './i18n'
import { AuthProvider } from './context/AuthContext.tsx'
import { ProfileProvider } from './context/ProfileContext.tsx'
import { ListingsProvider } from './context/ListingsContext.tsx'
import { PostsProvider } from './context/PostsContext.tsx'
import { CartProvider } from './context/CartContext.tsx'
import { WishlistProvider } from './context/WishlistContext.tsx'
import { ChatProvider } from './context/ChatContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider>
          <ProfileProvider>
            <ListingsProvider>
              <PostsProvider>
                <CartProvider>
                  <WishlistProvider>
                    <ChatProvider>
                      <App />
                    </ChatProvider>
                  </WishlistProvider>
                </CartProvider>
              </PostsProvider>
            </ListingsProvider>
          </ProfileProvider>
        </AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>,
)
