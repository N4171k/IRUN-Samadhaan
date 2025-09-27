// Newsletter Utilities for Server-side Operations
const fetch = require('node-fetch');

// API Configuration from environment variables
const API_CONFIG = {
  NEWS_API: {
    baseUrl: 'https://newsapi.org/v2',
    key: process.env.NEWS_API_KEY || ''
  },
  GNEWS_API: {
    baseUrl: 'https://gnews.io/api/v4',
    key: process.env.GNEWS_API_KEY || ''
  },
  CURRENTS_API: {
    baseUrl: 'https://api.currentsapi.services/v1',
    key: process.env.CURRENTS_API_KEY || ''
  },
  MEDIASTACK_API: {
    baseUrl: 'http://api.mediastack.com/v1',
    key: process.env.MEDIASTACK_API_KEY || ''
  }
};

// Relevant categories for CDS aspirants
const RELEVANT_CATEGORIES = [
  'military',
  'defense',
  'politics',
  'world',
  'technology',
  'science',
  'business'
];

// Relevant sources for Indian defense context
const RELEVANT_SOURCES = [
  'the-hindu',
  'hindustan-times',
  'indian-express',
  'times-of-india',
  'ndtv',
  'reuters',
  'bbc-news',
  'al-jazeera-english'
];

/**
 * Fetch news from multiple APIs
 * @returns {Promise<Array>} Array of news articles
 */
