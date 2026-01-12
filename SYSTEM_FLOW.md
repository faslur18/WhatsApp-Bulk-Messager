# WhatsApp Bulk Sender - System Flow

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                    (React + Tailwind CSS)                        │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐      │
│  │Dashboard │ Contacts │ Campaigns│ Templates│ Analytics│      │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘      │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST API
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXPRESS.JS SERVER                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API Routes                                               │  │
│  │  • /api/contacts    • /api/campaigns                      │  │
│  │  • /api/whatsapp    • /api/analytics                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                    │
│  ┌──────────────────────────┼──────────────────────────────┐   │
│  │  Controllers             │                               │   │
│  │  • Contact CRUD          │   Services                    │   │
│  │  • Campaign Mgmt    ─────┼──▶ • WhatsApp API Client     │   │
│  │  • Analytics             │   • Queue Manager             │   │
│  └──────────────────────────┴───────────────────────────────┘   │
└────────────────┬───────────────────────┬────────────────────────┘
                 │                       │
                 ▼                       ▼
       ┌─────────────────┐    ┌──────────────────┐
       │    MongoDB      │    │  Redis + BullMQ  │
       │                 │    │                  │
       │ • Contacts      │    │ • Message Queue  │
       │ • Campaigns     │    │ • Job Processing │
       │ • Message Logs  │    │ • Rate Limiting  │
       └─────────────────┘    └──────────────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │  Queue Worker   │
                              │  Processes jobs │
                              │  @ 1-2 sec/msg  │
                              └────────┬────────┘
                                       │
                                       ▼
                           ┌───────────────────────┐
                           │  WhatsApp Cloud API   │
                           │  (Meta / Facebook)    │
                           └───────────┬───────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │  Customer Phone │
                              │   📱 WhatsApp    │
                              └─────────────────┘
                                       │
                              Delivery Status Updates
                                       │
                                       ▼
                           ┌───────────────────────┐
                           │  Webhook Endpoint     │
                           │  /api/whatsapp/webhook│
                           └───────────────────────┘
```

---

## 🔄 Message Sending Flow

### Step-by-Step Process

```
1. USER ACTION
   └─▶ Admin uploads contacts (CSV/Excel)
       └─▶ Contacts stored in MongoDB with sanitized phone numbers

2. CAMPAIGN CREATION
   └─▶ Admin creates campaign
       ├─▶ Selects approved WhatsApp template
       ├─▶ Chooses target contacts (by tags or all)
       └─▶ Submits campaign

3. MESSAGE QUEUE
   └─▶ System creates MessageLog for each contact
       └─▶ Each message added to BullMQ queue
           └─▶ Jobs delayed by 2 seconds each (rate limiting)

4. QUEUE PROCESSING
   └─▶ Worker picks up job from queue
       └─▶ Calls WhatsApp Cloud API
           ├─▶ SUCCESS: Update log to "sent" status
           └─▶ FAILURE: Retry up to 3 times

5. WHATSAPP DELIVERY
   └─▶ Meta sends message to customer
       └─▶ Customer receives message on WhatsApp

6. STATUS UPDATES (via Webhooks)
   └─▶ Meta sends status to webhook endpoint
       ├─▶ "sent" → Message left WhatsApp server
       ├─▶ "delivered" → Message reached customer phone
       ├─▶ "read" → Customer opened the message
       └─▶ "failed" → Message could not be delivered

7. REAL-TIME DASHBOARD
   └─▶ User sees updated statistics
       ├─▶ Campaign progress
       ├─▶ Delivery rates
       └─▶ Failed messages with error details
```

---

## 📱 Contact Upload Flow

```
CSV/Excel File
     │
     ▼
┌────────────────┐
│  File Parser   │ ──▶ Validates: Name, Phone
│  (multer)      │
└───────┬────────┘
        │
        ▼
┌────────────────────┐
│ Phone Sanitization │ ──▶ Adds +91, removes spaces
│  Contact.sanitize  │
└────────┬───────────┘
         │
         ▼
