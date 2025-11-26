
import { Order, OrderStatus } from './types';

const NOW = new Date();
const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * ONE_HOUR;

// Helpers to generate times relative to "Now"
const getRelativeTime = (offsetHours: number) => new Date(NOW.getTime() + offsetHours * ONE_HOUR).toISOString();

const NAHA_STORE = { id: 'S01', name: 'IX樱花租车-那霸空港店', timeZone: 'Asia/Tokyo' };
const FUKUOKA_STORE = { id: 'S02', name: 'IX樱花租车-福冈店', timeZone: 'Asia/Tokyo' };
const HANEDA_STORE = { id: 'S03', name: '羽田空港店', timeZone: 'Asia/Tokyo' }; // Mock store for cross-store highlight

export const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    platformOrderNo: 'R745009384698629',
    status: OrderStatus.CONFIRMED,
    updateTime: getRelativeTime(-2), // Updated 2 hours ago
    createTime: getRelativeTime(-48),
    confirmTime: getRelativeTime(-47.5),
    confirmType: 'INSTANT',
    pickupTime: getRelativeTime(5), // Pickup in 5 hours (Next 24h)
    pickupStore: NAHA_STORE,
    returnTime: getRelativeTime(5 + 48),
    returnStore: NAHA_STORE,
    carModel: 'NOTE4.CDAV.Toyota Aqua',
    actualCar: 'AQUA-8821',
    actualCarCurrentStore: NAHA_STORE, // Same store, no highlight
    customerName: 'kwon ginam',
    amount: 39.2,
    currency: 'USD',
    paymentStatus: 'Prepaid',
    source: 'klook'
  },
  {
    id: '6',
    platformOrderNo: 'R746001122334455',
    status: OrderStatus.PENDING, // New Pending Order
    updateTime: getRelativeTime(-0.2), // Very recent
    createTime: getRelativeTime(-0.2),
    // No confirmTime yet
    pickupTime: getRelativeTime(48),
    pickupStore: NAHA_STORE,
    returnTime: getRelativeTime(48 + 72),
    returnStore: NAHA_STORE,
    carModel: 'W1.FDAR.Toyota Alphard',
    customerName: 'Pending User',
    amount: 300.0,
    currency: 'USD',
    paymentStatus: 'Prepaid',
    source: 'trip.com',
    remarks: 'Needs baby seat'
  },
  {
    id: '2',
    platformOrderNo: 'R744154708988677',
    status: OrderStatus.CANCELED,
    updateTime: getRelativeTime(-1), // Updated/Canceled 1 hour ago
    cancelTime: getRelativeTime(-1), // Canceled time
    createTime: getRelativeTime(-24),
    confirmTime: getRelativeTime(-23.8),
    confirmType: 'SECONDARY',
    pickupTime: getRelativeTime(20),
    pickupStore: FUKUOKA_STORE,
    returnTime: getRelativeTime(20 + 72),
    returnStore: FUKUOKA_STORE,
    carModel: 'CSFT2.MCAV.Honda N-BOX',
    customerName: 'lun yuen ting',
    amount: 38.0,
    currency: 'USD',
    paymentStatus: 'Refunded',
    source: 'klook'
  },
  {
    id: '3',
    platformOrderNo: 'R744054233342725',
    status: OrderStatus.CANCELED,
    updateTime: getRelativeTime(-25), // Updated yesterday
    cancelTime: getRelativeTime(-25),
    createTime: getRelativeTime(-100),
    // No confirmTime if it was canceled before confirm, or simulate confirmed then canceled
    confirmTime: getRelativeTime(-99),
    confirmType: 'INSTANT',
    pickupTime: getRelativeTime(-10), // Was supposed to be picked up
    pickupStore: NAHA_STORE,
    returnTime: getRelativeTime(30),
    returnStore: NAHA_STORE,
    carModel: 'CSAQ5.CDAV.Toyota Aqua',
    customerName: 'Wong Angela',
    amount: 119.0,
    currency: 'USD',
    paymentStatus: 'Refunded',
    source: 'klook'
  },
  {
    id: '4',
    platformOrderNo: 'R743583524643141',
    status: OrderStatus.CONFIRMED,
    updateTime: getRelativeTime(-0.5), // Just updated
    createTime: getRelativeTime(-5),
    confirmTime: getRelativeTime(-4.5),
    confirmType: 'SECONDARY',
    pickupTime: getRelativeTime(26), // Pickup in 26 hours (Outside Next 24h)
    pickupStore: NAHA_STORE,
    returnTime: getRelativeTime(26 + 96),
    returnStore: NAHA_STORE,
    carModel: 'NOTE3.MCAV.Honda N-BOX',
    customerName: 'Bryan Altaker',
    amount: 91.8,
    currency: 'USD',
    paymentStatus: 'Pay on Arrival',
    source: 'economybooking'
  },
  {
    id: '5',
    platformOrderNo: 'R743999999999999',
    status: OrderStatus.PICKED_UP,
    updateTime: getRelativeTime(-0.1), // Just picked up
    createTime: getRelativeTime(-10),
    confirmTime: getRelativeTime(-9.9),
    confirmType: 'INSTANT',
    pickupTime: getRelativeTime(-0.1),
    pickupStore: NAHA_STORE, // Pickup at Naha
    returnTime: getRelativeTime(48),
    returnStore: NAHA_STORE,
    carModel: 'W1.FDAR.Toyota Alphard',
    actualCar: 'SERENA21',
    actualCarCurrentStore: HANEDA_STORE, // Actual car is from Haneda (Different!)
    customerName: 'Zhang San',
    amount: 250.0,
    currency: 'USD',
    paymentStatus: 'Paid',
    source: 'trip.com'
  }
];
