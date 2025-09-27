// Welcome Newsletter Service for new users
const { formatWelcomeNewsletter, formatWelcomeBackNewsletter, sendNewsletterEmail } = require('../utils/newsletterUtils');

/**
 * Send welcome newsletter to a new user
 * @param {Object} user - User object with email and name
 * @returns {Promise<boolean>} Success status
 */
async function sendWelcomeNewsletter(user) {
  try {
    console.log(`📧 Sending welcome newsletter to new user: ${user.name} (${user.email})`);
    
    // Format welcome newsletter
    const htmlContent = formatWelcomeNewsletter(user.name);
    
    // Send email
    const success = await sendNewsletterEmail(user.email, htmlContent);
    
    if (success) {
      console.log(`✅ Welcome newsletter sent successfully to ${user.email}`);
    } else {
      console.log(`❌ Failed to send welcome newsletter to ${user.email}`);
    }
    
    return success;
  } catch (error) {
    console.error(`Error sending welcome newsletter to ${user.email}:`, error);
    return false;
  }
}

/**
 * Send welcome back newsletter to a returning user
 * @param {Object} user - User object with email and name
 * @returns {Promise<boolean>} Success status
 */
async function sendWelcomeBackNewsletter(user) {
  try {
    console.log(`📧 Sending welcome back newsletter to returning user: ${user.name} (${user.email})`);
    
    // Format welcome back newsletter
    const htmlContent = formatWelcomeBackNewsletter(user.name || 'User');
    
    // Send email
    const success = await sendNewsletterEmail(user.email, htmlContent);
    
    if (success) {
      console.log(`✅ Welcome back newsletter sent successfully to ${user.email}`);
    } else {
      console.log(`❌ Failed to send welcome back newsletter to ${user.email}`);
    }
    
    return success;
  } catch (error) {
    console.error(`Error sending welcome back newsletter to ${user.email}:`, error);
    return false;
  }
}

module.exports = {
  sendWelcomeNewsletter,
  sendWelcomeBackNewsletter
};