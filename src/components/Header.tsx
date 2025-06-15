import React from "react";
import { Camera } from "lucide-react";

interface HeaderProps {
  title?: string;
  description?: string;
}

const Header = ({
  title = "Photo to Wall",
  description = "Upload your photos and get them printed and delivered to your doorstep",
}: HeaderProps) => {
  return (
    <header className="w-full bg-slate-800 text-white py-4 px-6 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Camera className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-slate-300">{description}</p>
          </div>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li
              className="hover:text-blue-400 cursor-pointer"
              onClick={() => (window.location.href = "/")}
            >
              Home
            </li>
            <li className="hover:text-blue-400 cursor-pointer">Services</li>
            <li className="hover:text-blue-400 cursor-pointer">Contact</li>
            <li
              className="hover:text-blue-400 cursor-pointer"
              onClick={() => (window.location.href = "/admin-login")}
            >
              Admin
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
