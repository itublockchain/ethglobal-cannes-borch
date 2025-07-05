import axios from 'axios';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { RAIN_API_CONFIG } from '../config';

// Rain.xyz RSA Public Key (from the Python code)
const RSA_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCeZ9uCoxi2XvOw1VmvVLo88TLk
GE+OO1j3fa8HhYlJZZ7CCIAsaCorrU+ZpD5PUTnmME3DJk+JyY1BB3p8XI+C5uno
QucrbxFbkM1lgR10ewz/LcuhleG0mrXL/bzUZbeJqI6v3c9bXvLPKlsordPanYBG
FZkmBPxc8QEdRgH4awIDAQAB
-----END PUBLIC KEY-----`;

interface CardCreationResponse {
  cardId: string;
}

interface CardDetailsResponse {
  expirationMonth: number;
  expirationYear: number;
  last4: string;
  encryptedPan: {
    base64Secret: string;
    base64Iv: string;
  };
  encryptedCvc: {
    base64Secret: string;
    base64Iv: string;
  };
  cardholderFirstName: string;
  cardholderLastName: string;
  cardholderEmail: string;
  status: string;
}

interface DecryptedCardInfo {
  cardNo: string;
  cvv: string;
  expireDate: string;
}

export class RainAPIService {
  private axiosInstance = axios.create({
    baseURL: RAIN_API_CONFIG.API_BASE,
    headers: {
      'accept': '*/*',
      'accept-language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      'authorization': `Bearer ${RAIN_API_CONFIG.AUTH_TOKEN}`,
      'content-type': 'application/json',
      'dnt': '1',
      'origin': 'https://use.rain.xyz',
      'priority': 'u=1, i',
      'referer': 'https://use.rain.xyz/',
      'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
      'x-csrf-token': RAIN_API_CONFIG.CSRF_TOKEN,
      'Cookie': `sessionId=${RAIN_API_CONFIG.SESSION_COOKIE}`
    },
    timeout: 30000
  });

  constructor() {
    this.validateConfig();
  }

  private validateConfig(): void {
    const requiredFields = [
      'AUTH_TOKEN',
      'SESSION_COOKIE',
      'CSRF_TOKEN',
      'CARDHOLDER_ID',
      'CARDHOLDER_USER_ID',
      'FIRST_NAME',
      'LAST_NAME'
    ];

    for (const field of requiredFields) {
      if (!RAIN_API_CONFIG[field as keyof typeof RAIN_API_CONFIG]) {
        throw new Error(`Rain.xyz API configuration missing: RAIN_${field} environment variable is required!`);
      }
    }
  }

  /**
   * Creates a new virtual card via Rain.xyz API
   */
  async createCard(groupId: string): Promise<string> {
    try {
      console.log(`💳 Creating new virtual card via Rain.xyz API for group ${groupId}...`);
      
      const cardData = {
        cardType: "virtual",
        nickname: groupId,
        cardholderId: RAIN_API_CONFIG.CARDHOLDER_ID,
        cardholderUserId: RAIN_API_CONFIG.CARDHOLDER_USER_ID,
        firstName: RAIN_API_CONFIG.FIRST_NAME,
        lastName: RAIN_API_CONFIG.LAST_NAME,
        spendingLimits: [
          {
            amount: 0,
            interval: "all_time"
          }
        ],
        expirationMonth: 7,
        expirationYear: 2030,
        addressLine1: "",
        addressLine2: "",
        city: "",
        region: "",
        country: "",
        countryLongName: "",
        postalCode: "",
        phoneCountryCode: "",
        phoneNumber: "",
        saveAddress: false,
        service: "standard"
      };

      const response = await this.axiosInstance.post<CardCreationResponse>('/cards', cardData);
      
      if (response.data && response.data.cardId) {
        console.log(`✅ Card created successfully! Card ID: ${response.data.cardId}`);
        return response.data.cardId;
      } else {
        throw new Error('Card creation failed: No cardId in response');
      }
    } catch (error) {
      console.error('❌ Card creation error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      throw error;
    }
  }

  /**
   * Fetches card details and decrypts PAN/CVC
   */
  async getCardDetails(cardId: string): Promise<DecryptedCardInfo> {
    try {
      console.log(`📋 Fetching card details for ID: ${cardId}...`);
      
      // Generate session ID and encrypt it
      const sessionIdHex = uuidv4().replace(/-/g, '');
      const sessionIdB64 = Buffer.from(sessionIdHex, 'hex').toString('base64');
      
      // Encrypt session ID with RSA-OAEP
      const encryptedSessionId = this.encryptSessionId(sessionIdB64);
      
      // Fetch card details
      const response = await this.axiosInstance.get<CardDetailsResponse>(`/cards/${cardId}/details`, {
        headers: {
          'sessionId': encryptedSessionId
        }
      });

      if (!response.data) {
        throw new Error('No card details received');
      }

      console.log('✅ Card details received, decrypting...');
      
      // Decrypt PAN and CVC
      const pan = this.decryptField(response.data.encryptedPan, sessionIdHex, 16);
      const cvc = this.decryptField(response.data.encryptedCvc, sessionIdHex, 3);
      
      const cardInfo: DecryptedCardInfo = {
        cardNo: pan,
        cvv: cvc,
        expireDate: `${response.data.expirationMonth.toString().padStart(2, '0')}/${response.data.expirationYear.toString().slice(-2)}`
      };

      console.log('🔓 Card details decrypted successfully!');
      console.log(`💳 Card Number: ${cardInfo.cardNo}`);
      console.log(`🔒 CVV: ${cardInfo.cvv}`);
      console.log(`📅 Expiry: ${cardInfo.expireDate}`);
      
      return cardInfo;
    } catch (error) {
      console.error('❌ Card details fetch error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      throw error;
    }
  }

  /**
   * Encrypts session ID using RSA-OAEP (mimics Python's PKCS1_OAEP)
   */
  private encryptSessionId(sessionIdB64: string): string {
    try {
      const encrypted = crypto.publicEncrypt(
        {
          key: RSA_PUBLIC_KEY,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha1'
        },
        Buffer.from(sessionIdB64, 'utf8')
      );
      return encrypted.toString('base64');
    } catch (error) {
      console.error('❌ Session ID encryption error:', error);
      throw error;
    }
  }

  /**
   * Decrypts encrypted field using AES-128-GCM
   */
  private decryptField(encryptedField: { base64Secret: string; base64Iv: string }, sessionIdHex: string, outputLength: number): string {
    try {
      const key = Buffer.from(sessionIdHex, 'hex');
      const iv = Buffer.from(encryptedField.base64Iv, 'base64');
      const blob = Buffer.from(encryptedField.base64Secret, 'base64');
      
      // Split ciphertext and authentication tag
      const ciphertext = blob.subarray(0, blob.length - 16);
      const tag = blob.subarray(blob.length - 16);
      
      // Decrypt using AES-128-GCM
      const decipher = crypto.createDecipher('aes-128-gcm', key);
      (decipher as any).setIV(iv);
      (decipher as any).setAuthTag(tag);
      
      let decrypted = decipher.update(ciphertext, undefined, 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted.substring(0, outputLength);
    } catch (error) {
      console.error('❌ Field decryption error:', error);
      throw error;
    }
  }

  /**
   * Creates a card and returns decrypted details
   */
  async createAndGetCard(groupId: string): Promise<DecryptedCardInfo> {
    try {
      console.log(`🚀 Starting card creation and retrieval process for group ${groupId}...`);
      
      // Create card
      const cardId = await this.createCard(groupId);
      
      // Wait a bit for card to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get card details
      const cardDetails = await this.getCardDetails(cardId);
      
      console.log('✅ Card creation and retrieval completed successfully!');
      return cardDetails;
    } catch (error) {
      console.error('❌ Card creation and retrieval process failed:', error);
      throw error;
    }
  }

  /**
   * Fetches all cards from Rain.xyz API
   */
  async getCards(): Promise<any[]> {
    try {
      console.log('📋 Fetching all cards from Rain.xyz API...');
      
      const response = await this.axiosInstance.get('/cards');
      
      if (response.data && response.data.cards) {
        console.log(`✅ Retrieved ${response.data.cards.length} cards successfully!`);
        return response.data.cards;
      } else {
        console.log('⚠️  No cards found in response');
        return [];
      }
    } catch (error) {
      console.error('❌ Get cards error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      throw error;
    }
  }

  /**
   * Finds a card by nickname (group ID)
   */
  async findCardByNickname(nickname: string): Promise<any | null> {
    try {
      console.log(`🔍 Searching for card with nickname: ${nickname}...`);
      
      const cards = await this.getCards();
      const card = cards.find(c => c.nickname === nickname);
      
      if (card) {
        console.log(`✅ Found card with nickname ${nickname}: ${card.id}`);
        return card;
      } else {
        console.log(`⚠️  No card found with nickname: ${nickname}`);
        return null;
      }
    } catch (error) {
      console.error('❌ Find card by nickname error:', error);
      throw error;
    }
  }

  /**
   * Updates card spending limit
   */
  async updateCardLimit(cardId: string, amountUSD: number): Promise<void> {
    try {
      console.log(`💳 Updating card ${cardId} limit to $${amountUSD}...`);
      
      // Amount is multiplied by 100 (100 USD = 10000)
      const amount = amountUSD * 100;
      
      const updateData = {
        spendingLimit: {
          amount: amount,
          interval: "all_time"
        }
      };

      const response = await this.axiosInstance.put(`/cards/${cardId}`, updateData);
      
      if (response.status === 200) {
        console.log(`✅ Card limit updated successfully! New limit: $${amountUSD} (${amount} cents)`);
      } else {
        console.log(`❌ Failed to update card limit. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Update card limit error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      throw error;
    }
  }

  /**
   * Increases card spending limit by deposit amount
   */
  async increaseCardLimitByDeposit(groupId: string, depositAmountUSD: number): Promise<void> {
    try {
      console.log(`🎯 Processing deposit for group ${groupId}: $${depositAmountUSD}...`);
      
      // Find card by nickname (group ID)
      const card = await this.findCardByNickname(groupId);
      
      if (!card) {
        console.log(`⚠️  No card found for group ${groupId}. Skipping limit update.`);
        return;
      }
      
      // Get current limit
      const currentLimit = card.spendingLimits && card.spendingLimits.length > 0 
        ? card.spendingLimits[0].amount / 100 
        : 0;
      
      // Calculate new limit
      const newLimit = currentLimit + depositAmountUSD;
      
      console.log(`📊 Current limit: $${currentLimit} | Deposit: $${depositAmountUSD} | New limit: $${newLimit}`);
      
      // Update card limit
      await this.updateCardLimit(card.id, newLimit);
      
      console.log(`✅ Successfully increased card limit for group ${groupId}!`);
    } catch (error) {
      console.error('❌ Increase card limit by deposit error:', error);
      throw error;
    }
  }
} 