import React from 'react';
import { Menu, Maximize, Search, Type, User } from 'lucide-react';

const TopNav: React.FC = () => {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button className="p-1 hover:bg-gray-100 rounded">
          <Menu size={20} className="text-gray-600" />
        </button>
        <div className="flex items-center text-sm text-gray-500">
          <span className="font-medium text-gray-800">订单管理</span>
          <span className="mx-2">/</span>
          <span>订单列表</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
          <Maximize size={18} />
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
          <Search size={18} />
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
          <Type size={18} />
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
           <span>简体中文</span>
        </div>
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 border border-blue-200">
          <User size={18} />
        </div>
      </div>
    </header>
  );
};

export default TopNav;