'use client'

import Link from 'next/link'
import { ShoppingCart, User, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // Mock data - in real app this would come from state/context
  const cartItems = 3
  const isLoggedIn = false
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[rgba(255,255,255,0.1)] bg-[#F7F8F8]/95 backdrop-blur supports-[backdrop-filter]:bg-[#F7F8F8]/95">
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-8">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center space-x-2 transition-all duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:opacity-80"
        >
          <div className="h-8 w-8 rounded-lg bg-[#141516] flex items-center justify-center">
            <span className="text-[#F7F8F8] font-medium text-sm">E</span>
          </div>
          <span className="text-xl font-medium text-[#141516] hidden sm:inline">
            EscapeShip
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-[#626269] hover:text-[#141516]">
                상품
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/products">전체 상품</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/products?category=electronics">전자제품</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/products?category=fashion">패션</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/products?category=home">홈 & 리빙</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link 
            href="/custom-order" 
            className="text-[#626269] hover:text-[#141516] transition-colors duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
          >
            커스텀 주문
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Cart Icon with Badge */}
          <Link href="/cart" className="relative">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-[#626269] hover:text-[#141516] hover:bg-[rgba(255,255,255,0.1)]"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">장바구니</span>
            </Button>
            {cartItems > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-[#C52828] p-0 text-xs text-white flex items-center justify-center"
              >
                {cartItems}
              </Badge>
            )}
          </Link>

          {/* Auth Buttons */}
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-[#626269] hover:text-[#141516] hover:bg-[rgba(255,255,255,0.1)]"
                >
                  <User className="h-5 w-5" />
                  <span className="sr-only">사용자 메뉴</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/my-page">마이페이지</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders">주문 내역</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>로그아웃</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">로그인</Link>
              </Button>
              <Button variant="primary" asChild>
                <Link href="/register">회원가입</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-[#626269] hover:text-[#141516]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">메뉴</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[rgba(255,255,255,0.1)] bg-[#F7F8F8] px-8 py-4">
          <nav className="flex flex-col space-y-4">
            <Link 
              href="/products"
              className="text-[#626269] hover:text-[#141516] transition-colors duration-[160ms]"
              onClick={() => setIsMenuOpen(false)}
            >
              전체 상품
            </Link>
            <Link 
              href="/custom-order"
              className="text-[#626269] hover:text-[#141516] transition-colors duration-[160ms]"
              onClick={() => setIsMenuOpen(false)}
            >
              커스텀 주문
            </Link>
            
            {!isLoggedIn && (
              <div className="flex flex-col space-y-2 pt-4 border-t border-[rgba(255,255,255,0.1)]">
                <Button variant="ghost" asChild>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    로그인
                  </Link>
                </Button>
                <Button variant="primary" asChild>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                    회원가입
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}