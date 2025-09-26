const { GoogleGenerativeAI } = require('@google/generative-ai');
const fetch = require('node-fetch');

class TATService {
  constructor() {
    try {
      console.log('Initializing TAT Service...');
      
      // Check if we have API keys available
      this.apiKeys = global.GEMINI_API_KEYS || [];
      
      // If no numbered keys are available, check for the legacy GOOGLE_API_KEY
      if (this.apiKeys.length === 0 && process.env.GOOGLE_API_KEY && 
          process.env.GOOGLE_API_KEY !== 'your_google_gemini_api_key_here') {
        console.log('Using legacy GOOGLE_API_KEY as fallback');
        this.apiKeys = [process.env.GOOGLE_API_KEY];
      }
      
      // Log API key status
      console.log(`Found ${this.apiKeys.length} usable API keys`);
      
      if (this.apiKeys.length === 0) {
        console.warn('No Google API Keys available');
        this.genAI = null;
        this.model = null;
        this.visionModel = null;
        return;
      }
      
      // For initial setup, use the first key
      const initialKey = this.apiKeys[0];
      console.log('Google API Key present:', !!initialKey);
      console.log('Google API Key starts with:', initialKey.substring(0, 10) + '...');
      
      // Initialize with the first key just to verify setup
      this.genAI = new GoogleGenerativeAI(initialKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      this.visionModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      console.log('TAT Service initialized successfully');
    } catch (error) {
      console.error('Error initializing TAT Service:', error.message);
      this.genAI = null;
      this.model = null;
      this.visionModel = null;
    }
  }
  
  /**
   * Get a random API key from the available keys
   * @returns {string} A random API key
   */
  getRandomApiKey() {
    if (!this.apiKeys || this.apiKeys.length === 0) {
      console.warn('No API keys available');
      return null;
    }
    
    // Select a random key
    const randomIndex = Math.floor(Math.random() * this.apiKeys.length);
    const key = this.apiKeys[randomIndex];
    console.log(`Using API key #${randomIndex + 1} starting with: ${key.substring(0, 10)}...`);
    return key;
  }

  /**
   * Generate a TAT topic using Google Gemini API
   * @returns {Promise<Object>} Generated TAT topic with scenario and description
   */
  async generateTATTopic() {
    try {
      console.log('Starting TAT topic generation...');
      
      // Get a random API key for this request
      const apiKey = this.getRandomApiKey();
      if (!apiKey) {
        throw new Error('No API keys available');
      }
      
      // Create a new model instance with the random key
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      console.log('API Key configured:', !!apiKey);
      console.log('Model available:', !!model);
      
      // First, randomly select a specific category and template
      const categories = [
        {
          name: "CHILDHOOD_SCENES",
          templates: [
            "A {age} child {action} while {context}",
            "Children {group_action} in {location}",
            "A {family_member} watches a child {activity}"
          ],
          variables: {
            age: ["7-year-old", "10-year-old", "teenage"],
            action: ["builds a fort", "reads under a tree", "draws on the sidewalk", "feeds ducks"],
            context: ["adults talk nearby", "storm clouds gather", "music plays from a window"],
            group_action: ["play hide-and-seek", "share lunch", "build sandcastles"],
            location: ["an abandoned playground", "a busy market", "a quiet library corner"],
            family_member: ["grandmother", "father", "older sister"],
            activity: ["painting", "practicing violin", "solving a puzzle"]
          }
        },
        {
          name: "WORKPLACE_DRAMA",
          templates: [
            "A {profession} {action} while {colleagues_reaction}",
            "During a {meeting_type}, {conflict_situation}",
            "A {worker_type} {emotional_state} in {workplace_setting}"
          ],
          variables: {
            profession: ["security guard", "nurse", "mechanic", "teacher", "chef"],
            action: ["makes a difficult phone call", "cleans up after everyone left", "discovers something unexpected"],
            colleagues_reaction: ["others whisper in the corner", "a supervisor approaches", "phones keep ringing"],
            meeting_type: ["budget review", "emergency briefing", "farewell party"],
            conflict_situation: ["two managers argue about priorities", "someone unexpected arrives", "the lights suddenly go out"],
            worker_type: ["janitor", "receptionist", "delivery person"],
            emotional_state: ["looks worried", "appears confused", "seems excited"],
            workplace_setting: ["an empty office building", "a crowded break room", "the supply closet"]
          }
        },
        {
          name: "DOMESTIC_MOMENTS",
          templates: [
            "A {family_role} {domestic_action} while {household_context}",
            "In the {room}, {family_situation}",
            "A {person_type} {emotion_action} as {background_activity}"
          ],
          variables: {
            family_role: ["single mother", "retired grandfather", "teenage son", "middle-aged father"],
            domestic_action: ["organizes old photos", "repairs a broken appliance", "prepares dinner"],
            household_context: ["the phone rings repeatedly", "rain pounds on windows", "neighbors argue loudly"],
            room: ["basement", "attic", "garage", "bathroom"],
            family_situation: ["someone packs boxes hurriedly", "multiple generations argue", "a pet creates chaos"],
            person_type: ["babysitter", "house guest", "repair technician"],
            emotion_action: ["paces nervously", "sits in silence", "laughs uncontrollably"],
            background_activity: ["TV news reports something urgent", "children play upstairs", "music drifts from next door"]
          }
        },
        {
          name: "PUBLIC_ENCOUNTERS",
          templates: [
            "At {public_place}, {character} {interaction} with {other_person}",
            "A {character_type} {observes_or_acts} while {public_context}",
            "In {transport_setting}, {social_situation}"
          ],
          variables: {
            public_place: ["the bus stop", "a crowded elevator", "the hospital waiting room", "a park bench"],
            character: ["a businessman", "a street performer", "an elderly tourist"],
            interaction: ["accidentally bumps into", "shares an umbrella with", "helps"],
            other_person: ["a crying child", "a confused foreigner", "someone with a visible disability"],
            character_type: ["subway musician", "food truck vendor", "mall security guard"],
            observes_or_acts: ["watches something unusual", "makes an unexpected discovery", "intervenes in a situation"],
            public_context: ["protesters march by", "a flash mob forms", "emergency vehicles arrive"],
            transport_setting: ["a delayed airplane", "a crowded train", "a broken-down bus"],
            social_situation: ["strangers start singing together", "someone faints", "a child gets lost"]
          }
        },
        {
          name: "CRISIS_MOMENTS",
          templates: [
            "During {crisis_type}, {character} must {decision_action}",
            "A {helper_type} {response} when {emergency_situation}",
            "In the aftermath of {event}, {character_reaction}"
          ],
          variables: {
            crisis_type: ["a power outage", "a medical emergency", "a fire alarm"],
            character: ["volunteer coordinator", "neighbor", "store manager"],
            decision_action: ["choose between two important things", "contact someone important", "leave or stay"],
            helper_type: ["paramedic", "social worker", "firefighter"],
            response: ["arrives to find chaos", "must make split-second decisions", "discovers something unexpected"],
            emergency_situation: ["no one else is around", "equipment fails", "conflicting information emerges"],
            event: ["a storm", "an accident", "a celebration gone wrong"],
            character_reaction: ["a witness processes what happened", "someone takes unexpected responsibility", "neighbors come together"]
          }
        }
      ];
      
      // Randomly select a category and template
      const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
      const selectedTemplate = selectedCategory.templates[Math.floor(Math.random() * selectedCategory.templates.length)];
      
      // Create a specific prompt for this template
      const prompt = `Create a specific TAT scenario using this template: "${selectedTemplate}"
      
      Available variables for this template:
      ${Object.entries(selectedCategory.variables).map(([key, values]) => 
        `{${key}}: ${values.join(', ')}`
      ).join('\n')}
      
      Instructions:
      1. Fill in ALL the {variables} in the template with specific choices
      2. Make it exactly 1-2 sentences
      3. Make it psychologically interesting and ambiguous
      4. Create a scene that could provoke different emotional interpretations
      5. Return ONLY the completed scenario, no explanations
      
      Template to complete: "${selectedTemplate}"`;

      console.log('Using template:', selectedTemplate);
      console.log('From category:', selectedCategory.name);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const topic = response.text().trim();
      console.log('Generated topic:', topic);

      // Clean up the response
      const cleanTopic = topic.replace(/^["']|["']$/g, '').trim();

      return {
        success: true,
        data: {
          topic: cleanTopic,
          timestamp: new Date().toISOString(),
          source: 'gemini-template-based',
          category: selectedCategory.name,
          template: selectedTemplate
        }
      };

    } catch (error) {
      console.error('Error generating TAT topic:', error);
      
      // Return a fallback topic if API fails - use completely diverse scenarios
      const fallbackTopics = [
        "A security guard discovers something unexpected during the night shift",
        "A child builds an elaborate fort while adults argue in another room",
        "A food truck vendor serves customers as protesters march nearby",
        "A janitor finds a letter left in an empty classroom",
        "Twin teenagers pack boxes in a cluttered garage",
        "A paramedic makes a difficult phone call in the ambulance",
        "A street performer draws a crowd in the subway station",
        "A babysitter deals with three children during a thunderstorm",
        "A delivery driver gets lost in an unfamiliar neighborhood",
        "A retired couple sorts through decades of belongings",
        "A librarian locks up as the last patron refuses to leave",
        "A taxi driver picks up passengers at 3 AM",
        "A hotel maid discovers guests have left something behind",
        "A construction worker takes a break on a busy street corner",
        "A pharmacist counsels an anxious customer",
        "Teenagers sneak out through a basement window",
        "A bus driver helps an elderly passenger who missed their stop",
        "A zookeeper feeds animals while visitors watch from outside",
        "A barista closes the coffee shop as regulars linger",
        "A crossing guard waves to children on the last day of school"
      ];
      
      const randomTopic = fallbackTopics[Math.floor(Math.random() * fallbackTopics.length)];
      
      return {
        success: false,
        error: 'API_ERROR',
        data: {
          topic: randomTopic,
          timestamp: new Date().toISOString(),
          source: 'fallback',
          fallback: true
        },
        message: 'Used fallback topic due to API error'
      };
    }
  }

  /**
   * Generate an image description and actual image for a TAT topic
   * @param {string} topic - The TAT topic to generate an image for
   * @returns {Promise<Object>} Generated image data with description and image URL
   */
  async generateTATImage(topic) {
    try {
      console.log('Starting TAT image generation for topic:', topic);
      
      // Get a random API key for this request
      const apiKey = this.getRandomApiKey();
      if (!apiKey) {
        throw new Error('No API keys available');
      }
      
      // Create a new vision model instance with the random key
      const genAI = new GoogleGenerativeAI(apiKey);
      const visionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Create a detailed visual description for this TAT (Thematic Apperception Test) scenario: "${topic}"

      Requirements:
      - Describe the scene in vivid detail suitable for realistic image generation
      - Include setting, lighting, mood, and atmosphere
      - Describe character positions, expressions, and body language
      - Make it psychologically ambiguous and interpretable
      - Keep it realistic and relatable
      - Focus on visual elements that would provoke storytelling
      - Format as a detailed prompt suitable for image generation AI
      
      Format your response as a single detailed paragraph describing exactly what would be seen in a realistic photograph or illustration.`;

      const result = await visionModel.generateContent(prompt);
      const response = await result.response;
      const imageDescription = response.text().trim();
      
      console.log('Generated image description:', imageDescription);

      // Try to generate a real image using different methods
      const imageResult = await this.generateRealImage(topic, imageDescription);
      
      return {
        success: true,
        data: {
          topic: topic,
          description: imageDescription,
          imageUrl: imageResult.imageUrl,
          imageType: imageResult.imageType,
          timestamp: new Date().toISOString(),
          source: imageResult.source
        }
      };

    } catch (error) {
      console.error('Error generating TAT image:', error);
      
      // Return a fallback with a placeholder image service
      const fallbackImageUrl = await this.getFallbackImage(topic);
      
      return {
        success: false,
        error: 'API_ERROR',
        data: {
          topic: topic,
          description: 'A thoughtful scene representing human emotion and relationships',
          imageUrl: fallbackImageUrl,
          imageType: 'jpeg',
          timestamp: new Date().toISOString(),
          source: 'fallback',
          fallback: true
        },
        message: 'Used fallback image due to API error'
      };
    }
  }

  /**
   * Generate a real image using various image generation methods
   * @param {string} topic - The TAT topic
   * @param {string} description - The detailed image description
   * @returns {Promise<Object>} Object with imageUrl, imageType, and source
   */
  async generateRealImage(topic, description) {
    // Method 1: Try using a free image generation API
    try {
      const imageUrl = await this.generateImageWithAPI(description);
      if (imageUrl) {
        return {
          imageUrl: imageUrl,
          imageType: 'jpeg',
          source: 'pollinations-ai'
        };
      }
    } catch (error) {
      console.log('Primary image generation failed, trying alternatives:', error.message);
    }

    // Method 2: Try using Unsplash API for relevant stock photos
    try {
      const imageUrl = await this.getRelevantStockPhoto(topic);
      if (imageUrl) {
        return {
          imageUrl: imageUrl,
          imageType: 'jpeg',
          source: 'unsplash'
        };
      }
    } catch (error) {
      console.log('Stock photo retrieval failed:', error.message);
    }

    // Method 3: Use a placeholder image service with custom text
    const placeholderUrl = await this.getCustomPlaceholder(topic, description);
    return {
      imageUrl: placeholderUrl,
      imageType: 'jpeg',
      source: 'placeholder'
    };
  }

  /**
   * Generate image using Pollinations AI (free image generation API)
   * @param {string} description - The image description
   * @returns {Promise<string>} Generated image URL
   */
  async generateImageWithAPI(description) {
    try {
      // Pollinations.ai - Free AI image generation
      const encodedPrompt = encodeURIComponent(description + ", realistic, high quality, psychological portrait, human emotion");
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=400&height=300&seed=${Math.floor(Math.random() * 10000)}`;
      
      // Test if the URL is accessible
      const response = await fetch(imageUrl, { method: 'HEAD' });
      if (response.ok) {
        console.log('Successfully generated image with Pollinations AI');
        return imageUrl;
      } else {
        throw new Error('Pollinations API not accessible');
      }
    } catch (error) {
      console.error('Error with Pollinations AI:', error);
      throw error;
    }
  }

  /**
   * Get relevant stock photo from Unsplash
   * @param {string} topic - The TAT topic
   * @returns {Promise<string>} Stock photo URL
   */
  async getRelevantStockPhoto(topic) {
    try {
      // Extract keywords for search
      const keywords = this.extractKeywords(topic);
      const searchQuery = keywords.join(',');
      
      // Unsplash API (you would need an API key for production)
      // For now, use the public URL structure
      const unsplashUrl = `https://source.unsplash.com/400x300/?${encodeURIComponent(searchQuery + ',people,emotion,psychology')}`;
      
      console.log('Using Unsplash image for keywords:', searchQuery);
      return unsplashUrl;
    } catch (error) {
      console.error('Error getting stock photo:', error);
      throw error;
    }
  }

  /**
   * Extract keywords from TAT topic for image search
   * @param {string} topic - The TAT topic
   * @returns {Array<string>} Array of keywords
   */
  extractKeywords(topic) {
    const topicLower = topic.toLowerCase();
    const keywords = [];

    // Add context-specific keywords
    if (topicLower.includes('student') || topicLower.includes('school')) {
      keywords.push('student', 'education', 'school');
    }
    if (topicLower.includes('village') || topicLower.includes('hill')) {
      keywords.push('village', 'landscape', 'rural');
    }
    if (topicLower.includes('conversation') || topicLower.includes('talking')) {
      keywords.push('conversation', 'people', 'meeting');
    }
    if (topicLower.includes('door') || topicLower.includes('room')) {
      keywords.push('door', 'interior', 'room');
    }

    // Add general emotional keywords
    keywords.push('portrait', 'emotion', 'thinking', 'contemplation');

    return keywords.slice(0, 3); // Limit to 3 keywords
  }

  /**
   * Get custom placeholder image
   * @param {string} topic - The TAT topic
   * @param {string} description - The image description
   * @returns {Promise<string>} Placeholder image URL
   */
  async getCustomPlaceholder(topic, description) {
    try {
      // Use a service like picsum with overlay text, or placeholder.com
      const width = 400;
      const height = 300;
      
      // Method 1: Try DummyImage.com with custom text
      const text = encodeURIComponent(topic.substring(0, 50));
      const dummyImageUrl = `https://dummyimage.com/${width}x${height}/4a90e2/ffffff&text=${text}`;
      
      return dummyImageUrl;
    } catch (error) {
      console.error('Error creating placeholder:', error);
      // Ultimate fallback
      return `https://via.placeholder.com/400x300/4a90e2/ffffff?text=${encodeURIComponent('TAT Image')}`;
    }
  }

  /**
   * Get fallback image for error cases
   * @param {string} topic - The TAT topic
   * @returns {Promise<string>} Fallback image URL
   */
  async getFallbackImage(topic) {
    // Use a simple placeholder service
    const text = encodeURIComponent('TAT: ' + topic.substring(0, 30));
    return `https://via.placeholder.com/400x300/cccccc/333333?text=${text}`;
  }

  /**
   * Generate an SVG placeholder image based on topic and description
   * @param {string} topic - The TAT topic
   * @param {string} description - The image description
   * @returns {string} Data URL containing SVG image
   */
  generateSVGPlaceholder(topic, description) {
    const width = 400;
    const height = 300;
    
    // Analyze topic to determine scene type and generate realistic SVG
    const topicLower = topic.toLowerCase();
    let svg = '';
    
    if (topicLower.includes('student') || topicLower.includes('school') || topicLower.includes('door') || topicLower.includes('paper')) {
      // School/academic scene with realistic details
      svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="wallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#f5f5f5;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#e8e8e8;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="doorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#8d6e63;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#5d4037;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#ffdbcb;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#f4c2a1;stop-opacity:1" />
            </linearGradient>
          </defs>
          
          <!-- Background wall -->
          <rect width="100%" height="100%" fill="url(#wallGrad)"/>
          
          <!-- Floor with perspective -->
          <polygon points="0,250 400,230 400,300 0,300" fill="#d7ccc8"/>
          
          <!-- Door -->
          <rect x="300" y="80" width="80" height="150" fill="url(#doorGrad)" stroke="#4a2c2a" stroke-width="2"/>
          <rect x="305" y="85" width="70" height="140" fill="#6d4c41"/>
          <circle cx="365" cy="155" r="3" fill="#ffd54f"/>
          <rect x="315" y="100" width="15" height="10" fill="#424242"/>
          <text x="322" y="108" font-family="Arial" font-size="8" fill="#fff">101</text>
          
          <!-- Student figure (main character) -->
          <g transform="translate(120, 100)">
            <!-- Body -->
            <rect x="18" y="60" width="24" height="50" fill="#1976d2" rx="3"/>
            <!-- Head with realistic proportions -->
            <ellipse cx="30" cy="25" rx="16" ry="18" fill="url(#skinGrad)"/>
            <!-- Hair -->
            <path d="M 16 15 Q 30 5 44 15 Q 40 30 30 30 Q 20 30 16 15" fill="#3e2723"/>
            <!-- Eyes with detail -->
            <ellipse cx="25" cy="22" rx="2" ry="1.5" fill="#fff"/>
            <circle cx="25" cy="22" r="1.2" fill="#333"/>
            <ellipse cx="35" cy="22" rx="2" ry="1.5" fill="#fff"/>
            <circle cx="35" cy="22" r="1.2" fill="#333"/>
            <!-- Eyebrows -->
            <path d="M 22 18 Q 25 17 28 18" stroke="#3e2723" stroke-width="1"/>
            <path d="M 32 18 Q 35 17 38 18" stroke="#3e2723" stroke-width="1"/>
            <!-- Nose -->
            <path d="M 30 25 L 29 28 L 31 28 Z" fill="#f4c2a1"/>
            <!-- Mouth (worried/contemplative) -->
            <path d="M 26 32 Q 30 30 34 32" stroke="#333" stroke-width="1" fill="none"/>
            <!-- Arms -->
            <rect x="8" y="65" width="8" height="30" fill="url(#skinGrad)"/>
            <rect x="44" y="65" width="8" height="30" fill="url(#skinGrad)"/>
            <!-- Right hand holding crumpled paper -->
            <ellipse cx="50" cy="90" rx="5" ry="4" fill="url(#skinGrad)"/>
            <path d="M 52 86 L 60 88 L 62 94 L 58 98 L 54 96 L 52 90 Z" fill="#f5f5f5" stroke="#ddd"/>
            <path d="M 54 88 L 57 90 L 59 94" stroke="#ccc" stroke-width="0.5" fill="none"/>
            <!-- Left hand -->
            <circle cx="10" cy="90" r="4" fill="url(#skinGrad)"/>
            <!-- Legs -->
            <rect x="20" y="110" width="8" height="35" fill="#424242"/>
            <rect x="32" y="110" width="8" height="35" fill="#424242"/>
            <!-- Feet -->
            <ellipse cx="24" cy="150" rx="8" ry="4" fill="#212121"/>
            <ellipse cx="36" cy="150" rx="8" ry="4" fill="#212121"/>
            <!-- Shoe details -->
            <ellipse cx="24" cy="148" rx="6" ry="2" fill="#424242"/>
            <ellipse cx="36" cy="148" rx="6" ry="2" fill="#424242"/>
          </g>
          
          <!-- Background students (walking by, unconcerned) -->
          <g opacity="0.7">
            <!-- Student 1 -->
            <ellipse cx="60" cy="180" rx="12" ry="30" fill="#666"/>
            <circle cx="60" cy="155" r="8" fill="#e0b894"/>
            <rect x="55" y="190" width="5" height="20" fill="#333"/>
            <rect x="65" y="190" width="5" height="20" fill="#333"/>
            <!-- Student 2 -->
            <ellipse cx="350" cy="190" rx="10" ry="25" fill="#888"/>
            <circle cx="350" cy="170" r="7" fill="#d4a574"/>
            <rect x="346" y="200" width="4" height="18" fill="#222"/>
            <rect x="354" y="200" width="4" height="18" fill="#222"/>
          </g>
          
          <!-- Hallway perspective and architectural details -->
          <line x1="0" y1="80" x2="400" y2="70" stroke="#ddd" stroke-width="1"/>
          <line x1="0" y1="250" x2="400" y2="230" stroke="#ccc" stroke-width="1"/>
          
          <!-- Lighting effects -->
          <rect x="0" y="0" width="400" height="80" fill="url(#skyGrad)" opacity="0.3"/>
          <defs>
            <radialGradient id="light" cx="30%" cy="20%" r="70%">
              <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.4" />
              <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#light)"/>
          
          <!-- Floor reflection -->
          <g opacity="0.2">
            <ellipse cx="150" cy="280" rx="30" ry="8" fill="#333"/>
          </g>
        </svg>
      `;
    } else if (topicLower.includes('village') || topicLower.includes('hill') || topicLower.includes('landscape') || topicLower.includes('mountain')) {
      // Landscape/village scene with realistic details
      svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#87ceeb;stop-opacity:1" />
              <stop offset="70%" style="stop-color:#e0f6ff;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#f0f8ff;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="hillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#8bc34a;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#689f38;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="personGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#ffcc9c;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#f4a261;stop-opacity:1" />
            </linearGradient>
          </defs>
          
          <!-- Sky with clouds -->
          <rect width="100%" height="180" fill="url(#skyGrad)"/>
          
          <!-- Distant mountains -->
          <path d="M 0 120 Q 80 100 160 110 Q 240 95 320 105 Q 380 100 400 105 L 400 180 L 0 180 Z" fill="#b39ddb" opacity="0.6"/>
          
          <!-- Middle hills -->
          <path d="M 0 140 Q 100 125 200 135 Q 300 120 400 130 L 400 180 L 0 180 Z" fill="#a5d6a7"/>
          
          <!-- Main hill/foreground -->
          <path d="M 0 160 Q 150 145 300 155 Q 350 150 400 155 L 400 300 L 0 300 Z" fill="url(#hillGrad)"/>
          
          <!-- Village houses with realistic details -->
          <g transform="translate(180, 170)">
            <!-- House 1 -->
            <rect x="0" y="20" width="30" height="25" fill="#d7ccc8"/>
            <polygon points="0,20 15,8 30,20" fill="#8d6e63"/>
            <rect x="10" y="30" width="8" height="12" fill="#5d4037"/>
            <rect x="20" y="25" width="6" height="6" fill="#81c784"/>
            <!-- Chimney -->
            <rect x="22" y="10" width="4" height="12" fill="#6d4c41"/>
            <!-- Smoke -->
            <circle cx="24" cy="8" r="1" fill="#bbb" opacity="0.7"/>
            <circle cx="25" cy="5" r="1.5" fill="#ccc" opacity="0.6"/>
            
            <!-- House 2 -->
            <rect x="35" y="25" width="25" height="20" fill="#f3e5f5"/>
            <polygon points="35,25 47.5,12 60,25" fill="#7b1fa2"/>
            <rect x="43" y="32" width="6" height="10" fill="#4a148c"/>
            <rect x="52" y="28" width="5" height="5" fill="#e1f5fe"/>
            
            <!-- House 3 -->
            <rect x="65" y="22" width="22" height="23" fill="#e8f5e8"/>
            <polygon points="65,22 76,10 87,22" fill="#2e7d32"/>
            <rect x="72" y="32" width="6" height="8" fill="#1b5e20"/>
            <rect x="80" y="26" width="4" height="4" fill="#bbdefb"/>
          </g>
          
          <!-- Young man figure (detailed and realistic) -->
          <g transform="translate(80, 120)">
            <!-- Body -->
            <rect x="15" y="45" width="22" height="40" fill="#1565c0" rx="3"/>
            <!-- Head with realistic proportions -->
            <ellipse cx="26" cy="22" rx="14" ry="16" fill="url(#personGrad)"/>
            <!-- Hair with texture -->
            <path d="M 14 12 Q 26 5 38 12 Q 35 25 26 25 Q 17 25 14 12" fill="#5d4037"/>
            <path d="M 18 15 Q 22 13 26 15" stroke="#3e2723" stroke-width="0.5"/>
            <path d="M 30 15 Q 34 13 38 15" stroke="#3e2723" stroke-width="0.5"/>
            <!-- Eyes (contemplative) -->
            <ellipse cx="22" cy="20" rx="2" ry="1.5" fill="#fff"/>
            <circle cx="22" cy="20" r="1.3" fill="#333"/>
            <ellipse cx="30" cy="20" rx="2" ry="1.5" fill="#fff"/>
            <circle cx="30" cy="20" r="1.3" fill="#333"/>
            <!-- Eyebrows -->
            <path d="M 20 17 Q 22 16 24 17" stroke="#5d4037" stroke-width="1"/>
            <path d="M 28 17 Q 30 16 32 17" stroke="#5d4037" stroke-width="1"/>
            <!-- Nose and mouth -->
            <path d="M 26 23 L 25 26 L 27 26 Z" fill="#f4a261"/>
            <path d="M 23 28 Q 26 27 29 28" stroke="#333" stroke-width="1" fill="none"/>
            <!-- Arms -->
            <rect x="8" y="50" width="8" height="25" fill="url(#personGrad)"/>
            <rect x="36" y="50" width="8" height="25" fill="url(#personGrad)"/>
            <!-- Hands -->
            <circle cx="10" cy="72" r="4" fill="url(#personGrad)"/>
            <circle cx="40" cy="72" r="4" fill="url(#personGrad)"/>
            <!-- Legs -->
            <rect x="18" y="85" width="7" height="30" fill="#424242"/>
            <rect x="28" y="85" width="7" height="30" fill="#424242"/>
            <!-- Feet -->
            <ellipse cx="21" cy="120" rx="6" ry="3" fill="#212121"/>
            <ellipse cx="31" cy="120" rx="6" ry="3" fill="#212121"/>
          </g>
          
          <!-- Trees with realistic details -->
          <g>
            <!-- Tree 1 -->
            <rect x="347" y="200" width="6" height="25" fill="#5d4037"/>
            <ellipse cx="350" cy="190" rx="18" ry="28" fill="#388e3c"/>
            <ellipse cx="345" cy="185" rx="8" ry="12" fill="#4caf50"/>
            <ellipse cx="355" cy="188" rx="10" ry="15" fill="#2e7d32"/>
            
            <!-- Tree 2 -->
            <rect x="27" y="210" width="5" height="20" fill="#3e2723"/>
            <ellipse cx="30" cy="205" rx="15" ry="22" fill="#4caf50"/>
            <ellipse cx="25" cy="200" rx="7" ry="10" fill="#66bb6a"/>
          </g>
          
          <!-- Clouds with realistic shapes -->
          <g opacity="0.8">
            <ellipse cx="100" cy="40" rx="15" ry="8" fill="#fff"/>
            <ellipse cx="115" cy="38" rx="20" ry="10" fill="#fff"/>
            <ellipse cx="130" cy="42" rx="12" ry="6" fill="#fff"/>
            <ellipse cx="300" cy="60" rx="18" ry="9" fill="#fff"/>
            <ellipse cx="315" cy="58" rx="22" ry="11" fill="#fff"/>
          </g>
          
          <!-- Sun with rays -->
          <circle cx="350" cy="50" r="22" fill="#ffeb3b" opacity="0.9"/>
          <g stroke="#fbc02d" stroke-width="2" opacity="0.7">
            <line x1="350" y1="15" x2="350" y2="28"/>
            <line x1="350" y1="72" x2="350" y2="85"/>
            <line x1="315" y1="50" x2="328" y2="50"/>
            <line x1="372" y1="50" x2="385" y2="50"/>
            <line x1="327" y1="27" x2="335" y2="35"/>
            <line x1="365" y1="65" x2="373" y2="73"/>
            <line x1="373" y1="27" x2="365" y2="35"/>
            <line x1="335" y1="65" x2="327" y2="73"/>
          </g>
          
          <!-- Atmospheric perspective -->
          <rect x="0" y="0" width="400" height="300" fill="url(#light)" opacity="0.1"/>
        </svg>
      `;
    } else if (topicLower.includes('café') || topicLower.includes('sitting') || topicLower.includes('conversation')) {
      // Indoor scene with realistic details
      svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="wallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#f8f4e6;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#ede0c8;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="floorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#d4af8c;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#c49b7a;stop-opacity:1" />
            </linearGradient>
          </defs>
          
          <!-- Background -->
          <rect width="100%" height="100%" fill="url(#wallGrad)"/>
          <rect x="0" y="220" width="400" height="80" fill="url(#floorGrad)"/>
          
          <!-- Window -->
          <rect x="30" y="40" width="80" height="100" fill="#e3f2fd" stroke="#90a4ae" stroke-width="3"/>
          <line x1="70" y1="40" x2="70" y2="140" stroke="#90a4ae" stroke-width="2"/>
          <line x1="30" y1="90" x2="110" y2="90" stroke="#90a4ae" stroke-width="2"/>
          
          <!-- Table -->
          <ellipse cx="200" cy="180" rx="60" ry="40" fill="#8d6e63"/>
          <ellipse cx="200" cy="175" rx="58" ry="38" fill="#a1887f"/>
          <rect x="195" y="180" width="10" height="30" fill="#5d4037"/>
          
          <!-- Chairs -->
          <rect x="130" y="150" width="25" height="40" fill="#6d4c41" rx="3"/>
          <rect x="130" y="145" width="25" height="8" fill="#8d6e63" rx="2"/>
          <rect x="245" y="150" width="25" height="40" fill="#6d4c41" rx="3"/>
          <rect x="245" y="145" width="25" height="8" fill="#8d6e63" rx="2"/>
          
          <!-- Person 1 (sitting) -->
          <g transform="translate(140, 120)">
            <circle cx="10" cy="15" r="12" fill="#ffcc9c"/>
            <path d="M 0 10 Q 10 5 20 10 Q 18 20 10 20 Q 2 20 0 10" fill="#8d6e63"/>
            <circle cx="7" cy="13" r="1.5" fill="#333"/>
            <circle cx="13" cy="13" r="1.5" fill="#333"/>
            <path d="M 7 18 Q 10 17 13 18" stroke="#333" stroke-width="1" fill="none"/>
            <rect x="5" y="27" width="10" height="25" fill="#1976d2"/>
            <rect x="0" y="32" width="6" height="15" fill="#ffcc9c"/>
            <rect x="14" y="32" width="6" height="15" fill="#ffcc9c"/>
          </g>
          
          <!-- Person 2 (sitting across) -->
          <g transform="translate(250, 120)">
            <circle cx="10" cy="15" r="12" fill="#f4a261"/>
            <path d="M 2 8 Q 10 3 18 8 Q 16 18 10 18 Q 4 18 2 8" fill="#d2691e"/>
            <circle cx="7" cy="13" r="1.5" fill="#333"/>
            <circle cx="13" cy="13" r="1.5" fill="#333"/>
            <path d="M 6 18 Q 10 16 14 18" stroke="#333" stroke-width="1" fill="none"/>
            <rect x="5" y="27" width="10" height="25" fill="#e91e63"/>
            <rect x="0" y="32" width="6" height="15" fill="#f4a261"/>
            <rect x="14" y="32" width="6" height="15" fill="#f4a261"/>
          </g>
          
          <!-- Coffee cups -->
          <ellipse cx="180" cy="175" rx="6" ry="4" fill="#5d4037"/>
          <ellipse cx="180" cy="173" rx="5" ry="3" fill="#8d6e63"/>
          <ellipse cx="220" cy="175" rx="6" ry="4" fill="#5d4037"/>
          <ellipse cx="220" cy="173" rx="5" ry="3" fill="#8d6e63"/>
          
          <!-- Lighting -->
          <circle cx="300" cy="60" r="25" fill="#fff3e0" opacity="0.6"/>
          <g stroke="#ffb74d" stroke-width="1" opacity="0.4">
            <line x1="285" y1="45" x2="315" y2="75"/>
            <line x1="315" y1="45" x2="285" y2="75"/>
            <line x1="300" y1="35" x2="300" y2="85"/>
            <line x1="275" y1="60" x2="325" y2="60"/>
          </g>
        </svg>
      `;
    } else {
      // Generic realistic scene
      svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#f8f9fa;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#e9ecef;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="personGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#ffcc9c;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#f4a261;stop-opacity:1" />
            </linearGradient>
          </defs>
          
          <!-- Background -->
          <rect width="100%" height="100%" fill="url(#bgGrad)"/>
          <rect x="0" y="250" width="400" height="50" fill="#dee2e6"/>
          
          <!-- Main figure with realistic proportions -->
          <g transform="translate(180, 130)">
            <!-- Body -->
            <rect x="15" y="50" width="24" height="45" fill="#6c757d" rx="4"/>
            <!-- Head -->
            <ellipse cx="27" cy="28" rx="16" ry="18" fill="url(#personGrad)"/>
            <!-- Hair -->
            <path d="M 13 18 Q 27 8 41 18 Q 38 30 27 30 Q 16 30 13 18" fill="#495057"/>
            <!-- Facial features -->
            <ellipse cx="22" cy="25" rx="2" ry="1.5" fill="#fff"/>
            <circle cx="22" cy="25" r="1.3" fill="#212529"/>
            <ellipse cx="32" cy="25" rx="2" ry="1.5" fill="#fff"/>
            <circle cx="32" cy="25" r="1.3" fill="#212529"/>
            <path d="M 20 22 Q 22 21 24 22" stroke="#495057" stroke-width="1"/>
            <path d="M 30 22 Q 32 21 34 22" stroke="#495057" stroke-width="1"/>
            <path d="M 27 30 L 26 33 L 28 33 Z" fill="#f4a261"/>
            <path d="M 23 35 Q 27 34 31 35" stroke="#212529" stroke-width="1" fill="none"/>
            <!-- Arms -->
            <rect x="6" y="55" width="8" height="28" fill="url(#personGrad)"/>
            <rect x="40" y="55" width="8" height="28" fill="url(#personGrad)"/>
            <!-- Hands -->
            <circle cx="8" cy="80" r="5" fill="url(#personGrad)"/>
            <circle cx="46" cy="80" r="5" fill="url(#personGrad)"/>
            <!-- Legs -->
            <rect x="18" y="95" width="8" height="32" fill="#343a40"/>
            <rect x="28" y="95" width="8" height="32" fill="#343a40"/>
            <!-- Feet -->
            <ellipse cx="22" cy="132" rx="7" ry="4" fill="#212529"/>
            <ellipse cx="32" cy="132" rx="7" ry="4" fill="#212529"/>
          </g>
          
          <!-- Environmental elements -->
          <rect x="50" y="80" width="80" height="100" fill="#adb5bd" opacity="0.4" rx="5"/>
          <rect x="280" y="100" width="60" height="80" fill="#6f42c1" opacity="0.3" rx="3"/>
          
          <!-- Background elements -->
          <circle cx="100" cy="60" r="25" fill="#17a2b8" opacity="0.2"/>
          <circle cx="320" cy="70" r="20" fill="#dc3545" opacity="0.2"/>
          
          <!-- Ground details -->
          <ellipse cx="200" cy="280" rx="40" ry="8" fill="#ced4da" opacity="0.6"/>
          
          <!-- Description text overlay -->
          <rect x="10" y="10" width="380" height="50" fill="rgba(255,255,255,0.95)" stroke="#dee2e6" stroke-width="1" rx="5"/>
          <text x="20" y="25" font-family="Arial, sans-serif" font-size="9" fill="#495057">
            ${description.substring(0, 85)}${description.length > 85 ? '...' : ''}
          </text>
          <text x="20" y="38" font-family="Arial, sans-serif" font-size="9" fill="#495057">
            ${description.substring(85, 170)}${description.length > 170 ? '...' : ''}
          </text>
          <text x="20" y="51" font-family="Arial, sans-serif" font-size="8" fill="#6c757d" font-style="italic">
            Topic: ${topic.length > 45 ? topic.substring(0, 42) + '...' : topic}
          </text>
        </svg>
      `;
    }
    
    // Convert SVG to data URL
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }

  /**
   * Generate realistic SVG using AI based on topic and description
   * @param {string} topic - The TAT topic
   * @param {string} description - The image description
   * @returns {Promise<string>} Data URL containing AI-generated SVG image
   */
  async generateRealisticSVG(topic, description = '') {
    try {
      console.log('Generating AI-powered realistic SVG for topic:', topic);
      
      if (!this.model) {
        throw new Error('Gemini model not initialized');
      }

      const prompt = `
      You are an expert SVG artist. Create a detailed, realistic SVG illustration for this TAT scenario:
      
      Topic: "${topic}"
      Description: "${description}"
      
      Requirements:
      - Create a 400x300 SVG with realistic human figures and detailed scenes
      - Use proper anatomical proportions for people (head = 1/8 of body height)
      - Include detailed facial expressions showing emotions relevant to the scenario
      - Add environmental elements like buildings, furniture, landscapes as appropriate
      - Use realistic colors and gradients for depth and lighting
      - Include fine details like clothing textures, architectural elements, natural features
      - Make the scene psychologically compelling and story-provoking
      - Focus on body language and positioning that suggests narrative potential
      
      Technical requirements:
      - Use SVG elements like <path>, <circle>, <rect>, <polygon>, <ellipse>
      - Include gradients with <defs> and <linearGradient> for realistic lighting
      - Add shadows and depth using opacity and layering
      - Ensure all elements are properly closed and valid SVG syntax
      - Use viewBox="0 0 400 300" for proper scaling
      
      Return ONLY the complete SVG code, no explanations or markdown formatting.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let svgCode = response.text().trim();
      
      console.log('AI generated SVG code length:', svgCode.length);
      
      // Clean up the response
      if (svgCode.includes('```')) {
        svgCode = svgCode.replace(/```svg\n?/g, '').replace(/```\n?/g, '');
      }
      
      // Ensure proper SVG structure
      if (!svgCode.includes('<svg')) {
        throw new Error('Invalid SVG: missing <svg> tag');
      }
      
      if (!svgCode.includes('</svg>')) {
        throw new Error('Invalid SVG: missing closing </svg> tag');
      }
      
      // Ensure proper dimensions
      if (!svgCode.includes('width=') || !svgCode.includes('height=')) {
        svgCode = svgCode.replace('<svg', '<svg width="400" height="300"');
      }
      
      // Add viewBox if missing
      if (!svgCode.includes('viewBox=')) {
        svgCode = svgCode.replace('<svg', '<svg viewBox="0 0 400 300"');
      }
      
      console.log('AI SVG generation successful');
      return `data:image/svg+xml;base64,${Buffer.from(svgCode).toString('base64')}`;
      
    } catch (error) {
      console.error('Error generating AI SVG:', error);
      // Fallback to the detailed static SVG generation
      console.log('Falling back to static SVG generation');
      return this.generateSVGPlaceholder(topic, description);
    }
  }

  /**
   * Generate feedback for a user's TAT story
   * @param {string} story - The user's written story
   * @param {string} topic - The original TAT topic
   * @returns {Promise<Object>} Generated feedback
   */
  async generateFeedback(story, topic) {
    try {
      if (!story || story.trim().length === 0) {
        return {
          success: false,
          error: 'INVALID_INPUT',
          message: 'Story cannot be empty'
        };
      }
      
      // Get a random API key for this request
      const apiKey = this.getRandomApiKey();
      if (!apiKey) {
        throw new Error('No API keys available');
      }
      
      // Create a new model instance with the random key
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `As a psychological assessment expert, provide constructive feedback for this TAT (Thematic Apperception Test) response.

      Original Topic: "${topic}"
      
      User's Story: "${story}"
      
      Please provide feedback in JSON format with the following structure:
      {
        "score": <a number between 0 and 100 based on the criteria below>,
        "feedback": "<a string of 3-4 sentences covering creativity, structure, and emotional depth>",
        "improvements": [
          "<actionable suggestion 1>",
          "<actionable suggestion 2>"
        ]
      }

      Scoring criteria (out of 100):
      - Creativity and Imagination (30 points)
      - Story Structure and Coherence (30 points)
      - Emotional Depth and Character Development (30 points)
      - Relevance to Topic (10 points)
      
      Return only the JSON object, nothing else.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let feedbackJson = response.text().trim();
      
      // Clean up markdown formatting if present
      if (feedbackJson.includes('```json')) {
        feedbackJson = feedbackJson.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (feedbackJson.includes('```')) {
        feedbackJson = feedbackJson.replace(/```\n?/g, '');
      }
      
      console.log('Cleaned feedback JSON:', feedbackJson.substring(0, 200) + '...');
      
      let feedbackData;
      try {
        feedbackData = JSON.parse(feedbackJson);
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        console.error('Raw response:', feedbackJson);
        throw new Error('Failed to parse feedback JSON: ' + parseError.message);
      }

      return {
        success: true,
        data: {
          ...feedbackData,
          timestamp: new Date().toISOString(),
          wordCount: story.split(' ').length,
          source: 'gemini-2.0-flash'
        }
      };

    } catch (error) {
      console.error('Error generating feedback:', error);
      
      // Return a generic feedback if API fails
      const genericFeedback = {
        score: 65,
        feedback: `Your story shows good imagination. The narrative is coherent. Consider adding more emotional depth to enhance your storytelling.`,
        improvements: [
          "Try to explore the characters' motivations more deeply.",
          "Add more descriptive details about the setting."
        ]
      };
      
      return {
        success: false,
        error: 'API_ERROR',
        data: {
          ...genericFeedback,
          timestamp: new Date().toISOString(),
          wordCount: story.split(' ').length,
          source: 'fallback',
          fallback: true
        },
        message: 'Used generic feedback due to API error'
      };
    }
  }

  /**
   * Generate both TAT topic and corresponding image together
   * @returns {Promise<Object>} Generated TAT topic with image
   */
  async generateTATTopicWithImage() {
    try {
      console.log('Generating TAT topic with image...');
      
      // First generate the topic
      const topicResult = await this.generateTATTopic();
      
      if (!topicResult.success) {
        return topicResult;
      }
      
      const topic = topicResult.data.topic;
      
      // Then generate the image for that topic
      const imageResult = await this.generateTATImage(topic);
      
      return {
        success: true,
        data: {
          topic: topic,
          image: imageResult.data,
          timestamp: new Date().toISOString(),
          source: 'gemini-combined'
        }
      };
      
    } catch (error) {
      console.error('Error generating TAT topic with image:', error);
      
      // Return fallback content with real image
      const fallbackTopic = "A young man looking out at a village from a hilltop";
      const fallbackImageUrl = await this.getFallbackImage(fallbackTopic);
      
      return {
        success: false,
        error: 'API_ERROR',
        data: {
          topic: fallbackTopic,
          image: {
            topic: fallbackTopic,
            description: 'A thoughtful scene representing human emotion and relationships',
            imageUrl: fallbackImageUrl,
            imageType: 'jpeg',
            timestamp: new Date().toISOString(),
            source: 'fallback'
          },
          timestamp: new Date().toISOString(),
          source: 'fallback'
        },
        message: 'Used fallback content due to API error'
      };
    }
  }

  /**
   * Validate API key configuration
   * @returns {boolean} True if API key is configured
   */
  isConfigured() {
    // Check if we have API keys
    const hasApiKeys = this.apiKeys && this.apiKeys.length > 0;
    
    if (!hasApiKeys) {
      console.warn('TATService is not properly configured - no API keys available');
    }
    
    return hasApiKeys;
  }
}

module.exports = new TATService();