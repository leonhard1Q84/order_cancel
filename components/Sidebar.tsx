import React from 'react';
import { 
  ClipboardList, 
  Car, 
  Store, 
  Database, 
  ShoppingBag, 
  CreditCard, 
  Settings, 
  Award,
  Download,
  Cpu
} from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-[#0f172a] text-gray-300 flex flex-col h-screen fixed left-0 top-0 z-20 overflow-y-auto">
      <div className="p-4 flex items-center gap-2 border-b border-gray-700">
        <Car className="text-blue-500 w-6 h-6" />
        <h1 className="text-white font-bold text-lg">Fleetedge Merchant</h1>
      </div>
      
      <div className="flex-1 py-4">
        <NavItem icon={<ClipboardList size={18} />} label="订单管理" active hasSubMenu />
        <div className="bg-[#1e293b]">
          <SubNavItem label="订单列表" active />
        </div>
        
        <NavItem icon={<Car size={18} />} label="车辆管理" hasSubMenu />
        <NavItem icon={<Store size={18} />} label="门店与服务规则" hasSubMenu />
        <NavItem icon={<Database size={18} />} label="库存管理" hasSubMenu />
        <NavItem icon={<ShoppingBag size={18} />} label="商品管理" hasSubMenu />
        <NavItem icon={<CreditCard size={18} />} label="价格管理" hasSubMenu />
        <NavItem icon={<Cpu size={18} />} label="设备管理" hasSubMenu />
        <NavItem icon={<Award size={18} />} label="品牌管理" hasSubMenu />
        <NavItem icon={<Download size={18} />} label="任务中心" hasSubMenu />
        <NavItem icon={<Settings size={18} />} label="系统管理" hasSubMenu />
      </div>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; hasSubMenu?: boolean }> = ({ 
  icon, label, active, hasSubMenu 
}) => (
  <div className={`
    flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-800 transition-colors
    ${active ? 'text-white' : ''}
  `}>
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    {hasSubMenu && <span className="text-[10px] opacity-50">▼</span>}
  </div>
);

const SubNavItem: React.FC<{ label: string; active?: boolean }> = ({ label, active }) => (
  <div className={`
    pl-11 py-2 text-sm cursor-pointer hover:text-white transition-colors
    ${active ? 'text-blue-400 bg-blue-500/10 border-r-2 border-blue-500' : 'text-gray-400'}
  `}>
    {label}
  </div>
);

export default Sidebar;