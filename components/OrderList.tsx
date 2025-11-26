import React, { useState, useMemo } from 'react';
import { 
  Download, 
  Upload, 
  Plus, 
  Search, 
  RotateCcw,
  Calendar,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { MOCK_ORDERS } from '../constants';
import { TabType, OrderStatus, Order } from '../types';
import { formatStoreTime, isNext24Hours } from '../utils';

// --- Tab Definitions ---
const TAB_DEFS: { id: TabType; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'new_24h', label: '近24小时新增预订' },
  { id: 'pickup_next_24h', label: '未来24小时待取车' },
  { id: 'return_today', label: '今日待还订单' },
  { id: 'overdue_pickup', label: '逾期待取订单' },
  { id: 'overdue_return', label: '逾期待还订单' },
  { id: 'canceled', label: '已取消' },
];

type SortKey = 'createTime' | 'pickupTime' | 'returnTime' | 'updateTime';

const OrderList: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('all');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({
    key: 'updateTime',
    direction: 'desc'
  });
  
  // --- Filter Logic Helpers ---
  const checkFilter = (order: Order, type: TabType): boolean => {
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    switch (type) {
      case 'all':
        return true;
      case 'new_24h':
        // Created within the last 24 hours
        return (now - new Date(order.createTime).getTime()) < oneDay;
      case 'pickup_next_24h':
        // Not canceled, pickup time is within the next 24 hours
        return (
          order.status !== OrderStatus.CANCELED && 
          isNext24Hours(order.pickupTime)
        );
      case 'return_today':
        // Status is PICKED_UP and return time is within the next 24 hours
        return (
          order.status === OrderStatus.PICKED_UP && 
          isNext24Hours(order.returnTime)
        );
      case 'overdue_pickup':
        // Status is Pending or Confirmed, and pickup time has passed
        return (
          (order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED) &&
          new Date(order.pickupTime).getTime() < now
        );
      case 'overdue_return':
        // Status is Picked Up, and return time has passed
        return (
          order.status === OrderStatus.PICKED_UP &&
          new Date(order.returnTime).getTime() < now
        );
      case 'canceled':
        return order.status === OrderStatus.CANCELED;
      default:
        return true;
    }
  };

  // --- Calculate Counts ---
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    TAB_DEFS.forEach(tab => {
      counts[tab.id] = MOCK_ORDERS.filter(o => checkFilter(o, tab.id)).length;
    });
    return counts;
  }, []);

  // --- Sorting Handler ---
  const handleSort = (key: SortKey) => {
    setSortConfig(current => {
      if (current.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'desc' }; // Default to desc for new key
    });
  };

  // --- Filtering & Sorting ---
  const filteredAndSortedOrders = useMemo(() => {
    // 1. Filtering
    const result = MOCK_ORDERS.filter(o => checkFilter(o, currentTab));

    // 2. Sorting
    result.sort((a, b) => {
      const tA = new Date(a[sortConfig.key] || 0).getTime();
      const tB = new Date(b[sortConfig.key] || 0).getTime();

      if (tA < tB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (tA > tB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [currentTab, sortConfig]);

  // --- Helper Component for Sortable Header ---
  const SortHeader: React.FC<{ label: string; sortKey: SortKey; className?: string }> = ({ label, sortKey, className = "" }) => {
    const isActive = sortConfig.key === sortKey;
    return (
      <th 
        className={`p-4 font-medium cursor-pointer hover:bg-gray-100 transition-colors select-none group ${className}`}
        onClick={() => handleSort(sortKey)}
      >
        <div className="flex items-center gap-1">
          {label}
          <div className={`flex flex-col text-gray-400 ${isActive ? 'text-blue-600' : 'group-hover:text-gray-500'}`}>
            {isActive ? (
               sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
            ) : (
               <ArrowUpDown size={14} />
            )}
          </div>
        </div>
      </th>
    );
  };

  return (
    <div className="bg-white m-4 rounded shadow-sm border border-gray-200 min-h-[calc(100vh-140px)]">
      {/* --- Filter Bar --- */}
      <FilterBar />

      {/* --- Action Bar --- */}
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
        <button className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded border border-blue-200 hover:bg-blue-100 transition-colors">
          <Plus size={16} />
          <span>新增walkin订单</span>
        </button>
        
        <div className="flex gap-2">
          <button className="flex items-center gap-1 text-sm bg-white text-gray-600 px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50">
             <Upload size={14} /> 订单导入
          </button>
          <button className="flex items-center gap-1 text-sm bg-white text-gray-600 px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50">
             <Download size={14} /> 订单导出
          </button>
        </div>
      </div>

      {/* --- Tabs --- */}
      <div className="flex items-center border-b border-gray-200 px-4 overflow-x-auto">
        {TAB_DEFS.map((tab) => {
          const isActive = currentTab === tab.id;
          const count = tabCounts[tab.id] || 0;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`
                relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors
                ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}
              `}
            >
              {tab.label}
              <span className={`ml-1 text-xs ${isActive ? 'text-blue-500' : 'text-gray-400'}`}>
                ({count})
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* --- Table --- */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs border-b border-gray-200">
              <th className="p-4 w-10"><input type="checkbox" /></th>
              
              {/* Sortable Headers */}
              <SortHeader label="订单号" sortKey="createTime" />
              <th className="p-4 font-medium">确认号</th>
              <th className="p-4 font-medium">车辆信息</th>
              <SortHeader label="取车信息" sortKey="pickupTime" />
              <SortHeader label="还车信息" sortKey="returnTime" />
              <SortHeader label="更新时间" sortKey="updateTime" />
              
              <th className="p-4 font-medium">租车用户</th>
              <th className="p-4 font-medium">订单金额</th>
              <th className="p-4 font-medium">订单来源</th>
              <th className="p-4 font-medium">订单备注</th>
              <th className="p-4 font-medium">订单状态</th>
              <th className="p-4 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {filteredAndSortedOrders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
            
            {filteredAndSortedOrders.length === 0 && (
               <tr>
                 <td colSpan={13} className="p-10 text-center text-gray-400">
                   暂无订单数据
                 </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* --- Footer --- */}
      <div className="p-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
         <div>共 {filteredAndSortedOrders.length} 条</div>
         <div className="flex gap-1">
             <button className="px-2 py-1 border rounded disabled:opacity-50">Prev</button>
             <button className="px-2 py-1 border rounded bg-blue-50 text-blue-600 border-blue-200">1</button>
             <button className="px-2 py-1 border rounded disabled:opacity-50">Next</button>
         </div>
      </div>
    </div>
  );
};

const OrderRow: React.FC<{ order: Order }> = ({ order }) => {
  const statusColorClass = order.status === OrderStatus.CANCELED 
    ? 'text-orange-500 font-medium' 
    : 'text-gray-700';

  const statusLabel = {
    [OrderStatus.PENDING]: '待确认',
    [OrderStatus.CONFIRMED]: '已确认',
    [OrderStatus.PICKED_UP]: '已取车',
    [OrderStatus.RETURNED]: '已还车',
    [OrderStatus.COMPLETED]: '已完成',
    [OrderStatus.CANCELED]: '已取消',
  }[order.status];

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
      <td className="p-4 align-top"><input type="checkbox" /></td>
      
      {/* Order No & Time */}
      <td className="p-4 align-top">
        <div className="text-gray-500 text-xs">平台订单号:</div>
        <div className="text-blue-600 mb-2 font-medium">{order.platformOrderNo}</div>
        
        {order.externalOrderNo && (
          <>
            <div className="text-gray-500 text-xs">外部订单号:</div>
            <div className="text-blue-600 mb-2">{order.externalOrderNo}</div>
          </>
        )}

        <div className="text-gray-400 text-[10px] mt-1">
            下单时间: {formatStoreTime(order.createTime, order.pickupStore.timeZone)}
        </div>
      </td>

      {/* Confirmation */}
      <td className="p-4 align-top">
         <div className="mb-1 text-gray-500 text-xs">确认号:</div>
         <div>{order.id.padStart(8, '0')}</div>
         {order.status === OrderStatus.PENDING && (
            <button className="text-[10px] text-blue-500 border border-blue-200 px-1 rounded mt-1 hover:bg-blue-50">立即确认</button>
         )}
      </td>

      {/* Vehicle Info */}
      <td className="p-4 align-top">
        <div className="text-xs text-gray-500">预定车辆:</div>
        <div className="mb-2 font-medium">{order.carModel}</div>
        {order.actualCar && (
            <>
                <div className="text-xs text-gray-500">实际车辆:</div>
                <div>{order.actualCar}</div>
            </>
        )}
        <div className="text-xs text-gray-400 mt-1 border border-gray-200 inline-block px-1 rounded">{order.carGroup}</div>
      </td>

      {/* Pickup Info */}
      <td className="p-4 align-top">
        <div className="text-xs text-gray-500">取车门店:</div>
        <div className="mb-2">{order.pickupStore.name}</div>
        <div className="text-xs text-gray-500">取车时间:</div>
        <div>{formatStoreTime(order.pickupTime, order.pickupStore.timeZone)}</div>
      </td>

      {/* Return Info */}
      <td className="p-4 align-top">
        <div className="text-xs text-gray-500">还车门店:</div>
        <div className="mb-2">{order.returnStore.name}</div>
        <div className="text-xs text-gray-500">还车时间:</div>
        <div>{formatStoreTime(order.returnTime, order.returnStore.timeZone)}</div>
      </td>

      {/* NEW: Update Time */}
      <td className="p-4 align-top">
        <div className="text-xs text-gray-500">更新时间:</div>
        <div>{formatStoreTime(order.updateTime, order.pickupStore.timeZone)}</div>
      </td>

      {/* Customer */}
      <td className="p-4 align-top">
        <div className="text-xs text-gray-500">姓名:</div>
        <div className="font-medium">{order.customerName}</div>
      </td>

      {/* Amount */}
      <td className="p-4 align-top">
        <div className="text-xs text-gray-500">订单金额:</div>
        <div className="font-medium text-gray-900">{order.amount} {order.currency}</div>
        <div className={`text-xs mt-1 ${order.paymentStatus === 'Refunded' ? 'text-red-400' : 'text-green-600'}`}>
            {order.paymentStatus}
        </div>
      </td>

      {/* Source */}
      <td className="p-4 align-top text-gray-600">
        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{order.source}</span>
      </td>

      {/* Remarks */}
      <td className="p-4 align-top text-gray-500 text-xs">
        {order.remarks || '--'}
      </td>

      {/* Status */}
      <td className="p-4 align-top border-l border-r border-gray-100 bg-gray-50/30">
        <div className={`text-sm ${statusColorClass}`}>
            {statusLabel}
        </div>
        {order.status === OrderStatus.CANCELED && order.cancelTime && (
            <div className="text-[10px] text-gray-400 mt-1">
                取消: {formatStoreTime(order.cancelTime, order.pickupStore.timeZone)}
            </div>
        )}
      </td>

      {/* Actions */}
      <td className="p-4 align-top text-right">
        <div className="flex flex-col gap-1.5 items-end">
          <button className="text-blue-500 hover:text-blue-700 text-xs font-medium">查看</button>
          {order.status === OrderStatus.CONFIRMED && (
            <>
                <button className="text-green-600 hover:text-green-700 text-xs">分配车辆</button>
                <button className="text-gray-600 hover:text-gray-800 text-xs">订单备注</button>
                <button className="text-blue-600 hover:text-blue-800 text-xs">登记取车</button>
            </>
          )}
          {order.status === OrderStatus.PICKED_UP && (
             <button className="text-blue-600 hover:text-blue-800 text-xs">登记还车</button>
          )}
        </div>
      </td>
    </tr>
  );
};

// --- Filter Bar (Top-Down Layout for i18n support) ---
const FilterBar: React.FC = () => (
  <div className="p-4 grid grid-cols-5 gap-4 border-b border-gray-100">
      
      {/* Item 1: Order No */}
      <div className="flex flex-col gap-1">
         <span className="text-xs text-gray-500 font-medium">订单号/确认号:</span>
         <input type="text" placeholder="请输入" className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-blue-500 focus:border-blue-500" />
      </div>

      {/* Item 2: Create Time */}
      <div className="flex flex-col gap-1 col-span-2">
         <span className="text-xs text-gray-500 font-medium">下单日期:</span>
         <div className="flex items-center gap-2 w-full">
            <div className="relative w-full">
                <input type="text" placeholder="开始日期" className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full pl-8" />
                <Calendar size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            </div>
            <span className="text-gray-400 text-xs">至</span>
            <div className="relative w-full">
                <input type="text" placeholder="结束日期" className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full pl-8" />
                <Calendar size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            </div>
         </div>
      </div>

       {/* Item 3: Pickup Date */}
       <div className="flex flex-col gap-1 col-span-2">
         <span className="text-xs text-gray-500 font-medium">取车日期:</span>
         <div className="flex items-center gap-2 w-full">
            <div className="relative w-full">
                <input type="text" placeholder="开始日期" className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full pl-8" />
                <Calendar size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            </div>
            <span className="text-gray-400 text-xs">至</span>
            <div className="relative w-full">
                <input type="text" placeholder="结束日期" className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full pl-8" />
                <Calendar size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            </div>
         </div>
      </div>

      {/* Item 4: Pickup Store */}
       <div className="flex flex-col gap-1">
         <span className="text-xs text-gray-500 font-medium">取车门店:</span>
         <div className="relative w-full">
            <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full appearance-none bg-white text-gray-600 focus:outline-blue-500">
                <option>请选择</option>
                <option>IX樱花租车-那霸空港店</option>
                <option>IX樱花租车-福冈店</option>
            </select>
            <ChevronDown size={14} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
         </div>
      </div>

      {/* Item 5: Return Store */}
      <div className="flex flex-col gap-1">
         <span className="text-xs text-gray-500 font-medium">还车门店:</span>
         <div className="relative w-full">
            <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full appearance-none bg-white text-gray-600 focus:outline-blue-500">
                <option>请选择</option>
            </select>
            <ChevronDown size={14} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
         </div>
      </div>

      {/* Item 6: Order Source */}
      <div className="flex flex-col gap-1">
         <span className="text-xs text-gray-500 font-medium">订单来源:</span>
         <div className="relative w-full">
            <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full appearance-none bg-white text-gray-600 focus:outline-blue-500">
                <option>请选择</option>
            </select>
            <ChevronDown size={14} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
         </div>
      </div>

      {/* Item 7: Order Status */}
      <div className="flex flex-col gap-1">
         <span className="text-xs text-gray-500 font-medium">订单状态:</span>
         <div className="relative w-full">
            <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full appearance-none bg-white text-gray-600 focus:outline-blue-500">
                <option>请选择</option>
                <option>待确认</option>
                <option>已确认</option>
                <option>已取车</option>
                <option>已还车</option>
                <option>已完成</option>
                <option>已取消</option>
            </select>
            <ChevronDown size={14} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
         </div>
      </div>

      {/* Actions */}
      <div className="flex items-end gap-2 justify-end col-start-5">
          <button className="text-blue-500 text-sm hover:underline mb-2">收起筛选</button>
          <button className="flex items-center gap-1 border border-gray-300 rounded px-3 py-1.5 text-sm hover:bg-gray-50 bg-white text-gray-700 shadow-sm">
             <Search size={14} /> 搜索
          </button>
          <button className="flex items-center gap-1 border border-gray-300 rounded px-3 py-1.5 text-sm hover:bg-gray-50 bg-white text-gray-700 shadow-sm">
             <RotateCcw size={14} /> 重置
          </button>
      </div>
  </div>
);

export default OrderList;