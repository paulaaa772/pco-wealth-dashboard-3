const fs = require('fs');
const path = require('path');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('Creating .env.local file...');
  
  // Create a MongoDB connection string for development
  // For production, this should be replaced with a real MongoDB connection string
  const localMongoUrl = 'mongodb://localhost:27017/wealth-dashboard';
  
  // Default API keys (replace with real keys for production)
  const polyApiKey = 'B2IYP3Pd1DdpKo9XSIkoQVlzp1sdDNHK'; // Will use mock data if invalid
  
  // Create the .env.local file
  const envContent = `
# API Keys
NEXT_PUBLIC_POLYGON_API_KEY=${polyApiKey}

# Database Connection
MONGODB_URI=${localMongoUrl}

# Optional: Set to true to always use mock data regardless of API key
USE_MOCK_DATA=true
  `.trim();
  
  fs.writeFileSync(envPath, envContent);
  console.log('.env.local file created successfully.');
} else {
  console.log('.env.local file already exists.');
}

console.log('Environment setup complete!'); 