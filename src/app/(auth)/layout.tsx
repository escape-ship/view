import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#F7F8F8] min-h-screen flex flex-col items-center justify-center px-6 py-8">
      {/* Minimal Logo */}
      <div className="mb-8">
        <Link 
          href="/" 
          className="flex items-center space-x-2 transition-all duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:opacity-80"
        >
          <div className="h-10 w-10 rounded-lg bg-[#141516] flex items-center justify-center">
            <span className="text-[#F7F8F8] font-medium text-lg">E</span>
          </div>
          <span className="text-2xl font-medium text-[#141516]">
            EscapeShip
          </span>
        </Link>
      </div>

      {/* Auth Content */}
      <div className="w-full max-w-md">
        <div className="bg-[rgba(40,40,40,0.02)] backdrop-blur-sm rounded-2xl border border-[rgba(255,255,255,0.1)] p-8 shadow-sm">
          {children}
        </div>
      </div>

      {/* Footer Link */}
      <div className="mt-8 text-center">
        <Link 
          href="/"
          className="text-[#8A8F98] text-sm hover:text-[#141516] transition-colors duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
        >
          ← 홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
