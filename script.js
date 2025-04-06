import config from 'config';
import ContentRewriter from 'rewriter';

class ContentAnalyzer {
  constructor() {
    this.contentInput = document.getElementById('content-input');
    this.analyzeBtn = document.getElementById('analyze-btn');
    this.analyzedContent = document.getElementById('analyzed-content');
    this.scoreValue = document.getElementById('score-value');
    this.keywordScore = document.getElementById('keyword-score');
    this.sentenceScore = document.getElementById('sentence-score');
    this.readabilityScore = document.getElementById('readability-score');
    this.uniquenessScore = document.getElementById('uniqueness-score');
    this.suggestionsList = document.getElementById('suggestions-list');
    this.rewrittenContent = document.getElementById('rewritten-content');
    this.sentimentScore = document.getElementById('sentiment-score');
    this.relevanceScore = document.getElementById('relevance-score');
    this.bigramsList = document.getElementById('bigrams-list');
    this.semanticMap = document.getElementById('semantic-map');

    // Initialize the content rewriter
    this.contentRewriter = new ContentRewriter(this.contentInput, this.rewrittenContent);

    this.init();
  }

  init() {
    this.addEventListeners();
    this.loadSampleContent();
  }

  addEventListeners() {
    this.analyzeBtn.addEventListener('click', () => {
      this.analyzeContent();
    });

    window.addEventListener('resize', () => {
      // Responsive behavior if needed
    });
  }

  loadSampleContent() {
    const sampleContent = `Content optimization is crucial for effective digital marketing. A well-optimized article or blog post can rank higher in search engines, attract more readers, and convert better than non-optimized content. Using the right keywords, maintaining proper keyword density, and ensuring readable sentence structures are all vital components of content optimization. This tool helps you visualize how well your content is optimized across various parameters, showing areas of strength and potential improvement at a glance.`;

    this.contentInput.value = sampleContent;
  }

  analyzeContent() {
    const content = this.contentInput.value.trim();
    if (!content) return;

    // Split content into words
    const words = content.split(/\s+/);

    // Generate metrics
    const metrics = this.generateMetrics(content, words);
    this.updateScores(metrics);

    // Generate highlighted content
    this.displayHighlightedContent(words, metrics);

    // Generate semantic network suggestions
    this.generateSuggestions(words);

    // Additional analyses
    this.analyzeKeywordDensity(words);
    this.createSemanticDistanceMap(words);
  }

  generateMetrics(content, words) {
    const metrics = {
      keywordDensity: 0,
      sentenceLength: 0,
      readability: 0,
      uniqueness: 0,
      sentiment: 0,
      relevance: 0,
      wordsScore: []
    };

    // Calculate keyword density
    const keywordDensity = this.calculateKeywordDensity(words);
    metrics.keywordDensity = Math.min(100, keywordDensity * 300);

    // Calculate sentence structure score
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = words.length / sentences.length;
    metrics.sentenceLength = avgSentenceLength > 25 ? 40 :
                            avgSentenceLength > 20 ? 70 :
                            avgSentenceLength > 10 ? 100 : 85;

    // Calculate readability (simplified Flesch-Kincaid)
    const syllables = this.estimateSyllables(content);
    const readabilityScore = 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length);
    metrics.readability = this.normalizeReadability(readabilityScore);

    // Calculate uniqueness (word diversity)
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    metrics.uniqueness = Math.min(100, (uniqueWords.size / words.length) * 130);

    // Calculate sentiment score
    metrics.sentiment = this.calculateSentiment(words);

    // Calculate contextual relevance
    metrics.relevance = this.calculateContextualRelevance(words);

    // Score each word
    metrics.wordsScore = words.map((word, index) => {
      let score = 0;

      // Is it a keyword?
      if (config.sampleKeywords.includes(word.toLowerCase())) {
        score += 25;
      }

      // Part of a good sentence length?
      const sentenceIndex = this.getSentenceIndexForWord(content, word, index);
      const sentenceWordCount = sentences[sentenceIndex]?.split(/\s+/).length || 0;
      if (sentenceWordCount > 5 && sentenceWordCount < 20) score += 25;

      // Word length factor (preference for medium length words)
      const wordLength = word.length;
      if (wordLength > 4 && wordLength < 10) score += 15;
      else if (wordLength > 2 && wordLength <= 4) score += 10;
      else if (wordLength > 10) score += 5;

      // Sentiment factor
      if (config.sentiment.positive.includes(word.toLowerCase())) score += 15;
      if (config.sentiment.negative.includes(word.toLowerCase())) score -= 10;

      // Relevance factor
      const relevanceScore = this.getWordRelevanceScore(word);
      score += relevanceScore * 0.2;

      // Random factor to create visual variation
      score += Math.random() * 20;

      return Math.min(100, Math.max(0, score));
    });

