// Simple AI Chat Bot Service
// This bot responds to user messages with helpful replies
import mongoose from "mongoose";

const BOT_NAME = "Songify Bot";
// Create a consistent ObjectId for the bot (using a fixed 24-character hex string)
// Using a valid MongoDB ObjectId format - must be exactly 24 hex characters
const BOT_USER_ID = new mongoose.Types.ObjectId("000000000000000000000001");

// Search for songs and albums in the database
const searchMusic = async (songModel, albumModel, query) => {
  const searchTerm = query.trim();
  if (!searchTerm || searchTerm.length < 2) return null;

  try {
    // Search for songs
    const songs = await songModel.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { album: { $regex: searchTerm, $options: 'i' } }
      ]
    }).limit(5).select('name album _id');

    // Search for albums
    const albums = await albumModel.find({
      name: { $regex: searchTerm, $options: 'i' }
    }).limit(5).select('name _id');

    return { songs, albums };
  } catch (error) {
    console.error('Error searching music:', error);
    return null;
  }
};

// Enhanced AI Chat Bot with contextual understanding
const getBotResponse = (userMessage) => {
  const message = userMessage.toLowerCase().trim();
  const words = message.split(/\s+/);
  
  // Extract key terms
  const hasQuestion = /[?]/.test(userMessage) || /^(what|how|when|where|why|who|which|can|could|would|should|is|are|do|does|did)/.test(message);
  const hasGreeting = /^(hi|hello|hey|hlo|ho|greetings|good morning|good afternoon|good evening)/.test(message);
  const hasThanks = /(thanks|thank you|ty|appreciate|thx)/.test(message);
  const hasGoodbye = /(bye|goodbye|see you|later|cya|farewell|see ya)/.test(message);
  
  // Music-related keywords
  const musicKeywords = {
    genres: ['rock', 'pop', 'jazz', 'classical', 'hip hop', 'rap', 'country', 'blues', 'electronic', 'edm', 'reggae', 'folk', 'metal', 'punk', 'r&b', 'soul', 'gospel', 'latin', 'k-pop', 'indie'],
    actions: ['play', 'listen', 'find', 'search', 'download', 'stream', 'share', 'upload', 'create', 'make'],
    entities: ['song', 'songs', 'music', 'track', 'tracks', 'album', 'albums', 'playlist', 'playlists', 'artist', 'artists', 'singer', 'band', 'genre', 'genres']
  };
  
  // Extract genre mentions
  const mentionedGenres = musicKeywords.genres.filter(genre => message.includes(genre));
  const mentionedActions = musicKeywords.actions.filter(action => message.includes(action));
  const mentionedEntities = musicKeywords.entities.filter(entity => message.includes(entity));
  
  // Greetings
  if (hasGreeting) {
    if (message.includes('how are you') || message.includes('how\'s it going')) {
      return "I'm doing great, thanks for asking! 😊 I'm here to help you discover amazing music. What would you like to explore today? 🎵";
    }
    return "Hello! 👋 Welcome to Songify! I'm here to help you discover great music. What can I help you with today? 🎶";
  }
  
  // Thank you responses
  if (hasThanks) {
    if (message.includes('so much') || message.includes('a lot')) {
      return "You're very welcome! 😊 I'm always here to help. Enjoy your music journey! 🎧";
    }
    return "You're welcome! 🎵 Happy to help! Is there anything else you'd like to know about music? 🎶";
  }
  
  // Goodbye
  if (hasGoodbye) {
    return "See you later! 🎵 Keep the music playing and enjoy your day! 🎧";
  }
  
  // Questions about specific genres
  if (mentionedGenres.length > 0) {
    const genre = mentionedGenres[0];
    if (hasQuestion) {
      if (message.includes('recommend') || message.includes('suggest') || message.includes('best')) {
        return `Great choice! ${genre.charAt(0).toUpperCase() + genre.slice(1)} music is awesome! 🎵 You can search for "${genre}" in our search bar to find ${genre} songs and albums. What specific ${genre} artists are you interested in? 🎶`;
      }
      return `I love ${genre} music! 🎵 You can explore ${genre} songs by searching in our search bar or browsing albums. What would you like to know about ${genre}? 🎶`;
    }
    return `Nice! ${genre.charAt(0).toUpperCase() + genre.slice(1)} is a great genre! 🎵 Try searching for "${genre}" to find related music. What ${genre} artists do you like? 🎶`;
  }
  
  // Questions about finding/playing music
  if (mentionedActions.some(action => ['play', 'listen', 'find', 'search'].includes(action)) && mentionedEntities.length > 0) {
    const entity = mentionedEntities[0];
    if (entity === 'song' || entity === 'songs' || entity === 'track' || entity === 'tracks') {
      return "You can find songs by using the search bar at the top! 🔍 Just type the song name or artist, and you'll see results. You can also browse albums to discover new music. What song are you looking for? 🎵";
    }
    if (entity === 'album' || entity === 'albums') {
      return "To find albums, use the search feature or browse the 'Browse' section! 🎵 You can explore different albums and see all the songs in them. Which album are you interested in? 🎶";
    }
    if (entity === 'playlist' || entity === 'playlists') {
      return "Playlists are a great way to organize your favorite music! 🎵 You can create your own playlists by adding songs you like. Would you like to know how to create a playlist? 🎶";
    }
    if (entity === 'artist' || entity === 'artists') {
      return "To find artists, just search for their name in the search bar! 🔍 You'll see their songs and albums. Which artist are you looking for? 🎵";
    }
  }
  
  // Upload questions
  if (message.includes('upload') || message.includes('add song') || message.includes('add music')) {
    return "To upload your own music, go to the 'Your Uploads' section! 🎵 There you can add songs and albums. Make sure you have the audio file ready. Need help with the upload process? 🎶";
  }
  
  // Search functionality questions
  if (message.includes('search') || message.includes('find') || message.includes('look for')) {
    return "You can search for music using the search bar at the top of the page! 🔍 Just type the song name, artist, or album you're looking for. What would you like to search for? 🎵";
  }
  
  // General music questions
  if (hasQuestion && mentionedEntities.length > 0) {
    if (message.includes('what') && message.includes('best') || message.includes('recommend')) {
      return "I'd love to recommend music! 🎵 Try exploring different genres in the Browse section, or search for artists you already like. What kind of music are you in the mood for? 🎶";
    }
    if (message.includes('how') && (message.includes('use') || message.includes('work') || message.includes('do'))) {
      return "Songify is easy to use! 🎵 You can search for music, browse albums, upload your own songs, and chat with other music lovers. What specific feature would you like to know about? 🎶";
    }
  }
  
  // Feature questions
  if (message.includes('feature') || message.includes('can i') || message.includes('what can')) {
    return "Songify has many features! 🎵 You can search and play music, browse albums, upload your own songs, create playlists, and chat with the community. Which feature interests you most? 🎶";
  }
  
  // Compliments or positive feedback
  if (message.match(/(love|like|enjoy|awesome|great|amazing|cool|nice|good|wonderful|fantastic|excellent)/)) {
    return "That's wonderful to hear! 😊 I'm glad you're enjoying Songify! 🎵 Is there anything specific you'd like help with? 🎶";
  }
  
  // Negative feedback or problems
  if (message.match(/(problem|issue|error|bug|broken|not working|doesn't work|cant|can't|cannot)/)) {
    return "I'm sorry to hear you're having trouble! 😔 Can you tell me more about what's not working? I'll do my best to help you resolve it. 🎵";
  }
  
  // Questions about the app/website
  if (hasQuestion && (message.includes('app') || message.includes('website') || message.includes('songify'))) {
    return "Songify is a music streaming platform where you can discover, play, and share music! 🎵 You can search for songs, browse albums, upload your own music, and connect with other music lovers. What would you like to know more about? 🎶";
  }
  
  // If message is very short (1-2 words) and not recognized
  if (words.length <= 2 && !hasQuestion) {
    if (message === 'ok' || message === 'okay' || message === 'k' || message === 'kk') {
      return "Got it! 😊 What would you like to explore? 🎵";
    }
    if (message === 'yes' || message === 'yeah' || message === 'yep' || message === 'yup') {
      return "Great! 🎵 What can I help you with? 🎶";
    }
    if (message === 'no' || message === 'nope' || message === 'nah') {
      return "No problem! 😊 Let me know if you need anything else! 🎵";
    }
  }
  
  // Contextual response based on message length and content
  if (hasQuestion) {
    // If it's a question but we don't have specific context
    if (message.length > 20) {
      return "That's an interesting question! 🤔 I'm here to help with music-related topics. You can search for songs, browse albums, or upload your own music. Could you tell me more specifically what you're looking for? 🎵";
    }
    return "I'd be happy to help! 🎵 What specifically would you like to know about music or Songify? 🎶";
  }
  
  // If message mentions specific music terms but isn't a question
  if (mentionedEntities.length > 0 || mentionedActions.length > 0) {
    return `I see you're interested in music! 🎵 ${mentionedEntities.length > 0 ? `You mentioned ${mentionedEntities[0]}s. ` : ''}You can search for music using the search bar, or browse albums to discover new songs. What would you like to explore? 🎶`;
  }
  
  // Default contextual response - analyze the message
  if (message.length < 10) {
    return "I'm here to help you with music! 🎵 What would you like to know or explore? 🎶";
  }
  
  // For longer messages, provide a helpful response
  return `Thanks for your message! 🎵 I'm here to help you discover and enjoy music. You can search for songs, browse albums, upload your own music, or chat with other music lovers. What specific help do you need? 🎶`;
};

