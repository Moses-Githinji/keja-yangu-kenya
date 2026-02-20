import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import axios from "axios";

const prisma = new PrismaClient();
const API_URL = "http://localhost:5000/api/v1";

async function main() {
  console.log("🚀 Starting Chat Flow Test...");

  try {
    // 1. Setup Data
    console.log("\n--- Setting up Users ---");
    
    // Get Admin (Agent)
    let admin = await prisma.user.findUnique({ where: { email: "admin@kejayangu.com" } });
    if (!admin) {
        console.error("❌ Admin user not found. Run creates-admin-user.js first.");
        return;
    }
    console.log(`✅ Admin (Agent) found: ${admin.id}`);

    // Create/Get Test User (Client)
    const testEmail = `testuser_${Date.now()}@example.com`;
    const testPassword = "password123";
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    const user = await prisma.user.create({
      data: {
        firstName: "Test",
        lastName: "Client",
        email: testEmail,
        password: hashedPassword,
        phone: `+2547${Math.floor(10000000 + Math.random() * 90000000)}`,
        role: "USER",
        isVerified: true
      }
    });
    console.log(`✅ Test User created: ${user.id} (${testEmail})`);

    // 2. Login
    console.log("\n--- Logging in ---");
    
    // User Login
    const userAuth = await axios.post(`${API_URL}/auth/login`, {
        email: testEmail,
        password: testPassword
    });
    const userToken = userAuth.data.data.accessToken;
    console.log("✅ User logged in");

    // Admin Login
    const adminAuth = await axios.post(`${API_URL}/auth/login`, {
        email: "admin@kejayangu.com",
        password: "123456" // Assuming password is still 123456 from previous step
    });
    const adminToken = adminAuth.data.data.accessToken;
    console.log("✅ Admin logged in");

    // 3. Create Chat (User initiates with Admin)
    console.log("\n--- Creating Chat ---");
    const createChatResponse = await axios.post(
        `${API_URL}/chat`, 
        { agentId: admin.id },
        { headers: { Authorization: `Bearer ${userToken}` } }
    );
    
    const chatId = createChatResponse.data.data.id;
    console.log(`✅ Chat created/retrieved. ID: ${chatId}`);
    
    // 4. Send Message (User sends to Admin)
    console.log("\n--- Sending Message ---");
    const messageContent = "Hello Admin, this is a test message!";
    const sendMessageResponse = await axios.post(
        `${API_URL}/chat/${chatId}/messages`,
        { content: messageContent },
        { headers: { Authorization: `Bearer ${userToken}` } }
    );
    console.log(`✅ Message sent by User: "${sendMessageResponse.data.data.content}"`);

    // 5. Retrieve Messages (Admin checks chat)
    console.log("\n--- Admin Retrieving Messages ---");
    const getMessagesResponse = await axios.get(
        `${API_URL}/chat/${chatId}/messages`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    const messages = getMessagesResponse.data.data.messages;
    const receivedMessage = messages.find(m => m.content === messageContent);
    
    if (receivedMessage) {
        console.log(`✅ Verified: Admin received the message!`);
    } else {
        console.error("❌ Failed: Admin did not see the message.");
    }

    // 6. List Chats (Admin checks list)
    console.log("\n--- Admin Listing Chats ---");
    const getChatsResponse = await axios.get(
        `${API_URL}/chat`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    const chatExists = getChatsResponse.data.data.some(c => c.id === chatId);
    if (chatExists) {
         console.log(`✅ Verified: Chat appears in Admin's chat list.`);
    } else {
        console.error("❌ Failed: Chat not found in Admin's list.");
    }

  } catch (error) {
    console.error("❌ Test Failed:", error.response ? error.response.data : error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