async function fetchNews() {
  const allArticles = [];
  
  try {
    // Try News API first
    if (API_CONFIG.NEWS_API.key) {
      console.log('🔍 Fetching from News API...');
      const newsApiUrl = `${API_CONFIG.NEWS_API.baseUrl}/top-headlines?` +
        `category=military&language=en&pageSize=5&apiKey=${API_CONFIG.NEWS_API.key}`;
      
      const response = await fetch(newsApiUrl, { timeout: 10000 }); // 10 second timeout
      if (response.ok) {
        const data = await response.json();
        const articles = data.articles || [];
        console.log(`✅ Fetched ${articles.length} articles from News API`);
        allArticles.push(...articles);
      } else {
        console.error(`❌ News API returned status ${response.status}: ${response.statusText}`);
      }
    }
  } catch (error) {
    console.error('Error fetching from News API:', error.message || error);
  }
  
  try {
    // Try GNews API
    if (API_CONFIG.GNEWS_API.key) {
      console.log('🔍 Fetching from GNews API...');
      const gnewsUrl = `${API_CONFIG.GNEWS_API.baseUrl}/top-headlines?` +
        `topic=military defense&lang=en&max=5&apikey=${API_CONFIG.GNEWS_API.key}`;
      
      const response = await fetch(gnewsUrl, { timeout: 10000 }); // 10 second timeout
      if (response.ok) {
        const data = await response.json();
        const articles = data.articles || [];
        console.log(`✅ Fetched ${articles.length} articles from GNews API`);
        allArticles.push(...articles);
      } else {
        console.error(`❌ GNews API returned status ${response.status}: ${response.statusText}`);
      }
    }
  } catch (error) {
    console.error('Error fetching from GNews API:', error.message || error);
  }
  
  try {
    // Try Currents API
    if (API_CONFIG.CURRENTS_API.key) {
      console.log('🔍 Fetching from Currents API...');
      const currentsUrl = `${API_CONFIG.CURRENTS_API.baseUrl}/latest-news?` +
        `category=military&language=en&limit=5&apiKey=${API_CONFIG.CURRENTS_API.key}`;
      
      const response = await fetch(currentsUrl, { timeout: 10000 }); // 10 second timeout
      if (response.ok) {
        const data = await response.json();
        const news = data.news || [];
        console.log(`✅ Fetched ${news.length} articles from Currents API`);
        allArticles.push(...news);
      } else {
        console.error(`❌ Currents API returned status ${response.status}: ${response.statusText}`);
      }
    }
  } catch (error) {
    console.error('Error fetching from Currents API:', error.message || error);
  }
  
  try {
    // Try Mediastack API
    if (API_CONFIG.MEDIASTACK_API.key) {
      console.log('🔍 Fetching from Mediastack API...');
      const mediastackUrl = `${API_CONFIG.MEDIASTACK_API.baseUrl}/news?` +
        `categories=military&languages=en&limit=5&access_key=${API_CONFIG.MEDIASTACK_API.key}`;
      
      const response = await fetch(mediastackUrl, { timeout: 10000 }); // 10 second timeout
      if (response.ok) {
        const data = await response.json();
        const articles = data.data || [];
        console.log(`✅ Fetched ${articles.length} articles from Mediastack API`);
        allArticles.push(...articles);
      } else {
        console.error(`❌ Mediastack API returned status ${response.status}: ${response.statusText}`);
      }
    }
  } catch (error) {
    console.error('Error fetching from Mediastack API:', error.message || error);
  }
  
  console.log(`📊 Total articles fetched: ${allArticles.length}`);
  
  // Filter for English articles only
  const englishArticles = allArticles.filter(article => {
    // Check if article has language info and is English
    if (article.language) {
      return article.language === 'en' || article.language === 'english';
    }
    // Check if article has source info with English language
    if (article.source && article.source.language) {
      return article.source.language === 'en' || article.source.language === 'english';
    }
    // Check title and description for English words
    const title = (article.title || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    const content = title + ' ' + description;
    
    // Simple heuristic: if it contains English words, assume it's English
    const commonEnglishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from'];
    return commonEnglishWords.some(word => content.includes(word));
  });
  
  console.log(`📊 English articles after language filter: ${englishArticles.length}`);
  
  // Filter and deduplicate articles
  const uniqueArticles = deduplicateArticles(englishArticles);
  console.log(`📊 Unique articles after deduplication: ${uniqueArticles.length}`);
  return uniqueArticles.slice(0, 15); // Return top 15 articles
}

/**
 * Deduplicate articles based on title similarity
 * @param {Array} articles - Array of article objects
 * @returns {Array} Deduplicated articles
 */
function deduplicateArticles(articles) {
  const seenTitles = new Set();
  const uniqueArticles = [];
  
  for (const article of articles) {
    const title = article.title?.toLowerCase() || '';
    // Simple deduplication by checking if title contains similar words
    let isDuplicate = false;
    
    for (const seenTitle of seenTitles) {
      // Check if titles are very similar (simple approach)
      if (title.includes(seenTitle) || seenTitle.includes(title)) {
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      seenTitles.add(title);
      uniqueArticles.push(article);
    }
  }
  
  return uniqueArticles;
}

/**
 * Format welcome back newsletter for returning users
 * @param {string} userName - Name of the returning user
 * @returns {string} Formatted HTML email content
 */
function formatWelcomeBackNewsletter(userName) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2c3e50; text-align: center;">🎯 Welcome Back to IRUN, ${userName}!</h1>
      <p style="color: #7f8c8d; text-align: center; font-size: 18px;">Great to see you continuing your defense career journey</p>
      
      <div style="margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; color: white; text-align: center;">
        <h2 style="margin-top: 0; font-size: 24px;">🎖️ Your Daily Briefing Awaits</h2>
        <p style="font-size: 16px; margin-bottom: 0;">Continue your preparation with today's current affairs and study insights</p>
      </div>
      
      <div style="margin: 25px 0;">
        <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Today's Highlights</h3>
        <ul style="padding-left: 20px;">
          <li style="margin: 15px 0;">
            <strong>Current Affairs</strong> - Latest military and defense news
          </li>
          <li style="margin: 15px 0;">
            <strong>Study Tips</strong> - Personalized preparation strategies
          </li>
          <li style="margin: 15px 0;">
            <strong>Progress Update</strong> - Your latest performance insights
          </li>
          <li style="margin: 15px 0;">
            <strong>New Resources</strong> - Recently added study materials
          </li>
        </ul>
      </div>
      
      <div style="margin: 25px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #3498db;">
        <h3 style="color: #2c3e50; margin-top: 0;">📚 Continue Your Journey</h3>
        <p>Check your dashboard for today's recommended activities and continue making progress toward your SSB goals.</p>
      </div>
      
      <div style="margin: 30px 0; text-align: center;">
        <p style="font-size: 16px; color: #7f8c8d;">Best of luck with your continued preparation!</p>
        <p style="font-size: 18px; font-weight: bold; color: #2c3e50;">The IRUN Team 🎖️</p>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #7f8c8d; font-size: 14px;">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>IRUN - Your Intelligent Companion for SSB Preparation</p>
      </div>
    </div>
  `;
}

/**
 * Format welcome newsletter for new users
 * @param {string} userName - Name of the new user
 * @returns {string} Formatted HTML email content
 */
function formatWelcomeNewsletter(userName) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2c3e50; text-align: center;">🎯 Welcome to IRUN, ${userName}!</h1>
      <p style="color: #7f8c8d; text-align: center; font-size: 18px;">Your journey towards a successful defense career starts here</p>
      
      <div style="margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; color: white; text-align: center;">
        <h2 style="margin-top: 0; font-size: 24px;">🎖️ Daily Current Affairs Newsletter</h2>
        <p style="font-size: 16px; margin-bottom: 0;">You've successfully subscribed to our daily current affairs newsletter for CDS aspirants!</p>
      </div>
      
      <div style="margin: 25px 0;">
        <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">What to Expect</h3>
        <ul style="padding-left: 20px;">
          <li style="margin: 15px 0;">
            <strong>Military News</strong> - Latest updates from the armed forces
          </li>
          <li style="margin: 15px 0;">
            <strong>Defense Technology</strong> - Cutting-edge military innovations
          </li>
          <li style="margin: 15px 0;">
            <strong>Geopolitical Updates</strong> - Important international developments
          </li>
          <li style="margin: 15px 0;">
            <strong>Study Resources</strong> - Curated content for your preparation
          </li>
        </ul>
      </div>
      
      <div style="margin: 25px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #3498db;">
        <h3 style="color: #2c3e50; margin-top: 0;">⏰ Delivery Schedule</h3>
        <p>Your newsletter will be delivered daily at your preferred time. You can update your preferences anytime in your account settings.</p>
      </div>
      
      <div style="margin: 30px 0; text-align: center;">
        <p style="font-size: 16px; color: #7f8c8d;">Best of luck with your CDS preparation!</p>
        <p style="font-size: 18px; font-weight: bold; color: #2c3e50;">The IRUN Team 🎖️</p>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #7f8c8d; font-size: 14px;">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>IRUN - Your Intelligent Companion for SSB Preparation</p>
      </div>
    </div>
  `;
}

/**
 * Format news articles for email
 * @param {Array} articles - Array of news articles
 * @returns {string} Formatted HTML email content
 */
function formatNewsletter(articles) {
  if (!articles || articles.length === 0) {
    return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2c3e50; text-align: center;">🎯 Daily Current Affairs for CDS Aspirants</h1>
      <p style="color: #7f8c8d; text-align: center;">Your daily dose of military news and defense insights</p>
      
      <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
        <h2 style="color: #e74c3c; text-align: center;">📰 No New Articles Today</h2>
        <p style="color: #34495e; text-align: center;">
          We couldn't fetch new articles at this moment, but we're working on it!<br>
          Please check back later or try refreshing the page.
        </p>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #7f8c8d; font-size: 14px;">
        <p>This newsletter is sent daily to help you stay updated with relevant current affairs for CDS preparation.</p>
        <p>Best of luck with your preparation! 🎖️</p>
        <p><a href="https://www.irun.co.in" style="color: #3498db; text-decoration: none;">Visit our website: www.irun.co.in</a></p>
      </div>
    </div>`;
  }
  
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2c3e50; text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
        🎯 Daily Current Affairs for CDS Aspirants
      </h1>
      <p style="color: #7f8c8d; text-align: center; font-size: 16px;">
        Your daily dose of military news, defense technology, and geopolitical insights
      </p>
  `;
  
  // Categorize articles
  const categorizedArticles = categorizeArticles(articles);
  
  // Add categorized sections
  for (const [category, categoryArticles] of Object.entries(categorizedArticles)) {
    if (categoryArticles.length > 0) {
      html += `
        <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #3498db; background-color: #f8f9fa;">
          <h2 style="color: #2980b9; margin-top: 0;">${getCategoryEmoji(category)} ${formatCategoryName(category)}</h2>
      `;
      
      categoryArticles.forEach((article, index) => {
        html += `
          <div style="margin: 15px 0; padding: 10px; border-bottom: 1px solid #eee;">
            <h3 style="margin: 0 0 5px 0; color: #34495e;">
              <a href="${article.url}" style="text-decoration: none; color: #2c3e50;">${article.title || 'Untitled Article'}</a>
            </h3>
            <p style="margin: 5px 0; color: #7f8c8d; font-size: 14px;">
              ${article.description ? article.description.substring(0, 200) + '...' : 'No description available'}
            </p>
            <p style="margin: 5px 0; font-size: 12px; color: #95a5a6;">
              Source: ${article.source?.name || article.source || 'Unknown'} | 
              Published: ${formatDate(article.publishedAt || article.date)}
            </p>
          </div>
        `;
      });
      
      html += `</div>`;
    }
  }
  
  html += `
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #7f8c8d; font-size: 14px;">
        <p>This newsletter is sent daily to help you stay updated with relevant current affairs for CDS preparation.</p>
        <p>Best of luck with your preparation! 🎖️</p>
        <p><a href="https://www.irun.co.in" style="color: #3498db; text-decoration: none;">Visit our website: www.irun.co.in</a></p>
      </div>
    </div>
  `;
  
  return html;
}

/**
 * Categorize articles based on content
 * @param {Array} articles - Array of articles
 * @returns {Object} Categorized articles
 */
function categorizeArticles(articles) {
  const categories = {
    military: [],
    defense: [],
    geopolitics: [],
    technology: [],
    general: []
  };
  
  articles.forEach(article => {
    const title = (article.title || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    const content = title + ' ' + description;
    
    if (content.includes('military') || content.includes('army') || content.includes('navy') || content.includes('air force')) {
      categories.military.push(article);
    } else if (content.includes('defense') || content.includes('defence') || content.includes('weapon') || content.includes('missile')) {
      categories.defense.push(article);
    } else if (content.includes('india') || content.includes('china') || content.includes('pakistan') || content.includes('russia') || content.includes('usa') || content.includes('geopolitic')) {
      categories.geopolitics.push(article);
    } else if (content.includes('technology') || content.includes('tech') || content.includes('satellite') || content.includes('drone') || content.includes('artificial intelligence')) {
      categories.technology.push(article);
    } else {
      categories.general.push(article);
    }
  });
  
  return categories;
}

/**
 * Get emoji for category
 * @param {string} category - Category name
 * @returns {string} Emoji
 */
function getCategoryEmoji(category) {
  const emojis = {
    military: '🎖️',
    defense: '🛡️',
    geopolitics: '🌎',
    technology: '💻',
    general: '📰'
  };
  
  return emojis[category] || '📰';
}

/**
 * Format category name
 * @param {string} category - Category name
 * @returns {string} Formatted name
 */
function formatCategoryName(category) {
  const names = {
    military: 'Military News',
    defense: 'Defense Technology',
    geopolitics: 'Geopolitical Updates',
    technology: 'Military Tech',
    general: 'General Current Affairs'
  };
  
  return names[category] || category;
}

/**
 * Format date for display
 * @param {string} dateStr - Date string
 * @returns {string} Formatted date
 */
function formatDate(dateStr) {
  if (!dateStr) return 'Unknown date';
  
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Unknown date';
  }
}

/**
 * Send newsletter email
 * @param {string} toEmail - Recipient email
 * @param {string} htmlContent - HTML content of the email
 * @returns {Promise<boolean>} Success status
 */
async function sendNewsletterEmail(toEmail, htmlContent) {
  // In a real implementation, you would integrate with an email service like:
  // - Nodemailer with SMTP
  // - SendGrid
  // - AWS SES
  // - Firebase Email Extensions
  
  try {
    // For now, we'll log the email content
    console.log('📧 Sending newsletter to:', toEmail);
    // console.log('📧 Email content:', htmlContent.substring(0, 200) + '...');
    
    // Nodemailer implementation
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER || 'utakarsh.agent001013@gmail.com',
        pass: process.env.EMAIL_PASS || 'wuji qlxp nlcq vskm',
      },
    });
    
    const info = await transporter.sendMail({
      from: '"IRUN Current Affairs" <utakarsh.agent001013@gmail.com>',
      to: toEmail,
      subject: '🎯 Daily Current Affairs for CDS Aspirants',
      html: htmlContent,
    });
    
    console.log('📧 Newsletter sent: %s', info.messageId);
    
    return true;
  } catch (error) {
    console.error('Failed to send newsletter email:', error);
    
    // Specific error handling for Gmail authentication issues
    if (error.code === 'EAUTH') {
      console.error(' Gmail authentication failed. Please ensure you have set up an App Password.');
      console.error(' Visit https://myaccount.google.com/apppasswords to generate an App Password');
      console.error(' Then update the EMAIL_PASS in your server/.env file');
    }
    
    return false;
  }
}

module.exports = {
  fetchNews,
  formatNewsletter,
  formatWelcomeBackNewsletter,
  formatWelcomeNewsletter,
  sendNewsletterEmail
};