┌─────────────────────┐
│ Duplicate Check     │ ──▶ Skips existing numbers
│  MongoDB query      │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────┐
│   Bulk Insert        │ ──▶ Save all new contacts
│   Contact.insertMany │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Return Summary      │
│  • Inserted count    │
│  • Duplicate count   │
│  • Error count       │
└──────────────────────┘
```

---

## 🎯 Template & Group Sharing Flow

### For Individual Messages (1-to-1)
```
Template (approved by Meta)
     │
     ▼
Campaign Creation
     │
     ▼
Queue Processing → WhatsApp API → Customer Phone
```

### For Group Messages (Manual)
```
Template
     │
     ▼
Generate Share Link
     │
     ▼
"https://wa.me/?text=Your+Message+Here"
     │
     ▼
User clicks link → Opens WhatsApp on phone
     │
     ▼
User manually forwards to Groups
```

**Why manual?** WhatsApp API does not support automated group messaging.

---

## 🔍 Analytics & Monitoring Flow

```
┌─────────────────┐
│  MessageLog DB  │ ──▶ Stores all message statuses
└────────┬────────┘
         │
         ├──▶ Aggregate by Status
         │    └─▶ Queued, Sent, Delivered, Read, Failed
         │
         ├──▶ Calculate Metrics
         │    ├─▶ Delivery Rate = (Delivered / Total) × 100
         │    ├─▶ Read Rate = (Read / Delivered) × 100
         │    └─▶ Failure Rate = (Failed / Total) × 100
         │
         └──▶ Display in Dashboard
              ├─▶ Real-time stats (refreshes every 30s)
              ├─▶ Campaign breakdown
              ├─▶ Queue status
              └─▶ Detailed message logs
```

---

## 🔐 Webhook Security Flow

```
Meta sends webhook →
     │
     ▼
GET /api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=XXX
     │
     ▼
Verify token matches WEBHOOK_VERIFY_TOKEN
     │
     ├─▶ MATCH: Return hub.challenge (200 OK)
     │           → Webhook verified ✅
     │
     └─▶ NO MATCH: Return 403 Forbidden
                   → Webhook rejected ❌

After verification, Meta sends status updates:

POST /api/whatsapp/webhook
     │
     ▼
Parse webhook payload
     │
     ├─▶ Extract message ID & status
     │
     ├─▶ Find MessageLog by messageId
     │
     ├─▶ Update status (sent → delivered → read)
     │
     └─▶ Update Campaign stats
         └─▶ Dashboard reflects changes in real-time
