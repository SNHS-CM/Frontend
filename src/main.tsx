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
              {/* 코디의 좋아요·저장 표시는 WishlistProvider 가 들고 있으므로
                  PostsProvider 가 그 안쪽에 있어야 한다. */}
              <WishlistProvider>
                <PostsProvider>
                  <CartProvider>
                    <ChatProvider>
                      <App />
                    </ChatProvider>
                  </CartProvider>
                </PostsProvider>
              </WishlistProvider>
            </ListingsProvider>
          </ProfileProvider>
        </AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>,
)
