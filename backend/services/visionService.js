const vision = require('@google-cloud/vision');

class VisionService {
  constructor() {
    this.client = null;
    this.isEnabled = process.env.GOOGLE_VISION_ENABLED === 'true';
    
    if (this.isEnabled) {
      try {
        // Initialize Google Vision client
        this.client = new vision.ImageAnnotatorClient({
          // If GOOGLE_APPLICATION_CREDENTIALS env var is set, it will use that
          // Otherwise, you can pass credentials here
          keyFilename: process.env.GOOGLE_VISION_KEY_FILE
        });
        console.log('✅ Google Vision API initialized');
      } catch (error) {
        console.warn('⚠️ Google Vision API initialization failed:', error.message);
        this.isEnabled = false;
      }
    } else {
      console.log('📋 Google Vision API disabled (set GOOGLE_VISION_ENABLED=true to enable)');
    }
  }

  async extractTextFromImage(imagePath) {
    if (!this.isEnabled || !this.client) {
      throw new Error('Google Vision API is not enabled or initialized');
    }

    try {
      // Performs text detection on the image
      const [result] = await this.client.textDetection(imagePath);
      const detections = result.textAnnotations;
      
      if (!detections || detections.length === 0) {
        return { success: false, error: 'No text detected in image' };
      }

      // Extract all text
      const fullText = detections[0].description;
      
      // Try to extract step count using various patterns
      const stepCount = this.extractStepCount(fullText);
      
      return {
        success: true,
        stepCount,
        fullText,
        confidence: stepCount ? 0.9 : 0.1
      };
    } catch (error) {
      console.error('Vision API error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  extractStepCount(text) {
    // Clean the text
    const cleanText = text.replace(/[^\d\s,]/g, '');
    
    // Common patterns for step counts
    const patterns = [
      /(\d{1,2}[,.]?\d{3,5})\s*steps?/i,  // "12,345 steps"
      /steps?[:\s]*(\d{1,2}[,.]?\d{3,5})/i,  // "Steps: 12345"
      /(\d{4,5})\s*$/m,  // Large number at end of line
      /(\d{1,2}[,.]?\d{3,5})(?=\s|$)/g  // Any 4-5 digit number
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const numberStr = match[1] || match[0];
        const number = parseInt(numberStr.replace(/[,._]/g, ''));
        
        // Validate reasonable step count range
        if (number >= 100 && number <= 100000) {
          return number;
        }
      }
    }

    // Fallback: find largest reasonable number
    const numbers = text.match(/\d+/g);
    if (numbers) {
      const validSteps = numbers
        .map(n => parseInt(n))
        .filter(n => n >= 100 && n <= 100000)
        .sort((a, b) => b - a);
      
      if (validSteps.length > 0) {
        return validSteps[0];
      }
    }

    return null;
  }

  isAvailable() {
    return this.isEnabled && this.client !== null;
  }
}

// Export singleton instance
module.exports = new VisionService();