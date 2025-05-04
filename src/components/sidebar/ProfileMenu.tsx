import React, { useRef, useEffect } from 'react';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProfileMenuProps {
  onClose: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ onClose }) => {
  const { logout } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div 
      ref={menuRef}
      className="absolute top-16 left-3 z-50 bg-white rounded-lg shadow-lg w-56 py-2 border border-[var(--color-border)]"
    >
      <div className="px-4 py-2 border-b border-[var(--color-border)]">
        <h3 className="font-medium">Profile</h3>
      </div>
      
      <ul>
        <li>
          <button 
            className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-100"
          >
            <User size={18} />
            <span>My Profile</span>
          </button>
        </li>
        
        <li>
          <button 
            className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-100"
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </li>
        
        <li>
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-100 text-red-500"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default ProfileMenu;