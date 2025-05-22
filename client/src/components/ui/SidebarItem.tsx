import React from 'react';
import { LucideIcon} from 'lucide-react';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  active = false,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center w-full px-4 py-3 my-1 text-left
        rounded-lg transition-colors duration-200 
        ${active ? 'bg-gray-300 font-medium' : 'bg-gray-100 hover:bg-gray-200'}
      `}
    >
      <Icon className="h-5 w-5 mr-3" />
      <span className="text-base">{label}</span>
    </button>
  );
};

export default SidebarItem;