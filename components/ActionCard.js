import Link from 'next/link';

const ActionCard = ({ href, icon, title, description }) => {
  return (
    <Link href={href} className="block p-4 bg-white rounded-2xl border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="text-xl sm:text-2xl text-indigo-500">{icon}</div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-800">{title}</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default ActionCard;
