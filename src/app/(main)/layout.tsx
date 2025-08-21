import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="mx-auto max-w-[1200px] px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
