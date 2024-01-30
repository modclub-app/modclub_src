import React from 'react';

const Header = () => {
  return (
    <header className="bg-gray-200 text-black py-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-lg font-semibold">
          DECIDE ID
        </h1>
        {/* Add additional header content here */}
      </div>
    </header>
  );
};

export default Header;