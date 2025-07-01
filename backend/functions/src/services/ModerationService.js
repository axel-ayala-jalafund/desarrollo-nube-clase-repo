class ModerationService {
  constructor() {
    // Banned words
    this.bannedWords = [
      "evo",
      "arce",
      "mesa",
      "camacho",

      "idiota",
      "estúpido",
      "tonto",
      "bobo",
      "pendejo",
      "hijo de puta",
      "hdp",
      "carajo",
      "mierda",
      "joder",
      "puto",
      "puta",
      "cabrón",
      "cabron",
      "bastardo",
      "imbécil",
      "imbecil",

      "h1j0",
      "put4",
      "m13rd4",
      "1d10t4",
      "3st0p1d0",

      "odio",
      "muerte",
      "matar",
      "asesino",

      "corrupto",
      "ladrón",
      "ladron",
    ];

    this.replacementText = "[REDACTED]";
  }


  hasInappropriateContent(text) {
    if (!text || typeof text !== "string") {
      return false;
    }

    const lowerText = text.toLowerCase();

    return this.bannedWords.some((word) => {
      const regex = new RegExp(`\\b${word.toLowerCase()}\\b`, "i");
      return regex.test(lowerText);
    });
  }

  moderateText(text) {
    if (!text || typeof text !== "string") {
      return text;
    }

    let moderatedText = text;

    this.bannedWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      moderatedText = moderatedText.replace(regex, this.replacementText);
    });

    return moderatedText;
  }

  moderatePost(post) {
    const moderatedPost = {...post};

    if (post.title) {
      moderatedPost.title = this.moderateText(post.title);
    }

    if (post.content) {
      moderatedPost.content = this.moderateText(post.content);
    }

    const originalTitle = post.title || "";
    const originalContent = post.content || "";
    const hasChanges =
      moderatedPost.title !== originalTitle ||
      moderatedPost.content !== originalContent;

    if (hasChanges) {
      moderatedPost.moderated = true;
      moderatedPost.moderatedAt = new Date().toISOString();
    }

    return moderatedPost;
  }

  addBannedWords(words) {
    if (Array.isArray(words)) {
      this.bannedWords.push(...words.map((word) => word.toLowerCase()));
      this.bannedWords = [...new Set(this.bannedWords)];
    }
  }

  getBannedWords() {
    return [...this.bannedWords]; 
  }

  setReplacementText(newReplacementText) {
    this.replacementText = newReplacementText || "[REDACTED]";
  }
}

module.exports = {ModerationService};
