import Marquee from "@/components/Marquee";
import { useSession } from "next-auth/react";
import Link from "next/link";
import WelcomeHeader from "@/components/WelcomeHeader";
import QuickActionsGrid from "@/components/QuickActionsGrid";
import QuickStats from "@/components/QuickStats";
import Footer from "@/components/Footer";
import HolidayCalendar from "@/components/HolidayCalendar";
import MobileQuickLinks from "@/components/MobileQuickLinks";
import CompanyOverview from "@/components/CompanyOverview";

export default function ManagerDashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p className="text-center p-10">Loading...</p>;
  }

  if (!session || !session.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-4">Session Error</h2>
          <p className="mb-4">You are not logged in. Please <Link href="/login" className="text-blue-500 underline">login</Link> again.</p>
        </div>
      </div>
    );
  }

  const userName = session.user.name || "Manager";

  return (
    <>
    <Marquee />
    {/* Main content area with padding */}
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="space-y-8">
        <WelcomeHeader userName={userName} />
        <CompanyOverview />
        <QuickStats />
        <MobileQuickLinks />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="lg:col-span-2 hidden lg:block">
            <QuickActionsGrid />
          </div>
          <div className="xl:col-span-1"><HolidayCalendar /></div>
        </div>
      </div>
      <Footer />
    </div>
    </>
  );
}
