# WhatsApp Bulk Sender - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
Before you begin, make sure you have:
- Node.js v18 or higher installed
- MongoDB installed and running (or MongoDB Atlas account)
- Redis installed and running (or Redis Cloud account)
- A Meta Business Manager account
- A dedicated phone number for WhatsApp API

---

## 📋 Step 1: Meta WhatsApp API Setup

### 1.1 Create Meta Business Account
1. Go to [Meta Business Manager](https://business.facebook.com/)
2. Create a new business account
3. Complete business verification (requires GST/MSME documents)

### 1.2 Set Up WhatsApp Cloud API
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app → Select "Business" type
3. Add "WhatsApp" product to your app
4. Navigate to WhatsApp → Getting Started
5. Note down the following:
   - **Phone Number ID**
   - **WhatsApp Business Account ID**
   - **Temporary Access Token** (get a permanent one later)

### 1.3 Add Your Phone Number
1. Go to WhatsApp → Getting Started
2. Click "Add phone number"
3. Verify your dedicated phone number via SMS/Call
4. **Important:** This number cannot be registered on regular WhatsApp app

### 1.4 Create Message Templates
1. Go to WhatsApp → Message Templates
2. Click "Create Template" 
3. Example template:
   ```
   Name: product_update
   Category: MARKETING
   Language: English
   
   Body:
   Hello {{1}}, 
   
   We have exciting new products for you! 
   Check out {{2}} at great prices.
   
   Visit our store today!
   ```
4. Submit for approval (usually takes a few hours)

---

## 📦 Step 2: Install Dependencies

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Generate a secure webhook token
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the generated token, you'll need it for .env
```

### Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Dependencies should already be installed
# If not, run:
npm install
```

---

## ⚙️ Step 3: Configure Environment Variables

### Backend Configuration

Create `backend/.env` file (copy from .env.example):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/whatsapp-bulk
REDIS_URL=redis://localhost:6379

# WhatsApp Cloud API - Replace with your actual values
WHATSAPP_API_VERSION=v18.0
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token_here

# Webhook - Use the generated token from Step 2
WEBHOOK_VERIFY_TOKEN=your_generated_random_token

NODE_ENV=development
```

### Frontend Configuration

Create `frontend/.env` file:

```env
VITE_API_URL=http://localhost:5000
```

---

## 🗄️ Step 4: Start MongoDB and Redis

### Option A: Local Installation

**MongoDB:**
```bash
# Windows
mongod

# Mac/Linux
sudo systemctl start mongodb
```

**Redis:**
```bash
# Windows (download from https://github.com/microsoftarchive/redis/releases)
redis-server

# Mac
brew services start redis

# Linux
sudo systemctl start redis
```

### Option B: Cloud Services (Recommended for Production)

**MongoDB Atlas:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string and update `MONGODB_URI` in `.env`

**Redis Cloud:**
1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Create a free database
3. Get connection URL and update `REDIS_URL` in `.env`

---

## 🏃 Step 5: Run the Application

### Start Backend
```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB Connected
🚀 WhatsApp Bulk Sender API Server
📡 Server running on port 5000
```

### Start Frontend (in a new terminal)
```bash
cd frontend
npm run dev
```

You should see:
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

## 🔧 Step 6: Configure Webhooks (For Production)

Webhooks allow you to receive real-time updates on message delivery status.

### For Local Development (using ngrok):
```bash
# Install ngrok: https://ngrok.com/download
ngrok http 5000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

### Configure in Meta:
1. Go to Meta App Dashboard → WhatsApp → Configuration
2. Set Callback URL: `https://your-domain.com/api/whatsapp/webhook`
3. Set Verify Token: (same as `WEBHOOK_VERIFY_TOKEN` in .env)
4. Subscribe to: `messages` and `message_template_status_update`

---

## ✅ Step 7: Test the System

### 1. Access the Dashboard
Open your browser and go to: `http://localhost:5173`

### 2. Upload Contacts
1. Click "Contacts" in sidebar
2. Click "Upload CSV/Excel"
3. Upload a file with columns: `Name`, `Phone` (or `PhoneNumber`)
4. Example CSV:
   ```
   Name,Phone
   John Doe,+919876543210
   Jane Smith,+919876543211
   ```

### 3. Create a Campaign
1. Click "Campaigns" in sidebar
2. Click "Create Campaign"
3. Fill in details:
   - Campaign Name
   - Select approved template
   - Choose target tags (or leave empty for all)
4. Click "Create & Send"

### 4. Monitor Progress
- Go to "Dashboard" to see real-time stats
- Go to "Analytics" to see detailed logs
- Check "Queue Status" to see message processing

---

## 🐛 Troubleshooting

### Backend won't start
- **MongoDB connection error:** Make sure MongoDB is running
- **Redis connection error:** Make sure Redis is running
- **Port already in use:** Change PORT in .env

### Messages not sending
- **Invalid access token:** Generate a new permanent token in Meta dashboard
- **Template not approved:** Wait for Meta to approve your templates
- **Phone number not verified:** Complete phone verification in Meta dashboard

### Webhooks not working
- **Local development:** Use ngrok to expose localhost
- **Verify token mismatch:** Ensure token in Meta matches .env
- **URL not accessible:** Make sure your server is publicly accessible

---

## 📚 Next Steps

1. **Get a Permanent Access Token:**
   - Temporary tokens expire in 24 hours
   - Go to Meta App → Settings → Basic → System Users
   - Generate a permanent token with whatsapp_business_messaging permission

2. **Request Higher Rate Limits:**
   - Initial limit: ~50 messages/day
   - Go to WhatsApp → Getting Started → Request higher limits
   - Provide business use case

3. **Deploy to Production:**
   - Use a cloud provider (AWS, DigitalOcean, Heroku)
   - Set up SSL certificate
   - Use production MongoDB and Redis
   - Configure webhook with production URL

4. **Monitor Costs:**
   - Track message count
   - Current rate: ~₹0.88 per marketing message
   - Use analytics to optimize campaigns

---

## 🎉 You're All Set!

You now have a fully functional WhatsApp Bulk Sender system!

**Support:** If you encounter issues, check:
- [WhatsApp Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Meta Business Help Center](https://www.facebook.com/business/help)

**Happy Messaging! 🚀**
