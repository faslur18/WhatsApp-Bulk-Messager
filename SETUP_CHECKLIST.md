# WhatsApp Bulk Sender - Setup Checklist

## Pre-Development Setup ✅

### Meta Business Account Setup
- [ ] Create Meta Business Manager account at business.facebook.com
- [ ] Complete business verification (GST/MSME documents required)
- [ ] Create a new Meta App (Business type)
- [ ] Add WhatsApp product to the app

### WhatsApp API Configuration
- [ ] Get a dedicated phone number (not currently on WhatsApp)
- [ ] Add and verify phone number in WhatsApp API dashboard
- [ ] Note down **Phone Number ID**
- [ ] Note down **WhatsApp Business Account ID**
- [ ] Generate **Permanent Access Token** (not temporary 24hr token)

### Message Templates
- [ ] Create at least one message template in Meta Business Manager
- [ ] Submit template for approval (usually takes a few hours)
- [ ] Wait for approval before testing
- [ ] Example template name: `product_update` or `hello_world`

---

## Local Development Setup ✅

### Prerequisites
- [ ] Node.js v18+ installed (`node --version`)
- [ ] MongoDB installed and accessible
- [ ] Redis installed and accessible
- [ ] Git installed (optional)

### Backend Setup
- [ ] Navigate to `backend` directory
- [ ] Run `npm install` (already done ✅)
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in WhatsApp API credentials in `.env`:
  - [ ] WHATSAPP_PHONE_NUMBER_ID
  - [ ] WHATSAPP_BUSINESS_ACCOUNT_ID
  - [ ] WHATSAPP_ACCESS_TOKEN
- [ ] Generate webhook token: `node generate-token.js`
- [ ] Add generated token to `.env` as WEBHOOK_VERIFY_TOKEN
- [ ] Set MongoDB URI (local or Atlas)
- [ ] Set Redis URL (local or cloud)

### Frontend Setup
- [ ] Navigate to `frontend` directory
- [ ] Run `npm install --legacy-peer-deps` (already done ✅)
- [ ] Create `.env` with `VITE_API_URL=http://localhost:5000`

---

## Testing Setup ✅

### Start Services
- [ ] Start MongoDB (`mongod` or use Atlas)
- [ ] Start Redis (`redis-server` or use Redis Cloud)
- [ ] Start backend: `cd backend && npm run dev`
- [ ] Start frontend: `cd frontend && npm run dev`
- [ ] Access dashboard at `http://localhost:5173`

### Upload Test Contacts
- [ ] Go to Contacts page
- [ ] Upload `sample-contacts.csv`
- [ ] Verify contacts appear in table
- [ ] Add tags to contacts (optional)

### Create Test Campaign
- [ ] Go to Campaigns page
- [ ] Click "Create Campaign"
- [ ] Select approved template
- [ ] Fill in campaign details
- [ ] Click "Create & Send"
- [ ] Monitor progress in Dashboard

### Verify Message Delivery
- [ ] Check Dashboard for real-time stats
- [ ] Go to Analytics to see message logs
- [ ] Verify messages appear as "sent"
- [ ] Check actual phone to confirm message received

---

## Production Deployment Setup ✅

### Server Setup
- [ ] Choose hosting provider (AWS, DigitalOcean, Heroku, etc.)
- [ ] Deploy backend to server
- [ ] Deploy frontend to Vercel/Netlify or same server
- [ ] Set up MongoDB Atlas (production database)
- [ ] Set up Redis Cloud or Upstash (production queue)
- [ ] Configure production environment variables
- [ ] Set up SSL certificate (HTTPS required for webhooks)

### Webhook Configuration
- [ ] Get production server URL (must be HTTPS)
- [ ] Go to Meta App → WhatsApp → Configuration
- [ ] Set Callback URL: `https://your-domain.com/api/whatsapp/webhook`
- [ ] Set Verify Token (same as WEBHOOK_VERIFY_TOKEN in .env)
- [ ] Click "Verify and Save"
- [ ] Subscribe to webhooks: `messages`, `message_template_status_update`

### Security
- [ ] Enable firewall on server
- [ ] Restrict database access to server IP only
- [ ] Use strong passwords for database
- [ ] Never commit .env files to version control
- [ ] Rotate access tokens periodically
- [ ] Set up monitoring and logging

---

## Optimization & Scaling ✅

### Rate Limits
- [ ] Understand initial limits (~50 messages/day)
- [ ] Request higher limits from Meta (provide business use case)
- [ ] Monitor queue to prevent hitting limits
- [ ] Adjust `messageDelay` in queue config if needed

### Cost Optimization
- [ ] Track monthly message count
- [ ] Current cost: ~₹0.88 per marketing message
- [ ] Compare to third-party tool costs (~₹2,500/month)
- [ ] Use Analytics to optimize campaign timing

### Performance
- [ ] Monitor database size and add indexes if needed
- [ ] Clean up old message logs periodically
- [ ] Monitor Redis memory usage
- [ ] Scale server resources based on usage

---

## Optional Enhancements ✅

### Green Tick Verification
- [ ] Apply for Official Business Account (green tick)
- [ ] Requires established business and high quality score
- [ ] Increases customer trust
- [ ] Harder to get but worth pursuing

### Additional Features
- [ ] Add user authentication (currently no auth)
- [ ] Implement role-based access control
- [ ] Add scheduled campaigns
- [ ] Export analytics to Excel/PDF
- [ ] Add contact import from other sources
- [ ] Integrate with CRM systems

### Monitoring
- [ ] Set up error tracking (Sentry, Bugsnag)
- [ ] Set up uptime monitoring
- [ ] Set up performance monitoring
- [ ] Configure alerts for failed messages

---

## Troubleshooting Guide 🔧

### Common Issues

**"Connection refused" error:**
- ✅ MongoDB not running → Start MongoDB
- ✅ Redis not running → Start Redis
- ✅ Wrong PORT → Check .env PORT setting

**"Invalid access token" error:**
- ✅ Token expired → Generate new permanent token
- ✅ Token wrong → Verify token in Meta dashboard

**Messages stuck in "queued" status:**
- ✅ Worker not started → Check backend logs
- ✅ Redis issue → Verify Redis connection
- ✅ Rate limit hit → Check queue stats

**Template not found:**
- ✅ Template not approved → Wait for approval
- ✅ Wrong template name → Check exact name in Meta
- ✅ Wrong language code → Verify language (en, hi, etc.)

**Webhook not receiving updates:**
- ✅ URL not accessible → Use ngrok for local testing
- ✅ Verify token mismatch → Check token matches .env
- ✅ Not subscribed to webhooks → Subscribe in Meta dashboard

---

## Resources 📚

- [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Meta Business Manager](https://business.facebook.com/)
- [Message Template Guidelines](https://developers.facebook.com/docs/whatsapp/message-templates/guidelines)
- [Webhook Setup Guide](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)
- [Rate Limits](https://developers.facebook.com/docs/whatsapp/cloud-api/overview#throughput)

---

## Contact & Support 💬

For issues with:
- **WhatsApp API:** Meta Business Support
- **This Application:** Check QUICKSTART.md and README.md
- **Deployment:** Consult your hosting provider docs

---

**✅ Once all items are checked, you're ready to go live!**

**Good luck with your WhatsApp bulk messaging system! 🎉**
