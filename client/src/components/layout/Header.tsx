import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Image as ImageIcon, Folder } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { SearchBar } from '../common/SearchBar';
import { Avatar } from '../common/Avatar';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCreateMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    navigate(`/?search=${encodeURIComponent(query)}`);
  };

  return (
    <header className="w-full bg-white shadow-sm px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative w-12 h-12 group-hover:scale-110 transition-transform duration-300">
            {/* Crveni spoljni prsten (deblji ~30%) */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg"></div>
            {/* Beli unutrašnji krug - smanjen da prsten bude deblji */}
            <div className="absolute inset-[5px] rounded-full bg-white flex items-center justify-center">
              {/* Crveno slovo P spušteno malo dole */}
              <span
                className="font-pacifico text-red-600 select-none"
                style={{
                  fontSize: '26px',
                  marginTop: '2px',
                  fontFamily: "'Pacifico', cursive",
                }}
              >
                P
              </span>
            </div>
          </div>
          <span
            className="font-pacifico text-3xl text-gray-900 hidden sm:block select-none tracking-tight"
            style={{ fontFamily: "'Pacifico', cursive" }}
          >
            Pinspire
          </span>
        </Link>


        <div className="flex-1 max-w-xl mx-4 sm:mx-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Create Button with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowCreateMenu(!showCreateMenu)}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all duration-300 group"
                >
                  <Plus className="w-6 h-6 text-gray-700 group-hover:scale-110 transition-transform" />
                </button>

                {showCreateMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 animate-fadeIn">
                    <Link
                      to="/create"
                      className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowCreateMenu(false)}
                    >
                      <ImageIcon className="w-5 h-5 text-gray-700 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Create Pin</p>
                        <p className="text-sm text-gray-500">Share your ideas with the world</p>
                      </div>
                    </Link>
                    <Link
                      to="/create-collection"
                      className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowCreateMenu(false)}
                    >
                      <Folder className="w-5 h-5 text-gray-700 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Create Collection</p>
                        <p className="text-sm text-gray-500">Organize your favorite pins</p>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* Profile Avatar */}
              <Link
                to={`/profile/${user.id}`}
                className="group"
              >
                <Avatar
                  username={user.username}
                  size="md"
                  className="group-hover:scale-110 transition-transform duration-300"
                />
              </Link>

              <button
                onClick={logout}
                className="px-4 py-2 text-sm bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700 transition-all duration-300 font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="px-5 py-2 text-sm bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
              >
                Log in
              </Link>
              <Link
                to="/auth"
                className="px-5 py-2 text-sm bg-gray-100 text-gray-900 rounded-full font-medium hover:bg-gray-200 transition-all duration-300 hidden sm:block"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
