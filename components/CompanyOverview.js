import { useState, useEffect } from 'react';
import Image from 'next/image';
import StatCard from './StatCard';

const CompanyOverview = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const res = await fetch('/api/admin/company-info');
        if (res.ok) {
          const data = await res.json();
          setCompanyInfo(data);
          setTotalUsers(data.totalApprovedUsers || 0);
        }
      } catch (error) {
        console.error("Failed to fetch company info:", error);
      }
    };

    fetchCompanyInfo();
  }, []);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        {/* CEO Photo */}
        <div className="lg:col-span-1 flex justify-center">
          <div className="relative h-48 w-48 rounded-full overflow-hidden shadow-2xl border-4 border-indigo-200">
            <Image
              src={companyInfo?.ceoImageUrl || "/ceo-placeholder.png"}
              alt={companyInfo?.ceoName || "CEO"}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 33vw, 192px"
            />
          </div>
        </div>

        {/* CEO Description */}
        <div className="lg:col-span-2">
          {companyInfo && (
            <>
              <h2 className="text-2xl font-bold text-gray-800">
                🚀 {companyInfo.ceoName}: <span className="text-indigo-600">{companyInfo.ceoTitle}</span>
              </h2>
          <h3 className="text-lg font-semibold text-gray-600 mb-4">NEXA Datamagics Solutions</h3>
              {/* Responsive Description */}
              <div className="relative">
                <p className={`text-gray-700 text-justify transition-all duration-300 ${!isExpanded ? 'max-h-24 md:max-h-none overflow-hidden' : 'max-h-full'}`}>
                  {companyInfo.ceoDescriptionP1}
                  <span className={`${!isExpanded ? 'hidden md:inline' : 'inline'}`}>
                    <br/><br/>
                    {companyInfo.ceoDescriptionP2}
                  </span>
                </p>
                <button onClick={() => setIsExpanded(!isExpanded)} className="md:hidden text-indigo-600 font-semibold mt-2 hover:underline">
                  {isExpanded ? 'Read Less' : 'Read More...'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Company Stats */}
      <div className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard icon="🧑‍💼" label="Employees" value={totalUsers} />
        <StatCard icon="💼" label="Projects" value={120} suffix="+" />
        <StatCard icon="💰" label="Valuation" value={19.8} suffix="M" />
      </div>
    </div>
  );
};

export default CompanyOverview;
