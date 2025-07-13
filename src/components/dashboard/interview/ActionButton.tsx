import React from 'react';

interface ActionButtonProps {
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
  className?: string;
  iconBg?: string;
  iconColor?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  text,
  onClick,
  className = '',
  iconBg = 'bg-gray-100',
  iconColor = 'text-gray-700',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center border-dashed border-2 border-gray-700 cursor-pointer hover:scale-105 hover:border-indigo-500 hover:shadow-xl transition-all duration-200 h-24 w-64 rounded-2xl shrink-0 overflow-hidden shadow-md bg-white group ${className}`}
    >
      <span className={`flex items-center justify-center h-16 w-16 rounded-xl ${iconBg} group-hover:bg-indigo-50 transition-colors mb-2 mt-2`}>
        {icon}
      </span>
      <span className="text-lg font-semibold text-gray-900 text-center select-none">{text}</span>
    </button>
  );
};

export default ActionButton; 
