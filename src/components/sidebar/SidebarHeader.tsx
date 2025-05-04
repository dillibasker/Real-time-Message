import React, { useState } from 'react';
import { Menu, Search, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import ProfileMenu from './ProfileMenu';

interface SidebarHeaderProps {
  toggleSidebar: () => void;
  isMobile: boolean;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ toggleSidebar, isMobile }) => {
  const { user } = useAuth();
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  if (!user) return null;

  return (
    <div className="bg-white border-b border-[var(--color-border)] p-3">
      {isSearching ? (
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsSearching(false);
              setSearchTerm('');
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="Back from search"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search contacts..."
              className="w-full p-2 rounded-lg bg-gray-100 focus:outline-none"
              autoFocus
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isMobile && (
              <button 
                onClick={toggleSidebar} 
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <Menu size={20} />
              </button>
            )}
            
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="relative"
            >
              <Avatar 
                src={user.avatar} 
                alt={user.username} 
                size="medium" 
              />
            </button>
            
            {showProfileMenu && (
              <ProfileMenu 
                onClose={() => setShowProfileMenu(false)} 
              />
            )}
          </div>
          
          <button
            onClick={() => setIsSearching(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="Search"
          >
            <Search size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default SidebarHeader;