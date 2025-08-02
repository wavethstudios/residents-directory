"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
const MenuIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);
const CloseIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
const HomeIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);
const FamilyIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);
const AddIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);
const PDFIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);
const PowerIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);
interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType;
  description?: string;
}
const navigation: NavItem[] = [
  {
    name: "Home",
    href: "/",
    icon: HomeIcon,
    description: "Dashboard",
  },
  {
    name: "Families",
    href: "/families",
    icon: FamilyIcon,
    description: "View all families",
  },
  {
    name: "Add Family",
    href: "/family/add",
    icon: AddIcon,
    description: "Register new family",
  },
  {
    name: "PDF Directory",
    href: "/pdf-directory",
    icon: PDFIcon,
    description: "Generate directory",
  },
];
export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  const closeMenu = () => {
    setIsOpen(false);
  };
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await fetch("/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error);
      setIsLoggingOut(false);
    }
  };
  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };
  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <FamilyIcon />
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">
                  Family Directory
                </span>
                <span className="text-xl font-bold text-gray-900 sm:hidden">
                  Directory
                </span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-1">
              <div className="flex items-baseline space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveLink(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                        ${
                          isActive
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }
                      `}
                      title={item.description}
                    >
                      <Icon />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="ml-4 pl-4 border-l border-gray-200">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${
                      isLoggingOut
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200"
                    }
                  `}
                  title={isLoggingOut ? "Logging out..." : "Logout"}
                >
                  <PowerIcon />
                  <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                </button>
              </div>
            </div>
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200 shadow-lg">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveLink(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeMenu}
                    className={`
                      flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium transition-colors
                      ${
                        isActive
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }
                    `}
                  >
                    <Icon />
                    <div className="flex flex-col">
                      <span>{item.name}</span>
                      {item.description && (
                        <span className="text-xs text-gray-500 mt-0.5">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
              <div className="pt-2 mt-2 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  disabled={isLoggingOut}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium transition-colors
                    ${
                      isLoggingOut
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "text-red-600 hover:text-red-700 hover:bg-red-50"
                    }
                  `}
                >
                  <PowerIcon />
                  <div className="flex flex-col items-start">
                    <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                    <span className="text-xs text-gray-500 mt-0.5">
                      {isLoggingOut ? "Please wait..." : "Sign out of account"}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-30 md:hidden"
          onClick={closeMenu}
        />
      )}
    </>
  );
}
