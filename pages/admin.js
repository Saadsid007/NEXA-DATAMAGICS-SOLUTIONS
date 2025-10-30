import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import Marquee from "@/components/Marquee";
import WelcomeHeader from "@/components/WelcomeHeader";
import CompanyOverview from "@/components/CompanyOverview";
import QuickActionsGrid from "@/components/QuickActionsGrid";
import HolidayCalendar from "@/components/HolidayCalendar";
import Footer from "@/components/Footer";
import MobileQuickLinks from "@/components/MobileQuickLinks";
import AdminStatsGrid from "@/components/AdminStatsGrid"; // New component for admin stats

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    if (status === "loading") return;
    if (!isAdmin) {
      router.push('/dashboard'); // Redirect if not an admin
    }
  }, [status, isAdmin, router]);

  if (status === "loading" || !isAdmin) return <p>Loading...</p>;
  
  return (
    <>    
    <Marquee />
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="space-y-8">
        <WelcomeHeader userName={session.user.name || "Admin"} />
        <AdminStatsGrid /> {/* New component for admin-specific stats */}
        <CompanyOverview />
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