```

---

## 💾 Data Models

### Contact Schema
```
{
  _id: ObjectId,
  name: String,
  phoneNumber: String (unique, sanitized),
  tags: [String],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Campaign Schema
```
{
  _id: ObjectId,
  name: String,
  description: String,
  templateName: String,
  templateLanguage: String,
  targetTags: [String],
  totalContacts: Number,
  status: Enum (draft, in_progress, completed, failed),
  stats: {
    queued: Number,
    sent: Number,
    delivered: Number,
    read: Number,
    failed: Number
  },
  createdAt: Date,
  startedAt: Date,
  completedAt: Date
}
```

### MessageLog Schema
```
{
  _id: ObjectId,
  campaignId: String,
  contactId: ObjectId (ref: Contact),
  phoneNumber: String,
  templateName: String,
  variables: [String],
  messageId: String (from WhatsApp),
  status: Enum (queued, sending, sent, delivered, read, failed),
  errorCode: String,
  errorMessage: String,
  sentAt: Date,
  deliveredAt: Date,
  readAt: Date,
  failedAt: Date,
  createdAt: Date
}
```

---

## 🚀 Queue Processing Details

### BullMQ Configuration
```javascript
{
  limiter: {
    max: 30,           // Max 30 jobs
    duration: 60000    // Per 60 seconds (1 minute)
  },
  concurrency: 1,      // Process one at a time
  attempts: 3,         // Retry failed jobs 3 times
  backoff: {
    type: 'exponential',
    delay: 5000        // Start with 5s delay, doubles each retry
  }
}
```

### Job Lifecycle
```
Job Added → Waiting → Delayed (2s) → Active → Processing
                                        │
                    ┌───────────────────┴───────────────────┐
                    │                                       │
                SUCCESS                                 FAILURE
                    │                                       │
                    ▼                                       ▼
              Completed                              Retry (1/3)
           (remove after 24h)                            │
                                                          ▼
                                                    Retry (2/3)
                                                          │
                                                          ▼
                                                    Retry (3/3)
                                                          │
                                                          ▼
                                                    Failed
                                                (kept for analysis)
```

---

## 📊 Dashboard Real-Time Updates

```
User Opens Dashboard
     │
     ▼
Fetch /api/analytics/summary
     │
     ├─▶ Total contacts (MongoDB count)
     ├─▶ Total campaigns (MongoDB count)
     ├─▶ Message status breakdown (MessageLog aggregation)
     └─▶ Queue stats (BullMQ API)
     │
     ▼
Display on Dashboard
     │
     ▼
Auto-refresh every 30 seconds
     └─▶ Loop back to fetch
```

---

## 🎨 Frontend Component Hierarchy

```
App.jsx
  │
  ├─▶ Layout.jsx
  │    ├─▶ Sidebar (navigation)
  │    └─▶ Outlet (page content)
  │         │
  │         ├─▶ Dashboard.jsx
  │         │    └─▶ Stats Cards, Quick Actions
  │         │
  │         ├─▶ Contacts.jsx
  │         │    ├─▶ ContactTable
  │         │    ├─▶ UploadModal
  │         │    └─▶ TagModal
  │         │
  │         ├─▶ Campaigns.jsx
  │         │    ├─▶ CampaignList
  │         │    └─▶ CreateCampaignModal
  │         │
  │         ├─▶ Templates.jsx
  │         │    ├─▶ TemplateGrid
  │         │    └─▶ ShareLinkModal
  │         │
  │         └─▶ Analytics.jsx
  │              ├─▶ FilterBar
  │              └─▶ MessageLogsTable
  │
  └─▶ ToastContainer (notifications)
```

---

## 🔄 API Endpoints Reference

### Contacts
```
GET    /api/contacts              - List contacts (pagination, search)
GET    /api/contacts/:id          - Get single contact
POST   /api/contacts              - Create contact
PUT    /api/contacts/:id          - Update contact
DELETE /api/contacts/:id          - Delete contact (soft)
POST   /api/contacts/upload       - Upload CSV/Excel
POST   /api/contacts/tag          - Tag multiple contacts
GET    /api/contacts/tags         - Get all unique tags
```

### Campaigns
```
GET    /api/campaigns             - List campaigns
GET    /api/campaigns/:id         - Get campaign details
POST   /api/campaigns             - Create & start campaign
GET    /api/campaigns/:id/analytics - Get campaign analytics
```

### WhatsApp
```
GET    /api/whatsapp/templates    - Fetch approved templates
POST   /api/whatsapp/share-link   - Generate share link
GET    /api/whatsapp/webhook      - Webhook verification
POST   /api/whatsapp/webhook      - Receive status updates
```

### Analytics
```
GET    /api/analytics/summary     - Overall statistics
GET    /api/analytics/logs        - Message logs (filtered)
GET    /api/analytics/queue       - Queue status
```

---

## ⚡ Performance Optimizations

### Database Indexes
```javascript
// Contacts
{ phoneNumber: 1 }    // Unique, fast lookup
{ tags: 1 }           // Filter by tags
{ isActive: 1 }       // Active contacts

// MessageLog
{ campaignId: 1, status: 1 }  // Campaign breakdown
{ messageId: 1 }               // Webhook updates
{ createdAt: -1 }              // Recent logs

// Campaign
{ status: 1 }                  // Active campaigns
{ createdAt: -1 }              // Recent campaigns
```

### Caching Strategy
```
- Template list: Cache for 1 hour (rarely changes)
- Dashboard stats: Refresh every 30 seconds
- Contact tags: Fetch on page load, cache in state
- Queue stats: Poll every 5 seconds when viewing
```

### Rate Limiting
```
- API endpoints: 100 requests per 15 minutes per IP
- Message sending: 30 messages per minute (Meta limit)
- File uploads: 5MB max file size
```

---

**This flow diagram explains how all components work together!** 🎯
