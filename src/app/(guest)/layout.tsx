// @TASK P0-T0.1 - 게스트 레이아웃 (미니멀)

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}
