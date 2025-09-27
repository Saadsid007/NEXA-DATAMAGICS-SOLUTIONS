const Marquee = () => {
  return (
    <div className="bg-gray-900 text-white py-2">
      <marquee behavior="scroll" direction="left" className="text-sm">
        This is a sample announcement. All employees are requested to update their profile information by the end of this week. | New leave policy will be effective from next month.
      </marquee>
    </div>
  );
};

export default Marquee;