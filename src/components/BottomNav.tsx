import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const items = [
  { to: '/home', label: '홈', icon: Home },
  { to: '/shop', label: '쇼핑', icon: ShoppingBag },
  { to: '/cart', label: '장바구니', icon: ShoppingCart },
  { to: '/profile', label: '마이', icon: User },
]

export default function BottomNav() {
  const { totalItems } = useCart()

  return (
    <nav className="absolute inset-x-0 bottom-0 z-20 flex items-stretch justify-around border-t border-moss-100 bg-sand-50/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 shadow-nav backdrop-blur">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `relative flex flex-1 flex-col items-center gap-0.5 py-1 text-[11px] font-medium ${
              isActive ? 'text-moss-700' : 'text-moss-300'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.3 : 1.8} />
                {to === '/cart' && totalItems > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-clay-500 text-[9px] text-sand-50">
                    {totalItems}
                  </span>
                )}
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
