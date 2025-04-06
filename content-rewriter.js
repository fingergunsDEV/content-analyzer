/**
 * Content Rewriter module
 * Handles the rewriting of content with suggested words from the semantic network
 */

export default class ContentRewriter {
  constructor(contentInput, rewrittenContentDiv) {
    this.contentInput = contentInput;
    this.rewrittenContentDiv = rewrittenContentDiv;
  }

  /**
   * Rewrites content with suggested words and displays in the rewritten content div
   * @param {string} originalContent - The original content
   * @param {Array} suggestedWords - Array of suggested word objects
   * @param {boolean} highlightAddedWords - Whether to highlight added words
   */
  rewriteContent(originalContent, suggestedWords) {
    if (!originalContent || !suggestedWords || suggestedWords.length === 0) {
      this.rewrittenContentDiv.innerHTML = '<em>No content to rewrite. Please analyze your content first.</em>';
      return;
    }

    // Get words to use in rewrite
    const wordsToUse = suggestedWords
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, Math.min(7, suggestedWords.length))
      .map(s => s.word);

    // Generate rewritten content
    const rewrittenContent = this.generateRewrittenContent(originalContent, wordsToUse);
    
    // Display the rewritten content with highlights
    this.displayRewrittenContent(rewrittenContent, wordsToUse);
    
