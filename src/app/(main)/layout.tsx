export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen">
      {/* TODO: Add Header component */}
      <main className="mx-auto max-w-[1200px] px-6">{children}</main>
      {/* TODO: Add Footer component */}
    </div>
  );
}
