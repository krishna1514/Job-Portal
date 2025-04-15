// src/components/Loader.jsx

import React from "react";

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-fit">
      <div className="border-t-4 border-blue-500 border-solid w-5 h-5 rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;
