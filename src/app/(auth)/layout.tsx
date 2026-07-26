import { HomeNavbar } from "@/components/ui/HomeNavbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] flex flex-col relative overflow-hidden">
      <HomeNavbar />
      <div className="flex-1 flex items-center justify-center p-4 mt-24 relative z-10 w-full">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mambaqr.png" alt="" className="w-[600px] opacity-[0.15] object-contain" />
        </div>
        <div className="relative z-10 w-full flex justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
