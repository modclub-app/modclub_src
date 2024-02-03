import * as React from "react";
import { Route, Routes } from "react-router-dom"; // Import Routes instead of Switch
import Home from "../external/Home";

export default function External() {
  return (
    <Routes>
      <Route path="/" element={<Home />} /> {/* Use element prop with JSX */}
    </Routes>
  );
}