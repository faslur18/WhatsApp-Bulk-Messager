import crypto from 'crypto';

// Generate a secure random token for webhook verification
const token = crypto.randomBytes(32).toString('hex');

console.log('\n='.repeat(60));
console.log('🔐 Generated Webhook Verify Token');
console.log('='.repeat(60));
console.log('\nCopy this token and add it to your backend/.env file:');
console.log('\nWEBHOOK_VERIFY_TOKEN=' + token);
console.log('\nAlso use this same token when configuring webhooks in Meta.');
console.log('='.repeat(60) + '\n');
