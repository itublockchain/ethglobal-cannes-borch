import { CardInfo } from '../types';

// Random card information generation function
export function generateRandomCard(): CardInfo {
  // Random card number (16 digits)
  const cardNo = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');
  
  // Random CVV (3 digits)
  const cvv = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10)).join('');
  
  // Random expiry date (1-5 years in the future)
  const currentYear = new Date().getFullYear();
  const futureYear = currentYear + Math.floor(Math.random() * 5) + 1;
  const month = Math.floor(Math.random() * 12) + 1;
  const expireDate = `${month.toString().padStart(2, '0')}/${futureYear.toString().slice(-2)}`;

  return { cardNo, cvv, expireDate };
} 