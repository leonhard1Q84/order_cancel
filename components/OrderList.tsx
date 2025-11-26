
import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  ArrowDown,
  Info
} from 'lucide-react';
import { MOCK_ORDERS } from '../constants';
import { TabType, OrderStatus, Order } from '../types';
import { formatStoreTime, isNext24Hours } from '../utils';

// --- Tab Definitions ---
const TAB_DEFS: { id: TabType; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'pending', label: '待确认' }, // New Pending Tab
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

  // Refs for scrolling synchronization
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);
  const [tableWidth, setTableWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // Sync scroll handlers
  const handleTableScroll = () => {
    if (topScrollRef.current && tableContainerRef.current) {
      topScrollRef.current.scrollLeft = tableContainerRef.current.scrollLeft;
    }
  };

  const handleTopScroll = () => {
    if (tableContainerRef.current && topScrollRef.current) {
      tableContainerRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
  };

  // Measure table content width to size the top scrollbar spacer
  useEffect(() => {
    const measure = () => {
      if (tableContainerRef.current) {
        setTableWidth(tableContainerRef.current.scrollWidth);
        setContainerWidth(tableContainerRef.current.clientWidth);
      }
    };
    
    // Initial measure
    measure();
    
    // Observe resize
    const observer = new ResizeObserver(measure);
    if (tableContainerRef.current) {
      observer.observe(tableContainerRef.current);
    }

    return () => observer.disconnect();
  }, [currentTab]); // Re-measure when data likely changes
  
  // --- Filter Logic Helpers ---
  const checkFilter = (order: Order, type: TabType): boolean => {
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    switch (type) {
      case 'all':
        return true;
      case 'pending':
        return order.status === OrderStatus.PENDING;
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
  const SortHeader: React.FC<{ label: string; sortKey: SortKey; className?: string; style?: React.CSSProperties }> = ({ label, sortKey, className = "", style }) => {
    const isActive = sortConfig.key === sortKey;
    return (
      <th 
        className={`p-4 font-medium cursor-pointer hover:bg-gray-100 transition-colors select-none group whitespace-nowrap bg-gray-50 z-20 ${className} ${isActive ? 'bg-blue-50/50' : ''}`}
        onClick={() => handleSort(sortKey)}
        style={style}
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
    <div className="bg-white m-2 sm:m-4 rounded shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
      {/* --- Filter Bar --- */}
      <div className="flex-none">
        <FilterBar />
      </div>

      {/* --- Action Bar --- */}
      <div className="flex-none px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
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
      <div className="flex-none flex items-center border-b border-gray-200 px-4 overflow-x-auto bg-white z-10">
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

      {/* --- Top Scrollbar (Synced) --- */}
      {tableWidth > containerWidth && (
        <div 
          ref={topScrollRef}
          onScroll={handleTopScroll}
          className="flex-none w-full overflow-x-auto border-b border-gray-100 bg-gray-50/50 h-3.5"
        >
          <div style={{ width: tableWidth }} className="h-full"></div>
        </div>
      )}

      {/* --- Table Container --- */}
      <div 
        ref={tableContainerRef}
        onScroll={handleTableScroll}
        className="flex-1 overflow-auto relative"
      >
        <table className="w-full text-left border-collapse min-w-max">
          <thead className="sticky top-0 z-40 shadow-sm">
            <tr className="bg-gray-50 text-gray-500 text-xs border-b border-gray-200">
              {/* Sticky Column 1: Checkbox */}
              <th className="p-4 w-12 sticky left-0 z-50 bg-gray-50 border-r border-gray-100/50">
                <input type="checkbox" />
              </th>
              
              {/* Sticky Column 2: Order No */}
              <SortHeader 
                label="订单号" 
                sortKey="createTime" 
                className="sticky left-12 z-50 border-r border-gray-200 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]"
              />
              
              <th className="p-4 font-medium whitespace-nowrap bg-gray-50">确认号</th>
              <th className="p-4 font-medium whitespace-nowrap bg-gray-50">车辆信息</th>
              <SortHeader label="取车信息" sortKey="pickupTime" className="bg-gray-50" />
              <SortHeader label="还车信息" sortKey="returnTime" className="bg-gray-50" />
              
              <th className="p-4 font-medium whitespace-nowrap bg-gray-50">租车用户</th>
              <th className="p-4 font-medium whitespace-nowrap bg-gray-50">订单金额</th>
              <th className="p-4 font-medium whitespace-nowrap bg-gray-50">订单备注</th>
              
              <SortHeader label="更新时间" sortKey="updateTime" className="bg-gray-50" />
              
              <th className="p-4 font-medium whitespace-nowrap bg-gray-50">订单状态</th>
              
              {/* Sticky Last Column: Actions */}
              <th className="p-4 font-medium text-right whitespace-nowrap sticky right-0 z-50 bg-gray-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] border-l border-gray-200">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {filteredAndSortedOrders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
            
            {filteredAndSortedOrders.length === 0 && (
               <tr>
                 <td colSpan={12} className="p-10 text-center text-gray-400">
                   暂无订单数据
                 </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* --- Footer --- */}
      <div className="flex-none p-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500 bg-white z-20">
         <div>共 {filteredAndSortedOrders.length} 条</div>
         <div className="flex gap-1">
             <button className="px-2 py-1 border rounded disabled:opacity-50 hover:bg-gray-50">Prev</button>
             <button className="px-2 py-1 border rounded bg-blue-50 text-blue-600 border-blue-200">1</button>
             <button className="px-2 py-1 border rounded disabled:opacity-50 hover:bg-gray-50">Next</button>
         </div>
      </div>
    </div>
  );
};

const OrderRow: React.FC<{ order: Order }> = ({ order }) => {
  // Enhanced color logic for statuses
  const statusColorClass = useMemo(() => {
    switch (order.status) {
      case OrderStatus.CANCELED: return 'text-orange-500 font-medium';
      case OrderStatus.PENDING: return 'text-red-600 font-bold'; // Highlight Pending
      case OrderStatus.CONFIRMED: return 'text-green-600 font-medium';
      default: return 'text-gray-700';
    }
  }, [order.status]);

  const statusLabel = {
    [OrderStatus.PENDING]: '待确认',
    [OrderStatus.CONFIRMED]: '已确认',
    [OrderStatus.PICKED_UP]: '已取车',
    [OrderStatus.RETURNED]: '已还车',
    [OrderStatus.COMPLETED]: '已完成',
    [OrderStatus.CANCELED]: '已取消',
  }[order.status];

  // Logic to check if actual car is from a different store than the pickup store
  const isCrossStoreVehicle = order.actualCar && 
                              order.actualCarCurrentStore && 
                              order.pickupStore && 
                              order.actualCarCurrentStore.id !== order.pickupStore.id;

  return (
    <tr className="group border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
      {/* Sticky Checkbox */}
      <td className="p-4 align-top sticky left-0 z-30 bg-white group-hover:bg-blue-50 border-r border-gray-100/50">
        <input type="checkbox" />
      </td>
      
      {/* Sticky Order No */}
      <td className="p-4 align-top sticky left-12 z-30 bg-white group-hover:bg-blue-50 border-r border-gray-100 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
        <div className="flex mb-1.5">
           <span className="text-[10px] px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-600 font-medium tracking-wide">
             {order.source}
           </span>
        </div>
        <div className="text-gray-500 text-xs">平台订单号:</div>
        <div className="text-blue-600 mb-2 font-medium">{order.platformOrderNo}</div>
        
        <div className="text-gray-400 text-[10px] mt-1">
            下单时间 (门店当地): {formatStoreTime(order.createTime, order.pickupStore.timeZone)}
        </div>
      </td>

      {/* Confirmation No & Time */}
      <td className="p-4 align-top bg-white group-hover:bg-blue-50/30">
         <div className="mb-2">
            <div className="text-xs text-gray-500">确认号:</div>
            {order.id ? (
               <div className="text-gray-900 font-medium">{order.id.padStart(8, '0')}</div>
            ) : '--'}
            
            {order.confirmType && (
              <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded border ${
                order.confirmType === 'INSTANT' 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-orange-50 text-orange-700 border-orange-200'
              }`}>
                {order.confirmType === 'INSTANT' ? '立即确认' : '二次确认'}
              </span>
            )}
         </div>
         {order.confirmTime ? (
             <div className="text-gray-500 text-[10px]">
                 确认: {formatStoreTime(order.confirmTime, order.pickupStore.timeZone)}
             </div>
         ) : order.status === OrderStatus.PENDING && (
           <div className="text-xs text-red-500 italic mt-1">待处理</div>
         )}
      </td>

      {/* Vehicle Info */}
      <td className="p-4 align-top bg-white group-hover:bg-blue-50/30">
        <div className="text-xs text-gray-500">预定车辆:</div>
        <div className="mb-2 font-medium text-gray-800">{order.carModel}</div>
        
        {order.actualCar && (
            <>
                <div className="text-xs text-gray-500 mt-2">实际车辆:</div>
                <div className="flex flex-wrap items-center gap-1">
                    <div className="text-gray-900 font-medium">{order.actualCar}</div>
                    {isCrossStoreVehicle && (
                      <span className="text-red-500 text-[10px] font-medium bg-red-50 border border-red-100 px-1 rounded">
                        {order.actualCarCurrentStore?.name}
                      </span>
                    )}
                </div>
            </>
        )}
      </td>

      {/* Pickup Info */}
      <td className="p-4 align-top bg-white group-hover:bg-blue-50/30">
        <div className="text-xs text-gray-500">取车门店:</div>
        <div className="mb-2">{order.pickupStore.name}</div>
        <div className="text-xs text-gray-500">取车时间:</div>
        <div className="font-medium whitespace-nowrap">{formatStoreTime(order.pickupTime, order.pickupStore.timeZone)}</div>
      </td>

      {/* Return Info */}
      <td className="p-4 align-top bg-white group-hover:bg-blue-50/30">
        <div className="text-xs text-gray-500">还车门店:</div>
        <div className="mb-2">{order.returnStore.name}</div>
        <div className="text-xs text-gray-500">还车时间:</div>
        <div className="font-medium whitespace-nowrap">{formatStoreTime(order.returnTime, order.returnStore.timeZone)}</div>
      </td>

      {/* Customer */}
      <td className="p-4 align-top bg-white group-hover:bg-blue-50/30">
        <div className="text-xs text-gray-500">姓名:</div>
        <div className="font-medium">{order.customerName}</div>
      </td>

      {/* Amount */}
      <td className="p-4 align-top bg-white group-hover:bg-blue-50/30">
        <div className="text-xs text-gray-500">订单金额:</div>
        <div className="font-medium text-gray-900 whitespace-nowrap">{order.amount} {order.currency}</div>
        <div className={`text-xs mt-1 ${order.paymentStatus === 'Refunded' ? 'text-red-400' : 'text-green-600'}`}>
            {order.paymentStatus}
        </div>
      </td>

      {/* Remarks */}
      <td className="p-4 align-top text-gray-500 text-xs max-w-[150px] truncate bg-white group-hover:bg-blue-50/30">
        {order.remarks || '--'}
      </td>

      {/* Update Time */}
      <td className="p-4 align-top bg-white group-hover:bg-blue-50/30">
        <div className="text-xs text-gray-500">更新时间:</div>
        <div className="whitespace-nowrap">{formatStoreTime(order.updateTime, order.pickupStore.timeZone)}</div>
      </td>

      {/* Status */}
      <td className="p-4 align-top border-l border-gray-100 bg-gray-50/30">
        <div className={`text-sm ${statusColorClass} whitespace-nowrap`}>
            {statusLabel}
        </div>
        {order.status === OrderStatus.CANCELED && order.cancelTime && (
            <div className="text-[10px] text-gray-400 mt-1 whitespace-nowrap">
                取消: {formatStoreTime(order.cancelTime, order.pickupStore.timeZone)}
            </div>
        )}
      </td>

      {/* Sticky Actions */}
      <td className="p-4 align-top text-right sticky right-0 z-30 bg-white group-hover:bg-blue-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] border-l border-gray-100">
        <div className="flex flex-col gap-1.5 items-end">
          <button className="text-blue-500 hover:text-blue-700 text-xs font-medium">查看</button>
          
          {/* Pending Actions */}
          {order.status === OrderStatus.PENDING && (
            <>
              <button className="text-green-600 hover:text-green-700 text-xs font-medium border border-green-200 px-2 py-0.5 rounded bg-green-50 hover:bg-green-100">
                立即确认
              </button>
              <button className="text-red-500 hover:text-red-700 text-xs border border-red-200 px-2 py-0.5 rounded bg-red-50 hover:bg-red-100">
                拒单
              </button>
            </>
          )}

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

// --- Sub-components for Filter Bar ---
const FilterInput: React.FC<{ label: string; placeholder?: string }> = ({ label, placeholder }) => (
  <div className="flex flex-col gap-1">
     <span className="text-xs text-gray-500 font-medium">{label}</span>
     <input type="text" placeholder={placeholder || "请输入"} className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-blue-500 focus:border-blue-500 transition-colors" />
  </div>
);

const FilterSelect: React.FC<{ label: string; options: string[] }> = ({ label, options }) => (
  <div className="flex flex-col gap-1">
     <span className="text-xs text-gray-500 font-medium">{label}</span>
     <div className="relative w-full">
        <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full appearance-none bg-white text-gray-600 focus:outline-blue-500 focus:border-blue-500 transition-colors">
            <option>请选择</option>
            {options.map((opt, i) => <option key={i}>{opt}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
     </div>
  </div>
);

const DateRangeInput: React.FC<{ label: string }> = ({ label }) => {
  const [startVal, setStartVal] = useState('');
  const [endVal, setEndVal] = useState('');

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // If transitioning from empty to having a date, default time to 00:00
    if (!startVal && val && val.indexOf('T') !== -1) {
      const [datePart] = val.split('T');
      setStartVal(`${datePart}T00:00`);
    } else {
      setStartVal(val);
    }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // If transitioning from empty to having a date, default time to 23:59
    if (!endVal && val && val.indexOf('T') !== -1) {
      const [datePart] = val.split('T');
      setEndVal(`${datePart}T23:59`);
    } else {
      setEndVal(val);
    }
  };

  return (
    <div className="flex flex-col gap-1 col-span-2">
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <div className="flex items-center gap-2 w-full">
        <div className="relative w-full">
          {/* type="datetime-local" provides the hour/minute picker */}
          <input 
            type="datetime-local" 
            value={startVal}
            onChange={handleStartChange}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full text-gray-600 focus:outline-blue-500 focus:border-blue-500 transition-colors" 
          />
        </div>
        <span className="text-gray-400 text-xs">至</span>
        <div className="relative w-full">
          <input 
            type="datetime-local" 
            value={endVal}
            onChange={handleEndChange}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full text-gray-600 focus:outline-blue-500 focus:border-blue-500 transition-colors" 
          />
        </div>
      </div>
    </div>
  );
};

// --- Filter Bar (Responsive Grid to match screenshot density) ---
const FilterBar: React.FC = () => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="p-4 border-b border-gray-100 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        
        {/* --- Row 1 --- */}
        <FilterInput label="订单号/确认号:" />
        <DateRangeInput label="下单日期:" />
        <DateRangeInput label="取车日期:" />
        <FilterSelect label="取车门店:" options={['IX樱花租车-那霸空港店', 'IX樱花租车-福冈店']} />

        {/* --- Row 2 (Visible when expanded) --- */}
        {expanded && (
          <>
            <FilterSelect label="还车门店:" options={['IX樱花租车-那霸空港店', 'IX樱花租车-福冈店']} />
            <DateRangeInput label="还车日期:" />
            <FilterSelect label="订单来源:" options={['klook', 'trip.com', 'economybooking', 'website']} />
            <FilterSelect label="订单状态:" options={['待确认', '已确认', '已取车', '已还车', '已完成', '已取消']} />
            
            <FilterSelect label="订单确认方式:" options={['即时确认', '二次确认']} />
            <FilterInput label="客户姓名:" />
            <FilterInput label="客户邮箱:" />
            <FilterInput label="客户电话:" />
            <FilterSelect label="车型组:" options={['Note4', 'CSFT2', 'W1', 'CSAQ5']} />
            
            <DateRangeInput label="订单取消时间:" />
            <FilterInput label="订单备注:" />
          </>
        )}

        {/* --- Action Buttons (Floated to right of grid) --- */}
        <div className="flex items-end gap-2 justify-end md:col-start-2 lg:col-start-4 xl:col-start-5 ml-auto w-full">
            <button 
              onClick={() => setExpanded(!expanded)} 
              className="text-blue-500 text-xs hover:underline mb-2.5 mr-2"
            >
              {expanded ? '收起筛选' : '展开筛选'}
            </button>
            <button className="flex items-center gap-1 border border-gray-300 rounded px-4 py-1.5 text-sm hover:bg-gray-50 bg-white text-gray-700 shadow-sm transition-colors">
               <Search size={14} /> 搜索
            </button>
            <button className="flex items-center gap-1 border border-gray-300 rounded px-4 py-1.5 text-sm hover:bg-gray-50 bg-white text-gray-700 shadow-sm transition-colors">
               <RotateCcw size={14} /> 重置
            </button>
        </div>

      </div>
    </div>
  );
};

export default OrderList;
