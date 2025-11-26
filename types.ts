
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PICKED_UP = 'PICKED_UP',
  RETURNED = 'RETURNED', // Added status for "已还车"
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED'
}

export interface Store {
  id: string;
  name: string;
  timeZone: string; // e.g., 'Asia/Tokyo', 'America/New_York'
}

export interface Order {
  id: string;
  platformOrderNo: string;
  // externalOrderNo removed as it is redundant with platformOrderNo
  status: OrderStatus;
  
  // Dates (ISO Strings)
  createTime: string; // Displayed in the first column
  updateTime: string; // Used for default sorting
  cancelTime?: string; // Specific for Canceled tab sorting
  
  // Confirmation Info
  confirmTime?: string;
  confirmType?: 'INSTANT' | 'SECONDARY'; // '即时确认' | '二次确认'

  // Pickup Info
  pickupTime: string;
  pickupStore: Store;
  
  // Return Info
  returnTime: string;
  returnStore: Store;
  
  // Vehicle
  carModel: string;
  // carGroup removed in favor of merging into carModel string or UI logic
  actualCar?: string;
  actualCarCurrentStore?: Store; // The store where the actual vehicle belongs (for cross-store detection)
  
  // Customer
  customerName: string;
  contact?: string;
  
  // Financials
  amount: number;
  currency: string;
  paymentStatus: string; // e.g., 'Paid', 'Pay on Arrival'
  
  source: string; // e.g., 'klook', 'trip.com'
  remarks?: string;
}

export type TabType = 
  | 'all' 
  | 'pending' // New Pending Tab
  | 'new_24h' 
  | 'pickup_next_24h' 
  | 'return_today' 
  | 'overdue_pickup' 
  | 'overdue_return' 
  | 'canceled';
