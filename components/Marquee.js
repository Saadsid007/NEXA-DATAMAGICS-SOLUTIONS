const Marquee = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-2.5 shadow-inner">
      <marquee behavior="scroll" direction="left" className="text-sm font-medium tracking-wide">
        Welcome to the Nexa Datamagics Portal! We are constantly working on new features to make your experience better. 
        <span className="mx-4">&bull;</span>
        Please ensure your profile information is up-to-date. 
        <span className="mx-4">&bull;</span>
        More updates are coming soon!
      </marquee>
    </div>
  );
};

export default Marquee;