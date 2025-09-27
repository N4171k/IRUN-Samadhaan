// Newsletter Service for sending daily current affairs to CDS aspirants

// API Configuration
const API_CONFIG = {
  NEWS_API: {
    baseUrl: 'https://newsapi.org/v2',
    key: import.meta.env.VITE_NEWS_API_KEY || ''
  },
  GNEWS_API: {
    baseUrl: 'https://gnews.io/api/v4',
    key: import.meta.env.VITE_GNEWS_API_KEY || ''
  },
  CURRENTS_API: {
    baseUrl: 'https://api.currentsapi.services/v1',
    key: import.meta.env.VITE_CURRENTS_API_KEY || ''
  },
  MEDIASTACK_API: {
    baseUrl: 'http://api.mediastack.com/v1',
    key: import.meta.env.VITE_MEDIASTACK_API_KEY || ''
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
      const newsApiUrl = `${API_CONFIG.NEWS_API.baseUrl}/top-headlines?` +
        `category=military&pageSize=5&apiKey=${API_CONFIG.NEWS_API.key}`;
      
      const response = await fetch(newsApiUrl);
      if (response.ok) {
        const data = await response.json();
        allArticles.push(...(data.articles || []));
      }
    }
  } catch (error) {
    console.error('Error fetching from News API:', error);
  }
  
  try {
    // Try GNews API
    if (API_CONFIG.GNEWS_API.key) {
      const gnewsUrl = `${API_CONFIG.GNEWS_API.baseUrl}/top-headlines?` +
        `topic=military defense&max=5&apikey=${API_CONFIG.GNEWS_API.key}`;
      
      const response = await fetch(gnewsUrl);
      if (response.ok) {
        const data = await response.json();
        allArticles.push(...(data.articles || []));
      }
    }
  } catch (error) {
    console.error('Error fetching from GNews API:', error);
  }
  
  try {
    // Try Currents API
    if (API_CONFIG.CURRENTS_API.key) {
      const currentsUrl = `${API_CONFIG.CURRENTS_API.baseUrl}/latest-news?` +
        `category=military&limit=5&apiKey=${API_CONFIG.CURRENTS_API.key}`;
      
      const response = await fetch(currentsUrl);
      if (response.ok) {
        const data = await response.json();
        allArticles.push(...(data.news || []));
      }
    }
  } catch (error) {
    console.error('Error fetching from Currents API:', error);
  }
  
  try {
    // Try Mediastack API
    if (API_CONFIG.MEDIASTACK_API.key) {
      const mediastackUrl = `${API_CONFIG.MEDIASTACK_API.baseUrl}/news?` +
        `categories=military&limit=5&access_key=${API_CONFIG.MEDIASTACK_API.key}`;
      
      const response = await fetch(mediastackUrl);
      if (response.ok) {
        const data = await response.json();
        allArticles.push(...(data.data || []));
      }
    }
  } catch (error) {
    console.error('Error fetching from Mediastack API:', error);
  }
  
  // Filter and deduplicate articles
  const uniqueArticles = deduplicateArticles(allArticles);
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
 * Format news articles for email
 * @param {Array} articles - Array of news articles
 * @returns {string} Formatted HTML email content
 */
function formatNewsletter(articles) {
  if (!articles || articles.length === 0) {
    return '<p>No news available at the moment. Please check back later.</p>';
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
    console.log('📧 Email content:', htmlContent.substring(0, 200) + '...');
    
    // Placeholder for actual email sending implementation
    // This would be replaced with actual email service integration
    
    return true;
  } catch (error) {
    console.error('Failed to send newsletter email:', error);
    return false;
  }
}

/**
 * Generate and send newsletter to a user
 * @param {Object} user - User object with email and preferences
 * @returns {Promise<boolean>} Success status
 */
async function sendNewsletterToUser(user) {
  try {
    // Fetch relevant news
    const articles = await fetchNews();
    
    // Format newsletter
    const htmlContent = formatNewsletter(articles);
    
    // Send email
    const success = await sendNewsletterEmail(user.email, htmlContent);
    
    if (success) {
      console.log(`✅ Newsletter sent successfully to ${user.email}`);
    } else {
      console.log(`❌ Failed to send newsletter to ${user.email}`);
    }
    
    return success;
  } catch (error) {
    console.error(`Error sending newsletter to ${user.email}:`, error);
    return false;
  }
}

/**
 * Schedule newsletter sending
 * @param {Array} users - Array of users with newsletter preferences
 */
function scheduleNewsletters(users) {
  // This would be implemented with a cron job or task scheduler
  // For now, we'll just log the scheduled users
  
  console.log('📅 Scheduling newsletters for users:', users.length);
  users.forEach(user => {
    console.log(`- ${user.email} at ${user.newsletterTime || '08:00'}`);
  });
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Send welcome newsletter to a new user
 * @param {Object} user - User object with email and name
 * @returns {Promise<Object>} Response from the server
 */
async function sendWelcomeNewsletter(user) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/newsletter/welcome`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send welcome newsletter');
    }
    
    return data;
  } catch (error) {
    console.error('Error sending welcome newsletter:', error);
    throw error;
  }
}

/**
 * Send welcome back newsletter to a returning user
 * @param {Object} user - User object with email and name
 * @returns {Promise<Object>} Response from the server
 */
async function sendWelcomeBackNewsletter(user) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/newsletter/welcome-back`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send welcome back newsletter');
    }
    
    return data;
  } catch (error) {
    console.error('Error sending welcome back newsletter:', error);
    throw error;
  }
}

export {
  fetchNews,
  formatNewsletter,
  sendNewsletterEmail,
  sendNewsletterToUser,
  scheduleNewsletters,
  sendWelcomeNewsletter,
  sendWelcomeBackNewsletter
};