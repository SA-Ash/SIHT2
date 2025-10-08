import React, { useState } from "react";
import {
  User,
  ChevronDown,
  Bell,
  Menu,
  X,
  Phone,
  Mail,
  School,
} from "lucide-react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import Notifications from "./Notifications";

const Navbar = ({ userType = "partner" }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const navigate = useNavigate();

  const menuItems = {
    partner: [
      { id: "dashboard", label: "Dashboard", path: "/partner", end: true },
      {
        id: "orders",
        label: "Orders",
        path: "/partner/orders",
        notificationCount: 5,
      },
      { id: "reports", label: "Reports", path: "/partner/reports" },
      { id: "settings", label: "Settings", path: "/partner/settings" },
    ],
    student: [
      { id: "dashboard", label: "Upload & Print", path: "/student", end: true },
      {
        id: "orders",
        label: "My Orders",
        path: "/student/orders",
        notificationCount: 2,
      },
      { id: "settings", label: "Profile", path: "/student/settings" },
    ],
  };

  const userData = {
    partner: {
      name: user?.name || "Name Here",
      email: user?.email || "rajesh@quickprint.com",
      userId: "QP-PARTNER-1234",
      role: "Printing Manager",
      contactIcon: Mail,
    },
    student: {
      name: user?.name || "Name Here",
      phone: user?.phone || "+91 9390244436",
      college: user?.college || "CBIT College",
      role: "Student",
      contactIcon: Phone,
    },
  };

  const currentUserData = userData[userType];
  const currentMenuItems = menuItems[userType];
  const ContactIcon = currentUserData.contactIcon;

  const handleSignOut = () => {
    navigate("/login");
    setIsProfileOpen(false);
  };

  return (
    <nav className="h-16 md:h-20 shadow-md flex items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 bg-white sticky top-0 z-50">
      <div className="flex items-center">
        <div className="md:hidden mr-2 sm:mr-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 sm:p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? (
              <X size={20} className="sm:w-6 sm:h-6" />
            ) : (
              <Menu size={20} className="sm:w-6 sm:h-6" />
            )}
          </button>
        </div>

        <div className="flex items-end gap-1">
          <h1 className="text-black font-bold text-xl sm:text-2xl">
            Quick<span className="text-blue-600">Print</span>
          </h1>
          <span className="text-neutral-500 font-semibold text-sm sm:text-base hidden md:block capitalize">
            {userType}
          </span>
        </div>
      </div>

      <ul className="hidden md:flex items-center gap-2 lg:gap-4">
        {currentMenuItems.map((item) => (
          <li key={item.id} className="relative">
            <NavLink
              to={item.path}
              end={item.end || false}
              className={({ isActive }) =>
                `px-3 py-1.5 lg:px-4 lg:py-2 rounded-full font-medium text-sm lg:text-base transition-all duration-200 relative ${
                  isActive
                    ? "bg-blue-100 text-blue-600"
                    : "text-neutral-700 hover:bg-gray-100"
                }`
              }
            >
              {item.label}
              {item.notificationCount && (
                <span className="absolute -top-1 -right-1 h-4 w-4 lg:h-5 lg:w-5 bg-red-500 text-white text-[10px] lg:text-xs flex items-center justify-center rounded-full">
                  {item.notificationCount}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-1.5 sm:p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full relative"
          >
            <Bell size={18} className="sm:w-5 sm:h-5" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 lg:h-5 lg:w-5 bg-red-500 text-white text-[10px] lg:text-xs flex items-center justify-center rounded-full">
              {userType === "partner" ? 3 : 2}
            </span>
          </button>

          {isNotificationsOpen && <Notifications userType={userType} />}
        </div>

        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-1.5 sm:gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <User size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
            </div>
            <span className="hidden lg:inline text-xs sm:text-sm font-medium text-gray-700 truncate max-w-[120px]">
              {userType === "partner"
                ? currentUserData.email
                : currentUserData.phone}
            </span>
            <ChevronDown
              size={14}
              className="text-gray-500 hidden md:block sm:w-4 sm:h-4"
            />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-md shadow-lg py-2 z-50 border border-gray-200">
              <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUserData.name}
                </p>
                <div className="flex items-center mt-1">
                  <ContactIcon
                    size={10}
                    className="text-gray-400 mr-1 sm:w-3 sm:h-3"
                  />
                  <p className="text-xs text-gray-500 truncate">
                    {userType === "partner"
                      ? currentUserData.email
                      : currentUserData.phone}
                  </p>
                </div>
                {currentUserData.userId && (
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    ID: {currentUserData.userId}
                  </p>
                )}
                {currentUserData.college && (
                  <div className="flex items-center mt-1">
                    <School
                      size={10}
                      className="text-gray-400 mr-1 sm:w-3 sm:h-3"
                    />
                    <p className="text-xs text-gray-500 truncate">
                      {currentUserData.college}
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500 capitalize mt-1">
                  {currentUserData.role}
                </p>
              </div>

              <div className="px-1 sm:px-2 py-1 sm:py-2">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-md border-t border-gray-200 py-3 px-4">
          <ul className="space-y-1 sm:space-y-2">
            {currentMenuItems.map((item) => (
              <li key={item.id} className="relative">
                <NavLink
                  to={item.path}
                  end={item.end || false}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `w-full block text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base ${
                      isActive
                        ? "bg-blue-100 text-blue-600"
                        : "text-neutral-700 hover:bg-gray-100"
                    }`
                  }
                >
                  {item.label}
                  {item.notificationCount && (
                    <span className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 bg-red-500 text-white text-[10px] sm:text-xs flex items-center justify-center rounded-full">
                      {item.notificationCount}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
