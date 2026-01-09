export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      <main className="min-h-screen">{children}</main>
    </div>
  );
}

