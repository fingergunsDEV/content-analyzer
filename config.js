// Configuration settings for the content analyzer
export default {
  // Scoring thresholds (0-100)
  scoreThresholds: {
    poor: 30,      // Score below this is considered poor
    average: 60,   // Score below this is considered average
    good: 80       // Score below this is considered good, above is excellent
  },
  
  // Colors for different score ranges
  colors: {
    poor: '#ff4d4d',        // Red for poor scores
    average: '#ffcc00',     // Yellow for average scores
    good: '#66cc66',        // Green for good scores
    excellent: '#4d94ff'    // Blue for excellent scores
  },
  
  // Analysis criteria weights (must sum to 100)
  weights: {
    keywordDensity: 15,
    sentenceLength: 15,
    readability: 20,
    uniqueness: 20,
    sentiment: 15,
    relevance: 15
  },
  
  // Sample keywords to check density against
  sampleKeywords: ['content', 'analysis', 'optimization', 'seo', 'text'],
  
  // Sentiment analysis configuration
  sentiment: {
    positive: ['effective', 'good', 'great', 'excellent', 'improve', 'better', 'best', 
               'enhance', 'valuable', 'useful', 'helpful', 'important', 'optimize', 'success'],
    negative: ['poor', 'bad', 'worse', 'worst', 'difficult', 'problem', 'issue', 'hard', 
               'complicated', 'confusing', 'ineffective', 'unnecessary', 'avoid', 'fail']
  },
  
  // Contextual relevance topics
  relevanceTopics: {
    'content marketing': ['strategy', 'audience', 'brand', 'value', 'engagement'],
    'seo': ['search', 'ranking', 'keywords', 'optimization', 'visibility'],
    'readability': ['clear', 'simple', 'understand', 'sentence', 'structure'],
    'analytics': ['data', 'measure', 'metrics', 'performance', 'tracking']
  }
}
