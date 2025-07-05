import { RainAPIService } from './services/RainAPIService';

async function testRainAPI() {
  console.log('🧪 Testing Rain.xyz API Integration...\n');

  const rainAPI = new RainAPIService();

  try {
    // Test 1: Get all cards
    console.log('📋 Test 1: Fetching all cards...');
    const cards = await rainAPI.getCards();
    console.log(`Found ${cards.length} cards\n`);

    // Test 2: Find card by nickname
    console.log('🔍 Test 2: Finding card by nickname...');
    const testNickname = '1'; // Change this to test different group IDs
    const card = await rainAPI.findCardByNickname(testNickname);
    
    if (card) {
      console.log(`✅ Found card: ${card.id} with nickname: ${card.nickname}`);
      console.log(`Current limit: $${card.spendingLimits[0]?.amount / 100 || 0}\n`);
      
      // Test 3: Update card limit
      console.log('💳 Test 3: Updating card limit...');
      await rainAPI.updateCardLimit(card.id, 150); // Set to $150
      console.log('✅ Card limit updated successfully!\n');
      
      // Test 4: Test increaseCardLimitByDeposit
      console.log('🎯 Test 4: Simulating deposit of $50...');
      await rainAPI.increaseCardLimitByDeposit(testNickname, 50);
      console.log('✅ Deposit simulation completed!\n');
      
    } else {
      console.log(`❌ No card found with nickname: ${testNickname}\n`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests
if (require.main === module) {
  testRainAPI().catch(console.error);
}

export { testRainAPI }; 