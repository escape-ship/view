'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#0F1011] border-t border-[rgba(255,255,255,0.1)]">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-[1200px] px-8 py-12">
        <div className="grid gap-8 lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-[#141516] flex items-center justify-center">
                <span className="text-[#F7F8F8] font-medium text-sm">E</span>
              </div>
              <span className="text-xl font-medium text-[#F7F8F8]">
                EscapeShip
              </span>
            </Link>
            
            <p className="text-[#8A8F98] text-sm leading-relaxed mb-6 max-w-sm">
              프리미엄 라이프스타일과 혁신적인 기술을 만나보세요. 
              EscapeShip에서 당신만의 특별한 쇼핑 경험을 시작하세요.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-[#8A8F98] text-sm">
                <Mail className="h-4 w-4" />
                <span>support@escapeship.com</span>
              </div>
              <div className="flex items-center space-x-3 text-[#8A8F98] text-sm">
                <Phone className="h-4 w-4" />
                <span>1588-0000</span>
              </div>
              <div className="flex items-center space-x-3 text-[#8A8F98] text-sm">
                <MapPin className="h-4 w-4" />
                <span>서울특별시 강남구 테헤란로 123</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-[#F7F8F8] font-medium text-sm mb-4">상품</h3>
            <nav className="space-y-3">
              <Link 
                href="/products"
                className="block text-[#8A8F98] text-sm hover:text-[#F7F8F8] transition-colors duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
              >
                전체 상품
              </Link>
              <Link 
                href="/products?category=electronics"
                className="block text-[#8A8F98] text-sm hover:text-[#F7F8F8] transition-colors duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
              >
                전자제품
              </Link>
              <Link 
                href="/products?category=fashion"
                className="block text-[#8A8F98] text-sm hover:text-[#F7F8F8] transition-colors duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
              >
                패션
              </Link>
              <Link 
                href="/products?category=home"
                className="block text-[#8A8F98] text-sm hover:text-[#F7F8F8] transition-colors duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
              >
                홈 & 리빙
              </Link>
              <Link 
                href="/custom-order"
                className="block text-[#8A8F98] text-sm hover:text-[#F7F8F8] transition-colors duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
              >
                커스텀 주문
              </Link>
            </nav>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-[#F7F8F8] font-medium text-sm mb-4">고객서비스</h3>
            <nav className="space-y-3">
              <Link 
                href="/my-page"
                className="block text-[#8A8F98] text-sm hover:text-[#F7F8F8] transition-colors duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
              >
                마이페이지
              </Link>
              <Link 
                href="/orders"
                className="block text-[#8A8F98] text-sm hover:text-[#F7F8F8] transition-colors duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
              >
                주문 내역
              </Link>
              <Link 
                href="/support"
                className="block text-[#8A8F98] text-sm hover:text-[#F7F8F8] transition-colors duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
              >
                고객 지원
              </Link>
              <Link 
                href="/faq"
                className="block text-[#8A8F98] text-sm hover:text-[#F7F8F8] transition-colors duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
              >
                자주 묻는 질문
              </Link>
              <Link 
                href="/returns"
                className="block text-[#8A8F98] text-sm hover:text-[#F7F8F8] transition-colors duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
              >
                반품 & 교환
              </Link>
            </nav>
          </div>

          {/* Company Info */}
          <div>
            <h3 className="text-[#F7F8F8] font-medium text-sm mb-4">회사소개</h3>
            <nav className="space-y-3">
              <Link 
                href="/about"
                className="block text-[#8A8F98] text-sm hover:text-[#F7F8F8] transition-colors duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
              >
                회사소개
              </Link>
              <Link 
                href="/careers"
                className="block text-[#8A8F98] text-sm hover:text-[#F7F8F8] transition-colors duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
              >
                채용정보
              </Link>
              <Link 
                href="/news"
                className="block text-[#8A8F98] text-sm hover:text-[#F7F8F8] transition-colors duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
              >
                뉴스 & 미디어
              </Link>
              <Link 
                href="/privacy"
                className="block text-[#8A8F98] text-sm hover:text-[#F7F8F8] transition-colors duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
              >
                개인정보처리방침
              </Link>
              <Link 
                href="/terms"
                className="block text-[#8A8F98] text-sm hover:text-[#F7F8F8] transition-colors duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
              >
                이용약관
              </Link>
            </nav>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-[rgba(255,255,255,0.1)]">
          <div className="max-w-md">
            <h3 className="text-[#F7F8F8] font-medium text-sm mb-2">뉴스레터 구독</h3>
            <p className="text-[#8A8F98] text-sm mb-4">
              새로운 상품과 특별한 혜택을 가장 먼저 만나보세요.
            </p>
            <div className="flex space-x-2">
              <Input
                type="email"
                placeholder="이메일 주소를 입력하세요"
                className="flex-1 bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#F7F8F8] placeholder:text-[#626269] focus:border-[rgba(255,255,255,0.2)] focus:bg-[rgba(255,255,255,0.08)]"
              />
              <Button 
                variant="primary" 
                size="default"
                className="px-6"
              >
                구독
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-[rgba(255,255,255,0.1)] bg-[#08090A]">
        <div className="mx-auto max-w-[1200px] px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-[#626269] text-sm">
              © {currentYear} EscapeShip. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <Link 
                href="https://facebook.com" 
                className="text-[#626269] hover:text-[#F7F8F8] transition-colors duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link 
                href="https://twitter.com" 
                className="text-[#626269] hover:text-[#F7F8F8] transition-colors duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link 
                href="https://instagram.com" 
                className="text-[#626269] hover:text-[#F7F8F8] transition-colors duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link 
                href="https://youtube.com" 
                className="text-[#626269] hover:text-[#F7F8F8] transition-colors duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                aria-label="Youtube"
              >
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}