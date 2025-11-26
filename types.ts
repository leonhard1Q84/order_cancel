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
  externalOrderNo?: string;
  status: OrderStatus;
  
  // Dates (ISO Strings)
  createTime: string; // Displayed in the first column
  updateTime: string; // Used for default sorting
  cancelTime?: string; // Specific for Canceled tab sorting
  
  // Pickup Info
  pickupTime: string;
  pickupStore: Store;
  
  // Return Info
  returnTime: string;
  returnStore: Store;
  
  // Vehicle
  carModel: string;
  carGroup: string;
  actualCar?: string;
  
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
  | 'new_24h' 
  | 'pickup_next_24h' 
  | 'return_today' 
  | 'overdue_pickup' 
  | 'overdue_return' 
  | 'canceled';