// Enhanced bot response with music search capability
const getBotResponseWithSearch = async (userMessage, songModel, albumModel) => {
  const message = userMessage.toLowerCase().trim();
  const words = message.split(/\s+/);
  
  // Check if user is asking about a specific song or album
  let searchQuery = null;
  
  // Pattern 1: Quoted names (e.g., "Song Name" or 'Album Name')
  const quotedMatch = userMessage.match(/["'](.+?)["']/);
  if (quotedMatch) {
    searchQuery = quotedMatch[1].trim();
  }
  
  // Pattern 2: Direct requests (e.g., "play Song Name", "find Album Name")
  if (!searchQuery) {
    const directPatterns = [
      /(?:play|find|search|show|listen to|want|looking for|need|get|show me)\s+(?:the\s+)?(?:song|track|album|music)?\s*(?:called|named|titled)?\s*["']?([^"']+?)["']?(?:\s|$)/i,
      /(?:song|track|album|music)\s+(?:called|named|titled|by)\s+["']?([^"']+?)["']?/i
    ];
    
    for (const pattern of directPatterns) {
      const match = userMessage.match(pattern);
      if (match && match[1]) {
        const extracted = match[1].trim();
        if (extracted.length > 2 && extracted.length < 100) {
          searchQuery = extracted;
          break;
        }
      }
    }
  }
  
  // Pattern 3: Simple requests without keywords (e.g., "Song Name", "Album Name")
  if (!searchQuery) {
    // Remove common words and check if remaining looks like a name
    const cleaned = userMessage
      .replace(/^(?:play|find|search|show|listen to|want|looking for|need|get|show me|i want|i need|can you|please)\s+/i, '')
      .replace(/\s+(?:song|track|album|music|please|thanks|thank you).*$/i, '')
      .trim();
    
    // If cleaned message is 3-50 chars and doesn't look like a question, treat as search
    if (cleaned.length >= 3 && cleaned.length <= 50 && !cleaned.endsWith('?')) {
      // Check if it contains mostly letters (likely a name)
      const letterRatio = cleaned.replace(/[^a-z\s]/gi, '').length / cleaned.length;
      if (letterRatio > 0.6) {
        searchQuery = cleaned;
      }
    }
  }
  
  // Pattern 4: Capitalized words (likely song/album names)
  if (!searchQuery && words.length <= 6) {
    const capitalizedWords = userMessage.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
    if (capitalizedWords && capitalizedWords.length > 0) {
      // Filter out common words
      const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
      const filtered = capitalizedWords.filter(w => !commonWords.includes(w.toLowerCase()));
      if (filtered.length > 0) {
        searchQuery = filtered.join(' ');
      }
    }
  }
  
  // Search for music if we have a query
  if (searchQuery) {
    const results = await searchMusic(songModel, albumModel, searchQuery);
    
    if (results) {
      const { songs, albums } = results;
      
      if (songs.length > 0 || albums.length > 0) {
        let response = `I found ${songs.length + albums.length} result${songs.length + albums.length > 1 ? 's' : ''} for "${searchQuery}"! 🎵\n\n`;
        
        if (songs.length > 0) {
          response += `🎵 Songs:\n`;
          songs.slice(0, 3).forEach((song, index) => {
            response += `${index + 1}. "${song.name}" (Album: ${song.album})\n`;
          });
          if (songs.length > 3) {
            response += `   ... and ${songs.length - 3} more song${songs.length - 3 > 1 ? 's' : ''}\n`;
          }
          response += `\n💡 To play: Type "${songs[0].name}" in the search bar at the top!\n\n`;
        }
        
        if (albums.length > 0) {
          response += `📀 Albums:\n`;
          albums.slice(0, 3).forEach((album, index) => {
            response += `${index + 1}. "${album.name}"\n`;
          });
          if (albums.length > 3) {
            response += `   ... and ${albums.length - 3} more album${albums.length - 3 > 1 ? 's' : ''}\n`;
          }
          response += `\n💡 To find: Search for "${albums[0].name}" in the search bar or browse albums!\n\n`;
        }
        
        response += "🎶 Just type the name in the search bar at the top to play!";
        return response;
      } else {
        return `I couldn't find "${searchQuery}" in our library. 😔\n\nTry:\n• Searching in the search bar at the top\n• Checking the Browse section for similar music\n• Uploading it if you have the file! 🎵`;
      }
    }
  }
  
  // Fall back to regular bot response
  return getBotResponse(userMessage);
};

export { BOT_NAME, BOT_USER_ID, getBotResponse, getBotResponseWithSearch };

