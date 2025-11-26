import { Order, OrderStatus } from './types';

const NOW = new Date();
const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * ONE_HOUR;

// Helpers to generate times relative to "Now"
const getRelativeTime = (offsetHours: number) => new Date(NOW.getTime() + offsetHours * ONE_HOUR).toISOString();

const NAHA_STORE = { id: 'S01', name: 'IX樱花租车-那霸空港店', timeZone: 'Asia/Tokyo' };
const FUKUOKA_STORE = { id: 'S02', name: 'IX樱花租车-福冈店', timeZone: 'Asia/Tokyo' };

export const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    platformOrderNo: 'R745009384698629',
    externalOrderNo: 'CJZ964640',
    status: OrderStatus.CONFIRMED,
    updateTime: getRelativeTime(-2), // Updated 2 hours ago
    createTime: getRelativeTime(-48),
    pickupTime: getRelativeTime(5), // Pickup in 5 hours (Next 24h)
    pickupStore: NAHA_STORE,
    returnTime: getRelativeTime(5 + 48),
    returnStore: NAHA_STORE,
    carModel: 'CDAV Toyota Aqua',
    carGroup: 'Note4',
    customerName: 'kwon ginam',
    amount: 39.2,
    currency: 'USD',
    paymentStatus: 'Prepaid',
    source: 'klook'
  },
  {
    id: '2',
    platformOrderNo: 'R744154708988677',
    externalOrderNo: 'GZX662969',
    status: OrderStatus.CANCELED,
    updateTime: getRelativeTime(-1), // Updated/Canceled 1 hour ago
    cancelTime: getRelativeTime(-1), // Canceled time
    createTime: getRelativeTime(-24),
    pickupTime: getRelativeTime(20),
    pickupStore: FUKUOKA_STORE,
    returnTime: getRelativeTime(20 + 72),
    returnStore: FUKUOKA_STORE,
    carModel: 'MCAV Honda N-BOX',
    carGroup: 'CSFT2',
    customerName: 'lun yuen ting',
    amount: 38.0,
    currency: 'USD',
    paymentStatus: 'Refunded',
    source: 'klook'
  },
  {
    id: '3',
    platformOrderNo: 'R744054233342725',
    externalOrderNo: 'WQZ736576',
    status: OrderStatus.CANCELED,
    updateTime: getRelativeTime(-25), // Updated yesterday
    cancelTime: getRelativeTime(-25),
    createTime: getRelativeTime(-100),
    pickupTime: getRelativeTime(-10), // Was supposed to be picked up
    pickupStore: NAHA_STORE,
    returnTime: getRelativeTime(30),
    returnStore: NAHA_STORE,
    carModel: 'CDAV Toyota Aqua',
    carGroup: 'CSAQ5',
    customerName: 'Wong Angela',
    amount: 119.0,
    currency: 'USD',
    paymentStatus: 'Refunded',
    source: 'klook'
  },
  {
    id: '4',
    platformOrderNo: 'R743583524643141',
    externalOrderNo: 'B82086153',
    status: OrderStatus.CONFIRMED,
    updateTime: getRelativeTime(-0.5), // Just updated
    createTime: getRelativeTime(-5),
    pickupTime: getRelativeTime(26), // Pickup in 26 hours (Outside Next 24h)
    pickupStore: NAHA_STORE,
    returnTime: getRelativeTime(26 + 96),
    returnStore: NAHA_STORE,
    carModel: 'MCAV Honda N-BOX',
    carGroup: 'NOTE3',
    customerName: 'Bryan Altaker',
    amount: 91.8,
    currency: 'USD',
    paymentStatus: 'Pay on Arrival',
    source: 'economybooking'
  },
  {
    id: '5',
    platformOrderNo: 'R743999999999999',
    externalOrderNo: 'TST00001',
    status: OrderStatus.PICKED_UP,
    updateTime: getRelativeTime(-0.1), // Just picked up
    createTime: getRelativeTime(-10),
    pickupTime: getRelativeTime(-0.1),
    pickupStore: NAHA_STORE,
    returnTime: getRelativeTime(48),
    returnStore: NAHA_STORE,
    carModel: 'Toyota Alphard',
    carGroup: 'W1',
    customerName: 'Zhang San',
    amount: 250.0,
    currency: 'USD',
    paymentStatus: 'Paid',
    source: 'trip.com'
  }
];