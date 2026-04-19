import type { LoyaltyReward } from '../types';

// 10 loyalty rewards for February 2026.
export const loyaltyRewards: LoyaltyReward[] = [
  { id: 'rwd-001', customerId: 'cust-001', customerName: 'Alessandro Rossi', month: '2026-02', rank: 1, rewardType: 'tasting', rewardLabel: 'Menu degustazione 4 portate', qrCode: 'EZRST-7K3P9M', issuedAt: '2026-02-01T09:00:00Z', expiresAt: '2026-04-30T23:59:59Z', value: 180, redeemedAt: '2026-02-14T21:30:00Z' },
  { id: 'rwd-002', customerId: 'cust-002', customerName: 'Giulia Ferrari', month: '2026-02', rank: 2, rewardType: 'bottiglia', rewardLabel: 'Bottiglia Barolo DOCG', qrCode: 'EZRST-M2H8X4', issuedAt: '2026-02-01T09:00:00Z', expiresAt: '2026-04-30T23:59:59Z', value: 180 },
  { id: 'rwd-003', customerId: 'cust-003', customerName: 'Matteo De Luca', month: '2026-02', rank: 3, rewardType: 'upgrade', rewardLabel: 'Upgrade tavolo premium', qrCode: 'EZRST-9Q5R2T', issuedAt: '2026-02-01T09:00:00Z', expiresAt: '2026-04-30T23:59:59Z', value: 80 },
  { id: 'rwd-004', customerId: 'cust-004', customerName: 'Francesca Bianchi', month: '2026-02', rank: 4, rewardType: 'aperitivo', rewardLabel: 'Aperitivo della casa per 2', qrCode: 'EZRST-4B7N3V', issuedAt: '2026-02-01T09:00:00Z', expiresAt: '2026-04-30T23:59:59Z', value: 40 },
  { id: 'rwd-005', customerId: 'cust-005', customerName: 'Luca Romano', month: '2026-02', rank: 5, rewardType: 'aperitivo', rewardLabel: 'Aperitivo della casa per 2', qrCode: 'EZRST-J8F6W1', issuedAt: '2026-02-01T09:00:00Z', expiresAt: '2026-04-30T23:59:59Z', value: 40, redeemedAt: '2026-02-18T19:45:00Z' },
  { id: 'rwd-006', customerId: 'cust-006', customerName: 'Sofia Colombo', month: '2026-02', rank: 6, rewardType: 'aperitivo', rewardLabel: 'Aperitivo della casa per 2', qrCode: 'EZRST-D5K9L7', issuedAt: '2026-02-01T09:00:00Z', expiresAt: '2026-04-30T23:59:59Z', value: 40 },
  { id: 'rwd-007', customerId: 'cust-008', customerName: 'Chiara Conti', month: '2026-02', rank: 7, rewardType: 'dessert', rewardLabel: 'Dolce della casa', qrCode: 'EZRST-P3G6Y2', issuedAt: '2026-02-01T09:00:00Z', expiresAt: '2026-04-30T23:59:59Z', value: 16 },
  { id: 'rwd-008', customerId: 'cust-007', customerName: 'Marco Esposito', month: '2026-02', rank: 8, rewardType: 'dessert', rewardLabel: 'Dolce della casa', qrCode: 'EZRST-W1Z8H5', issuedAt: '2026-02-01T09:00:00Z', expiresAt: '2026-04-30T23:59:59Z', value: 16 },
  { id: 'rwd-009', customerId: 'cust-009', customerName: 'Andrea Ricci', month: '2026-02', rank: 9, rewardType: 'dessert', rewardLabel: 'Dolce della casa', qrCode: 'EZRST-T4X2R9', issuedAt: '2026-02-01T09:00:00Z', expiresAt: '2026-04-30T23:59:59Z', value: 16 },
  { id: 'rwd-010', customerId: 'cust-010', customerName: 'Elena Marino', month: '2026-02', rank: 10, rewardType: 'dessert', rewardLabel: 'Dolce della casa', qrCode: 'EZRST-S6C3B4', issuedAt: '2026-02-01T09:00:00Z', expiresAt: '2026-04-30T23:59:59Z', value: 16 },
];