    return rewrittenContent;
  }

  /**
   * Generates rewritten content with suggested words integrated
   */
  generateRewrittenContent(originalContent, suggestedWords) {
    // Split content into sentences
    const sentences = originalContent.split(/(?<=[.!?])\s+/);
    
    // Enhance each paragraph with suggested words
    let paragraphs = this.splitIntoParagraphs(sentences);
    
    paragraphs = paragraphs.map((paragraph, pIndex) => {
      // Determine which words to use for this paragraph
      const wordsToUse = suggestedWords.filter((_, i) => 
        i % paragraphs.length === pIndex
      );
      
      if (wordsToUse.length === 0) return paragraph;
      
      // Create additional sentence with suggested words
      const newSentence = this.createSentenceWithWords(wordsToUse, paragraph);
      
      // Add the new sentence in an appropriate position
      const paragraphSentences = paragraph.split(/(?<=[.!?])\s+/);
      
      if (paragraphSentences.length > 3) {
        // Insert in the middle for longer paragraphs
        const insertPos = Math.floor(paragraphSentences.length / 2);
        paragraphSentences.splice(insertPos, 0, newSentence);
      } else {
        // Add to the end for shorter paragraphs
        paragraphSentences.push(newSentence);
      }
      
      // Apply humanizing transformations to the entire paragraph
      const enhancedParagraph = paragraphSentences.join(' ');
      return this.humanizeContent(enhancedParagraph);
    });
    
    return paragraphs.join('\n\n');
  }
  
  /**
   * Splits content into paragraphs
   */
  splitIntoParagraphs(sentences) {
    // Split content into paragraphs (simple approach)
    const paragraphs = [];
    let currentParagraph = '';
    
    sentences.forEach(sentence => {
      currentParagraph += sentence + ' ';
      
      // Create a new paragraph after every 3-5 sentences (random)
      if (currentParagraph.split(/(?<=[.!?])\s+/).length >= Math.floor(Math.random() * 3) + 3) {
        paragraphs.push(currentParagraph.trim());
        currentParagraph = '';
      }
    });
    
    // Add any remaining content as the last paragraph
    if (currentParagraph.trim()) {
      paragraphs.push(currentParagraph.trim());
    }
    
    // If no paragraphs were created, treat the whole text as one paragraph
    if (paragraphs.length === 0) {
      paragraphs.push(sentences.join(' '));
    }
    
    return paragraphs;
  }
  
  /**
   * Humanizes content by improving writing style and reducing repetition
   */
  humanizeContent(text) {
    // Break up long sentences
    let humanized = this.breakUpLongSentences(text);
    
    // Vary sentence beginnings
    humanized = this.varySentenceBeginnings(humanized);
    
    // Replace common weak phrases with stronger alternatives
    humanized = this.replaceWeakPhrases(humanized);
    
    // Add transitional phrases between sentences for better flow
    humanized = this.addTransitions(humanized);
    
    return humanized;
  }
  
  /**
   * Breaks up sentences that are too long
   */
  breakUpLongSentences(text) {
    const sentences = text.split(/(?<=[.!?])\s+/);
    
    return sentences.map(sentence => {
      const words = sentence.split(/\s+/);
      
      // If sentence is long, try to break it up
      if (words.length > 25) {
        // Find logical breaking points (after commas, semicolons, etc.)
        const breakPoints = [];
        let sentenceText = sentence;
        
        // Find all potential break points
        let commaIndex = sentenceText.indexOf(', ');
        while (commaIndex !== -1) {
          breakPoints.push(commaIndex);
          commaIndex = sentenceText.indexOf(', ', commaIndex + 1);
        }
        
        // If we have break points, use them
        if (breakPoints.length > 0) {
          // Find middle break point
          const midPoint = breakPoints[Math.floor(breakPoints.length / 2)];
          
          // Break the sentence
          const firstHalf = sentenceText.substring(0, midPoint + 1);
          const secondHalf = sentenceText.substring(midPoint + 2);
          
          // Capitalize first letter of second half
          const secondHalfCapitalized = secondHalf.charAt(0).toUpperCase() + secondHalf.slice(1);
          
          return firstHalf + ' ' + secondHalfCapitalized;
        }
      }
      
      return sentence;
    }).join(' ');
  }
  
  /**
   * Varies sentence beginnings to avoid repetition
   */
  varySentenceBeginnings(text) {
    const sentences = text.split(/(?<=[.!?])\s+/);
    
    // Find repeated beginnings
    const beginnings = sentences.map(s => s.split(' ')[0].toLowerCase());
    const beginningCounts = {};
    
    beginnings.forEach(b => {
      beginningCounts[b] = (beginningCounts[b] || 0) + 1;
    });
    
    // Replacements for common beginnings
    const alternativeBeginnings = {
      'the': ['These', 'Those', 'Such', 'Many'],
      'this': ['That', 'The current', 'This particular', 'Such a'],
      'it': ['This approach', 'This concept', 'This strategy', 'This technique'],
      'there': ['Here', 'In this case', 'At this point', 'Within this context'],
      'a': ['One', 'Any', 'Each', 'Every'],
      'in': ['Throughout', 'Within', 'During', 'Amid'],
      'for': ['To achieve', 'To enable', 'With regard to', 'Concerning'],
      'when': ['Once', 'As soon as', 'After', 'While']
    };
    
    return sentences.map((sentence, i) => {
      const firstWord = sentence.split(' ')[0].toLowerCase();
      
      // If this beginning is repeated and we have alternatives
      if (beginningCounts[firstWord] > 1 && alternativeBeginnings[firstWord]) {
        // Only change some occurrences, not all
        if (Math.random() > 0.5) {
          const alternatives = alternativeBeginnings[firstWord];
          const alternative = alternatives[Math.floor(Math.random() * alternatives.length)];
          
          // Replace beginning with alternative
          return sentence.replace(new RegExp(`^${firstWord}\\b`, 'i'), alternative);
        }
      }
      
      return sentence;
    }).join(' ');
  }
  
  /**
   * Replaces weak phrases with stronger alternatives
   */
  replaceWeakPhrases(text) {
    const weakPhrases = {
      'very important': ['crucial', 'essential', 'vital'],
      'really good': ['excellent', 'outstanding', 'exceptional'],
      'a lot of': ['numerous', 'many', 'abundant'],
      'in order to': ['to', 'for'],
      'due to the fact that': ['because', 'since', 'as'],
      'for the purpose of': ['to', 'for'],
      'in the event that': ['if', 'when', 'should'],
      'in spite of the fact that': ['although', 'though', 'despite'],
      'it is important to note that': ['notably', 'importantly', 'significantly'],
      'needless to say': ['clearly', 'obviously', 'evidently']
    };
    
    let improved = text;
    
    // Replace weak phrases with stronger alternatives
    Object.keys(weakPhrases).forEach(phrase => {
      const alternatives = weakPhrases[phrase];
      const alternative = alternatives[Math.floor(Math.random() * alternatives.length)];
      
      // Use regex to replace phrase (case insensitive)
      const regex = new RegExp(phrase, 'gi');
      improved = improved.replace(regex, alternative);
    });
    
    return improved;
  }
  
  /**
   * Adds transitional phrases between sentences for better flow
   */
  addTransitions(text) {
    const sentences = text.split(/(?<=[.!?])\s+/);
    
    // Only add transitions if we have enough sentences
    if (sentences.length < 3) return text;
    
    // List of transitional phrases by category
    const transitions = {
      addition: ['Furthermore', 'Additionally', 'Moreover', 'Also', 'In addition'],
      contrast: ['However', 'Nevertheless', 'Conversely', 'On the other hand', 'Yet'],
      cause: ['Therefore', 'Consequently', 'As a result', 'Thus', 'Hence'],
      example: ['For example', 'For instance', 'To illustrate', 'Specifically', 'As an example'],
      emphasis: ['Indeed', 'Certainly', 'Notably', 'Significantly', 'Importantly']
    };
    
    // Categories array for easy selection
    const categories = Object.keys(transitions);
    
    // Add transitions to about 30% of sentences
    return sentences.map((sentence, i) => {
      // Skip first sentence and don't add too many transitions
      if (i === 0 || Math.random() > 0.3) return sentence;
      
      // Select random category and transition
      const category = categories[Math.floor(Math.random() * categories.length)];
      const transitionOptions = transitions[category];
      const transition = transitionOptions[Math.floor(Math.random() * transitionOptions.length)];
      
      // Add transition at the beginning of the sentence
      return `${transition}, ${sentence.charAt(0).toLowerCase()}${sentence.slice(1)}`;
    }).join(' ');
  }

  /**
   * Creates a sentence incorporating the suggested words
   */
  createSentenceWithWords(words, contextParagraph) {
    // Templates for sentences incorporating suggested words
    const templates = [
      'Additionally, {word1} is an important aspect to consider in relation to {word2}.',
      'It\'s worth noting that {word1} can significantly impact {word2} in this context.',
      'Research shows that {word1} and {word2} are closely related concepts in effective content strategy.',
      'Experts recommend focusing on {word1} to improve overall {word2}.',
      'Understanding the relationship between {word1} and {word2} can lead to better results.',
      'The combination of {word1} and {word2} creates a more comprehensive approach.',
      'Consider how {word1} influences {word2} for more impactful content.',
      'A strong {word1} strategy enhances {word2} metrics over time.',
      '{word1} plays a key role when optimizing for {word2}.',
      'Many professionals overlook how {word1} contributes to improved {word2}.',
      'Effective use of {word1} naturally strengthens your {word2} positioning.',
      'When implemented correctly, {word1} seamlessly integrates with {word2} strategies.'
    ];
    
    // Select a random template
    let template = templates[Math.floor(Math.random() * templates.length)];
    
    // If we have only one word, modify template
    if (words.length === 1) {
      template = template.replace(' and {word2}', '').replace(' {word2}', ' results');
    }
    
    // Fill in template with words
    let sentence = template.replace('{word1}', words[0] || 'strategy');
    sentence = sentence.replace('{word2}', words[1] || 'effectiveness');
    
    // Incorporate any additional words
    if (words.length > 2) {
      // More natural phrasing for additional words
      const additionalPhrases = [
        `Other relevant factors include ${words.slice(2).join(', ')}.`,
        `Don't forget to consider ${words.slice(2).join(' and ')} as well.`,
        `${words.slice(2).join(', ')} ${words.length > 3 ? 'are' : 'is'} also worth exploring in this context.`,
        `Incorporating ${words.slice(2).join(' alongside ')} can further enhance your results.`
      ];
      
      sentence += ' ' + additionalPhrases[Math.floor(Math.random() * additionalPhrases.length)];
    }
    
    return sentence;
  }

  /**
   * Displays rewritten content with highlighted added words
   */
  displayRewrittenContent(content, addedWords) {
    if (!content) {
      this.rewrittenContentDiv.innerHTML = '<em>No content was generated.</em>';
      return;
    }

    // Replace newlines with paragraph breaks
    let formattedContent = content.replace(/\n\n/g, '</p><p>');
    formattedContent = `<p>${formattedContent}</p>`;

    // Highlight added words
    addedWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      formattedContent = formattedContent.replace(regex, match => `<span class="added-word">${match}</span>`);
    });

    this.rewrittenContentDiv.innerHTML = formattedContent;

    // Animate appearance
    this.rewrittenContentDiv.style.opacity = 0;
    setTimeout(() => {
      this.rewrittenContentDiv.style.transition = 'opacity 0.8s ease';
      this.rewrittenContentDiv.style.opacity = 1;
    }, 100);
  }
}
