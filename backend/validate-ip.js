const User = require('./models/User');
const TrustAnalyzer = require('./utils/trustAnalyzer');
const mongoose = require('mongoose');

async function validateIPTracking() {
  try {
    await mongoose.connect('mongodb+srv://teamhackathon:12345@trustlens.qoeucek.mongodb.net/trustlens');
    console.log('✅ Connected to MongoDB Atlas');
    
    // Get all users
    const allUsers = await User.find({}, 'username ipAddress trustScore createdAt');
    console.log(`📊 Total users in database: ${allUsers.length}`);
    
    // Check users with IP addresses
    const usersWithIP = allUsers.filter(user => user.ipAddress);
    console.log(`📍 Users with IP addresses: ${usersWithIP.length}`);
    
    if (usersWithIP.length === 0) {
      console.log('⚠️  No users have IP addresses yet. Need to create new accounts or login existing ones.');
      
      // Show all users for reference
      console.log('\n👥 Current users:');
      allUsers.forEach(user => {
        console.log(`   ${user.username}: IP=${user.ipAddress || 'Not set'}, Trust=${user.trustScore}%`);
      });
      
      // Let's simulate IP addresses for testing
      console.log('\n🧪 Simulating IP addresses for testing...');
      if (allUsers.length >= 3) {
        // Assign same IP to first 3 users to test shared IP logic
        const testIP = '192.168.1.100';
        for (let i = 0; i < 3; i++) {
          if (allUsers[i]) {
            allUsers[i].ipAddress = testIP;
            await allUsers[i].save();
            console.log(`   Assigned IP ${testIP} to ${allUsers[i].username}`);
          }
        }
        
        // Assign unique IP to 4th user if exists
        if (allUsers[3]) {
          allUsers[3].ipAddress = '10.0.0.50';
          await allUsers[3].save();
          console.log(`   Assigned unique IP 10.0.0.50 to ${allUsers[3].username}`);
        }
        
        console.log('\n🔄 Running validation again with test IPs...');
        return validateIPTracking();
      }
    } else {
      // Group users by IP address
      const ipGroups = {};
      usersWithIP.forEach(user => {
        if (!ipGroups[user.ipAddress]) {
          ipGroups[user.ipAddress] = [];
        }
        ipGroups[user.ipAddress].push(user);
      });
      
      console.log('\n🌐 IP Address Distribution:');
      Object.entries(ipGroups).forEach(([ip, users]) => {
        const marker = users.length === 1 ? '✅' : users.length >= 3 ? '⚠️' : '📋';
        console.log(`IP: ${ip} → ${users.length} user${users.length > 1 ? 's' : ''} ${marker}`);
        users.forEach(user => {
          console.log(`   - ${user.username} (Trust: ${user.trustScore}%)`);
        });
      });
      
      // Test trust score calculation
      console.log('\n🧠 Step 2: Trust Score Verification');
      for (let i = 0; i < Math.min(3, usersWithIP.length); i++) {
        const user = usersWithIP[i];
        try {
          const ipAnalysis = await TrustAnalyzer.getIPAnalysisDetails(user._id);
          const oldScore = user.trustScore;
          
          // Refresh user from database to get current score
          const currentUser = await User.findById(user._id);
          const newScore = await TrustAnalyzer.calculateTrustScore(currentUser);
          
          console.log(`\n👤 ${user.username}:`);
          console.log(`   IP: ${user.ipAddress}`);
          console.log(`   Users with same IP: ${ipAnalysis ? ipAnalysis.totalUsersWithIP : 'Unknown'}`);
          console.log(`   Trust Score: ${oldScore}% → ${newScore}%`);
          console.log(`   IP Impact: ${ipAnalysis ? ipAnalysis.scoreAdjustment : 'Unknown'}`);
          console.log(`   Status: ${ipAnalysis ? ipAnalysis.ipStatus : 'Unknown'}`);
          
          // Validate scoring logic
          if (ipAnalysis) {
            if (ipAnalysis.totalUsersWithIP === 1 && ipAnalysis.scoreAdjustment === 10) {
              console.log(`   ✅ Unique IP boost applied correctly (+10)`);
            } else if (ipAnalysis.totalUsersWithIP >= 3 && ipAnalysis.scoreAdjustment === -15) {
              console.log(`   ⚠️ Shared IP penalty applied correctly (-15)`);
            } else if (ipAnalysis.totalUsersWithIP === 2 && ipAnalysis.scoreAdjustment === 0) {
              console.log(`   📋 Household IP (no penalty)`);
            }
          }
        } catch (error) {
          console.log(`\n👤 ${user.username}: Error - ${error.message}`);
        }
      }
    }
    
    mongoose.connection.close();
    console.log('\n✅ Validation complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

validateIPTracking(); 