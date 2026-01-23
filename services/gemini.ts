
import { Language } from "../types";

export class GoogleTranslateService {
  private readonly apiEndpoint = '/api/translation/translate';

  async translateText(text: string, targetLanguage: Language): Promise<string> {
    if (targetLanguage === 'en' || !text.trim()) return text;

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          to: targetLanguage,
          from: 'en'
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        return data.data.translatedText || text;
      }
      return text;
    } catch (error) {
      console.error("Translation Error:", error);
      return text;
    }
  }

  async translateBatch(texts: string[], targetLanguage: Language): Promise<string[]> {
    if (targetLanguage === 'en' || texts.length === 0) return texts;

    // Process in smaller batches to avoid rate limits and improve reliability
    const batchSize = 5;
    const results: string[] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchPromises = batch.map(text => this.translateText(text, targetLanguage));

      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        console.error(`Batch translation error for batch ${i / batchSize}:`, error);
        // On batch failure, add original texts
        results.push(...batch);
      }

      // Small delay between batches to be respectful to the API
      if (i + batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  translateTextWithLinks(text: string, targetLanguage: Language): Promise<string> {
    // Enhanced regex to find various URL patterns
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|\b[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\b)/g;
    const links: string[] = [];
    let linkIndex = 0;

    // Replace links with unique placeholders
    const textWithoutLinks = text.replace(urlRegex, (match) => {
      links.push(match);
      return `__GT_LINK_${linkIndex++}__`;
    });

    // Translate the text without links
    return this.translateText(textWithoutLinks, targetLanguage).then(translatedText => {
      // Restore links with improved replacement
      return translatedText.replace(/__GT_LINK_(\d+)__/g, (match, index) => {
        const linkIndex = parseInt(index);
        return links[linkIndex] || match;
      });
    });
  }

  async translateBatchWithLinks(texts: string[], targetLanguage: Language): Promise<string[]> {
    const promises = texts.map(text => this.translateTextWithLinks(text, targetLanguage));
    return Promise.all(promises);
  }

  // Utility method to check if translation service is available
  async isServiceAvailable(): Promise<boolean> {
    try {
      await this.translateText('test', 'sw');
      return true;
    } catch {
      return false;
    }
  }
}

export const googleTranslateService = new GoogleTranslateService();