    return metrics;
  }

  calculateKeywordDensity(words) {
    const keywordCount = words.filter(word => 
      config.sampleKeywords.includes(word.toLowerCase())
    ).length;

    return keywordCount / words.length;
  }

  estimateSyllables(text) {
    // Simple syllable estimator
    const cleanText = text.toLowerCase().replace(/[^a-z]/g, '');
    return cleanText.split(/[aeiouy]+/).length - 1;
  }

  normalizeReadability(score) {
    // Convert Flesch-Kincaid score to 0-100
    if (score > 90) return 95; // Very easy
    if (score > 80) return 90;
    if (score > 70) return 85;
    if (score > 60) return 75;
    if (score > 50) return 65;
    if (score > 40) return 55;
    if (score > 30) return 45;
    return 30; // Very difficult
  }

  getSentenceIndexForWord(content, word, wordIndex) {
    // Find which sentence a word belongs to
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let wordCount = 0;

    for (let i = 0; i < sentences.length; i++) {
      const sentenceWordCount = sentences[i].split(/\s+/).length;
      wordCount += sentenceWordCount;
      if (wordCount > wordIndex) {
        return i;
      }
    }

    return 0;
  }

  calculateSentiment(words) {
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      const lowerWord = word.toLowerCase().replace(/[^\w]/g, '');
      if (config.sentiment.positive.includes(lowerWord)) positiveCount++;
      if (config.sentiment.negative.includes(lowerWord)) negativeCount++;
    });

    const totalSentimentWords = positiveCount + negativeCount;
    if (totalSentimentWords === 0) return 50; // Neutral

    const sentimentRatio = (positiveCount - negativeCount) / totalSentimentWords;
    return Math.min(100, Math.max(0, 50 + sentimentRatio * 50));
  }

  calculateContextualRelevance(words) {
    const wordSet = new Set(words.map(w => w.toLowerCase().replace(/[^\w]/g, '')));
    let totalRelevance = 0;
    let topicCount = 0;

    // Check relevance against each topic
    Object.entries(config.relevanceTopics).forEach(([topic, keywords]) => {
      const matchingKeywords = keywords.filter(keyword => wordSet.has(keyword));
      if (matchingKeywords.length > 0) {
        totalRelevance += matchingKeywords.length / keywords.length;
        topicCount++;
      }
    });

    if (topicCount === 0) return 40; // Default relevance

    // Average relevance across topics with matches
    return Math.min(100, (totalRelevance / topicCount) * 100);
  }

  getWordRelevanceScore(word) {
    const lowerWord = word.toLowerCase().replace(/[^\w]/g, '');
    let relevanceScore = 0;

    // Check if word appears in any relevance topic
    Object.values(config.relevanceTopics).forEach(keywords => {
      if (keywords.includes(lowerWord)) {
        relevanceScore += 10;
      }
    });

    return relevanceScore;
  }

  updateScores(metrics) {
    // Calculate overall score
    const overallScore = Math.round(
      (metrics.keywordDensity * (config.weights.keywordDensity / 100)) +
      (metrics.sentenceLength * (config.weights.sentenceLength / 100)) +
      (metrics.readability * (config.weights.readability / 100)) +
      (metrics.uniqueness * (config.weights.uniqueness / 100)) +
      (metrics.sentiment * (config.weights.sentiment / 100)) +
      (metrics.relevance * (config.weights.relevance / 100))
    );

    // Update UI
    this.scoreValue.textContent = overallScore;
    this.keywordScore.textContent = Math.round(metrics.keywordDensity);
    this.sentenceScore.textContent = Math.round(metrics.sentenceLength);
    this.readabilityScore.textContent = Math.round(metrics.readability);
    this.uniquenessScore.textContent = Math.round(metrics.uniqueness);
    this.sentimentScore.textContent = Math.round(metrics.sentiment);
    this.relevanceScore.textContent = Math.round(metrics.relevance);

    // Color the overall score
    this.scoreValue.parentElement.style.background = this.getScoreGradient(overallScore);
  }

  getScoreGradient(score) {
    if (score >= config.scoreThresholds.good) {
      return `linear-gradient(135deg, ${config.colors.excellent}, ${config.colors.good})`;
    } else if (score >= config.scoreThresholds.average) {
      return `linear-gradient(135deg, ${config.colors.good}, ${config.colors.average})`;
    } else {
      return `linear-gradient(135deg, ${config.colors.average}, ${config.colors.poor})`;
    }
  }

  getScoreCategory(score) {
    if (score >= config.scoreThresholds.good) {
      return score >= config.scoreThresholds.good + 
        ((100 - config.scoreThresholds.good) / 2) ? 'excellent' : 'good';
    } else if (score >= config.scoreThresholds.average) {
      return 'good';
    } else if (score >= config.scoreThresholds.poor) {
      return 'average';
    } else {
      return 'poor';
    }
  }

  displayHighlightedContent(words, metrics) {
    this.analyzedContent.innerHTML = '';

    words.forEach((word, index) => {
      const score = metrics.wordsScore[index];
      const category = this.getScoreCategory(score);

      const wordSpan = document.createElement('span');
      wordSpan.className = `word ${category}`;
      wordSpan.textContent = word;
      wordSpan.title = `Score: ${Math.round(score)}`;

      this.analyzedContent.appendChild(wordSpan);
      this.analyzedContent.appendChild(document.createTextNode(' '));
    });

    // Animate appearance
    this.analyzedContent.style.opacity = 0;
    setTimeout(() => {
      this.analyzedContent.style.transition = 'opacity 0.8s ease';
      this.analyzedContent.style.opacity = 1;
    }, 100);
  }

  generateSuggestions(words) {
    this.suggestionsList.innerHTML = '';

    // Get unique words from content
    const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^\w]/g, '')).filter(w => w.length > 3));

    // Get semantic network suggestions
    const semanticNetwork = this.getSemanticSuggestions(uniqueWords);

    // Display suggestions
    semanticNetwork.forEach(suggestion => {
      const tag = document.createElement('div');
      tag.className = 'suggestion-tag';
      tag.innerHTML = `${suggestion.word} <span class="score">${suggestion.relevance}%</span>`;

      tag.addEventListener('click', () => {
        // Insert the word at cursor position in textarea
        const cursorPos = this.contentInput.selectionStart;
        const textBefore = this.contentInput.value.substring(0, cursorPos);
        const textAfter = this.contentInput.value.substring(cursorPos);

        if (/\s$/.test(textBefore) || textBefore === '') {
          this.contentInput.value = textBefore + suggestion.word + textAfter;
        } else {
          this.contentInput.value = textBefore + ' ' + suggestion.word + textAfter;
        }

        // Set focus back to textarea
        this.contentInput.focus();
        this.contentInput.selectionStart = cursorPos + suggestion.word.length + ((/\s$/.test(textBefore) || textBefore === '') ? 0 : 1);
        this.contentInput.selectionEnd = this.contentInput.selectionStart;
      });

      this.suggestionsList.appendChild(tag);
    });

    // Add "Rewrite Content" button
    const rewriteButton = document.createElement('button');
    rewriteButton.id = 'rewrite-btn';
    rewriteButton.textContent = 'Rewrite Content';
    rewriteButton.addEventListener('click', () => this.rewriteContent(semanticNetwork));
    this.suggestionsList.appendChild(rewriteButton);

    return semanticNetwork;
  }

  rewriteContent(suggestions) {
    // Get current content
    const originalContent = this.contentInput.value.trim();
    if (!originalContent) return;

    // Use the new ContentRewriter to rewrite and display content
    const rewrittenContent = this.contentRewriter.rewriteContent(originalContent, suggestions);

    // Show notification
    const notification = document.createElement('div');
    notification.className = 'rewrite-notification';
    notification.textContent = 'Content rewritten with semantic network improvements';
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }

  getSemanticSuggestions(existingWords) {
    // Map of related terms based on content keywords
    const semanticMap = {
      'content': ['strategy', 'marketing', 'creation', 'management', 'quality', 'writing', 'engagement'],
      'optimization': ['improve', 'enhance', 'performance', 'efficiency', 'effective', 'maximize', 'strategy'],
      'seo': ['ranking', 'keywords', 'search', 'algorithm', 'visibility', 'traffic', 'organic'],
      'analysis': ['evaluate', 'assessment', 'metrics', 'data', 'insights', 'performance', 'measure'],
      'text': ['copy', 'content', 'paragraph', 'sentence', 'writing', 'words', 'narrative'],
      'marketing': ['strategy', 'audience', 'brand', 'campaign', 'promotion', 'digital', 'targeting'],
      'keywords': ['targeting', 'relevance', 'search', 'phrases', 'terms', 'ranking', 'density']
    };

    // Extended semantic relationships
    const extendedMap = {
      'blog': ['article', 'post', 'content', 'write', 'publish', 'author'],
      'audience': ['readers', 'viewers', 'customers', 'demographic', 'target', 'segment'],
      'conversion': ['rate', 'goal', 'action', 'optimize', 'funnel', 'sales'],
      'engagement': ['interaction', 'participation', 'comments', 'shares', 'clicks', 'retention'],
      'website': ['page', 'site', 'traffic', 'visitors', 'analytics', 'performance'],
      'writing': ['content', 'copy', 'text', 'words', 'sentences', 'paragraphs']
    };

    const combinedMap = {...semanticMap, ...extendedMap};

    // Collect potential suggestion words
    let potentialSuggestions = [];
    existingWords.forEach(word => {
      if (combinedMap[word]) {
        combinedMap[word].forEach(related => {
          if (!existingWords.has(related)) {
            // Calculate relevance score based on occurrences and existing keywords relation
            let relevance = 70 + Math.floor(Math.random() * 25);

            // Add some weight for keyword related terms
            if (semanticMap[word]) {
              relevance += 5;
            }

            potentialSuggestions.push({
              word: related,
              relevance: relevance
            });
          }
        });
      }
    });

    // Check for content theme and add additional suggestions if specific patterns detected
    const contentStr = Array.from(existingWords).join(' ');
    if (contentStr.includes('blog') || contentStr.includes('article')) {
      ['headline', 'formatting', 'subheadings', 'introduction', 'conclusion']
        .filter(w => !existingWords.has(w))
        .forEach(w => potentialSuggestions.push({
          word: w,
          relevance: 75 + Math.floor(Math.random() * 15)
        }));
    }

    // If we have few suggestions, add some general content terms
    if (potentialSuggestions.length < 5) {
      ['readability', 'comprehension', 'clarity', 'structure', 'audience', 'engagement']
        .filter(w => !existingWords.has(w))
        .forEach(w => potentialSuggestions.push({
          word: w,
          relevance: 65 + Math.floor(Math.random() * 20)
        }));
    }

    // Remove duplicates, prioritizing highest relevance
    const uniqueSuggestions = [];
    const addedWords = new Set();

    potentialSuggestions
      .sort((a, b) => b.relevance - a.relevance)
      .forEach(suggestion => {
        if (!addedWords.has(suggestion.word)) {
          uniqueSuggestions.push(suggestion);
          addedWords.add(suggestion.word);
        }
      });

    // Return top suggestions, limited to 12
    return uniqueSuggestions.slice(0, 12);
  }

  analyzeKeywordDensity(words) {
    if (!this.bigramsList) return;

    // Get bigrams (pairs of consecutive words)
    const bigrams = [];
    for (let i = 0; i < words.length - 1; i++) {
      const word1 = words[i].toLowerCase().replace(/[^\w]/, '');
      const word2 = words[i + 1].toLowerCase().replace(/[^\w]/, '');

      // Skip if either word is too short
      if (word1.length < 3 || word2.length < 3) continue;

      const bigram = `${word1} ${word2}`;
      bigrams.push(bigram);
    }

    // Count occurrences of each bigram
    const bigramCounts = {};
    bigrams.forEach(bigram => {
      bigramCounts[bigram] = (bigramCounts[bigram] || 0) + 1;
    });

    // Sort bigrams by count (descending)
    const sortedBigrams = Object.entries(bigramCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Top 5 most frequent

    // Display results
    this.bigramsList.innerHTML = '';

    if (sortedBigrams.length === 0) {
      this.bigramsList.innerHTML = '<p>No significant bigrams found.</p>';
      return;
    }

    sortedBigrams.forEach(([bigram, count]) => {
      const bigramEl = document.createElement('div');
      bigramEl.className = 'bigram-item';
      bigramEl.innerHTML = `
        <span class="bigram-text">"${bigram}"</span>
        <span class="bigram-count">${count}x</span>
      `;
      this.bigramsList.appendChild(bigramEl);
    });
  }

  createSemanticDistanceMap(words) {
    if (!this.semanticMap) return;

    this.semanticMap.innerHTML = '';

    // Get unique significant words (at least 4 characters)
    const uniqueWords = [...new Set(
      words
        .map(w => w.toLowerCase().replace(/[^\w]/g, ''))
        .filter(w => w.length >= 4)
    )];

    // Limit to max 8 words for readability
    const topWords = uniqueWords.slice(0, 8);

    // Create nodes for each word
    const nodes = [];

    topWords.forEach((word, i) => {
      // Calculate position in a circular layout
      const angle = (i / topWords.length) * Math.PI * 2;
      const radius = this.semanticMap.clientHeight * 0.35;
      const x = 50 + Math.cos(angle) * 40; // percent
      const y = 50 + Math.sin(angle) * 40; // percent

      // Create node element
      const node = document.createElement('div');
      node.className = 'semantic-node';
      node.textContent = word;
      node.style.left = `${x}%`;
      node.style.top = `${y}%`;

      // Add sentiment color if applicable
      if (config.sentiment.positive.includes(word)) {
        node.classList.add('sentiment-positive');
      } else if (config.sentiment.negative.includes(word)) {
        node.classList.add('sentiment-negative');
      }

      this.semanticMap.appendChild(node);
      nodes.push({ word, element: node, x, y });
    });

    // Create connections between related words
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        // Calculate semantic similarity (simplified)
        const similarity = this.calculateSemanticSimilarity(nodes[i].word, nodes[j].word);

        if (similarity > 0.2) { // Only connect if there's meaningful similarity
          const line = document.createElement('div');
          line.className = 'semantic-line';

          // Calculate line position and dimensions
          const x1 = nodes[i].x;
          const y1 = nodes[i].y;
          const x2 = nodes[j].x;
          const y2 = nodes[j].y;

          const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
          const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

          line.style.width = `${length}%`;
          line.style.left = `${x1}%`;
          line.style.top = `${y1}%`;
          line.style.transform = `rotate(${angle}deg)`;
          line.style.opacity = similarity;

          this.semanticMap.appendChild(line);
        }
      }
    }

    // Add central keyword if available
    if (config.sampleKeywords.length > 0) {
      const centralNode = document.createElement('div');
      centralNode.className = 'semantic-node';
      centralNode.textContent = config.sampleKeywords[0];
      centralNode.style.left = '50%';
      centralNode.style.top = '50%';
      centralNode.style.backgroundColor = '#4361ee';
      centralNode.style.fontSize = '1rem';
      centralNode.style.zIndex = '5';

      this.semanticMap.appendChild(centralNode);
    }
  }

  calculateSemanticSimilarity(word1, word2) {
    // Simple implementation - check if words appear together in relevance topics
    let similarity = 0;

    // Check if both words belong to the same relevance topic
    Object.values(config.relevanceTopics).forEach(keywords => {
      if (keywords.includes(word1) && keywords.includes(word2)) {
        similarity += 0.5;
      }
    });

    // Check if both are sentiment words of the same type
    if ((config.sentiment.positive.includes(word1) && config.sentiment.positive.includes(word2)) ||
        (config.sentiment.negative.includes(word1) && config.sentiment.negative.includes(word2))) {
      similarity += 0.3;
    }

    // Check for common prefixes (crude approximation of stemming)
    const prefix = commonPrefix(word1, word2);
    if (prefix.length >= 4) {
      similarity += 0.2;
    }

    // Normalize similarity
    return Math.min(1, similarity);

    // Helper function for common prefix
    function commonPrefix(s1, s2) {
      let i = 0;
      while (i < s1.length && i < s2.length && s1[i] === s2[i]) i++;
      return s1.substring(0, i);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ContentAnalyzer();
});
