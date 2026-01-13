# WhatsApp Bulk Sender System

A custom web application to manage and send bulk product updates to clients via WhatsApp using the official WhatsApp Cloud API.

## 🎯 Project Overview

This system eliminates the need for expensive third-party tools (Wati, AiSensy) by directly integrating with Meta's WhatsApp Cloud API. Pay only per-message costs (~₹0.88/message) instead of monthly subscriptions (₹1,000-₹3,000/month).

## 🏗️ Architecture

### Tech Stack
- **Frontend:** React.js (Vite) + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Queue:** BullMQ with Redis
- **External API:** Meta WhatsApp Cloud API

### Project Structure
```
whatsapp-bulk-sender/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helper functions
│   │   └── server.js       # Entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/               # React Vite app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API calls
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utilities
│   │   └── App.jsx        # Main app
│   ├── package.json
│   └── .env.example
│
└── .agent/
    └── workflows/         # Development workflows
        └── project-roadmap.md
```

## ✨ Key Features

### 1. Contact Management
- Bulk CSV/Excel upload
- Auto-formatting of phone numbers
- Contact grouping and tagging
- Search and filter capabilities

### 2. Template Management
- Sync Meta-approved templates
- Support for dynamic variables
- Template preview

### 3. Bulk Messaging Engine
- Queue-based sending (1-2 seconds between messages)
- Rate limiting to comply with Meta's limits
- Automatic retry on failures
- Real-time progress tracking

### 4. Analytics Dashboard
- Live message status (Sent, Delivered, Read, Failed)
- Campaign statistics
- Detailed message logs
- Export capabilities

### 5. Manual Group Share
- Generate WhatsApp share links for group messaging
- Pre-filled message templates
- One-click copy to clipboard

## 🚀 Getting Started

### Prerequisites
1. **Meta Business Account**
   - Create a Facebook Business Manager account
   - Verify your business (GST/MSME documents)
   
2. **Dedicated Phone Number**
   - Get a new SIM card or virtual number
   - NOT currently registered on WhatsApp

3. **Development Tools**
   - Node.js (v18 or higher)
   - MongoDB (local or Atlas)
   - Redis (local or cloud)
   - Git

### Installation

1. **Clone or navigate to the project directory**
```bash
cd d:\Bulk
```

2. **Set up Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

3. **Set up Frontend**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with API URL
npm run dev
```

4. **Start Redis** (if running locally)
```bash
redis-server
```

```bash
sudo service redis-server start
```

### Environment Variables

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/whatsapp-bulk
REDIS_URL=redis://localhost:6379

# WhatsApp Cloud API
WHATSAPP_API_VERSION=v18.0
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_ACCESS_TOKEN=your_access_token

# Webhook
WEBHOOK_VERIFY_TOKEN=your_random_secure_token

NODE_ENV=development
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## 📊 Cost Analysis

**Monthly cost for 400 messages (4 updates × 100 clients):**

| Item | Cost |
|------|------|
| Server Hosting | ₹400-800 |
| Database (MongoDB Atlas) | ₹0 (Free tier) |
| Redis | ₹0 (Free tier initially) |
| WhatsApp Messages (400 × ₹0.88) | ₹352 |
| **Total** | **₹352-800/month** |

Compare to ₹2,500/month for third-party tools like Wati.

## 🔐 Security Best Practices

- Store all sensitive credentials in environment variables
- Never commit .env files to version control
- Use HTTPS in production
- Implement rate limiting on API endpoints
- Validate and sanitize all user inputs
- Regularly rotate access tokens

## 📝 Development Roadmap

See [.agent/workflows/project-roadmap.md](.agent/workflows/project-roadmap.md) for the complete development roadmap.

## 🐛 Troubleshooting

### Common Issues

**Messages not sending:**
- Verify WhatsApp access token is valid
- Check if phone number is verified in Meta dashboard
- Ensure template is approved

**Webhook not receiving updates:**
- Verify webhook URL is publicly accessible (use ngrok for local testing)
- Check webhook verify token matches
- Ensure callback URL is configured in Meta dashboard

**Rate limiting errors:**
- Adjust queue delay in BullMQ configuration
- Current setting: 1-2 seconds between messages

## 📚 Resources

- [WhatsApp Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Meta Business Manager](https://business.facebook.com/)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## 📄 License

Internal use only - Proprietary system

## 👥 Team

Development Team - Custom WhatsApp Bulk Sender Project

---

**Status:** 🚧 In Development

**Version:** 0.1.0 (MVP)
