export default {
  async fetch(request, env){
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    // Simple check for the 'url' parameter
    if (!targetUrl) {
      return new Response('Usage: ?url=https://example.com/blog-post', { status: 400 });
    }

    // Fetch the original content from the target URL
    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3' }
    });

    // --- Part 1: Extract Clean Text for the AI ---
    let articleText = '';
    const textExtractor = new HTMLRewriter().on('article p, article div, main p, main div', {
        text(text) {
            if (text.text) {
               articleText += text.text + ' ';
            }
        },
    });

    // Clone the response to read it here and also send it to the user later
    await textExtractor.transform(response.clone()).text();
    // Truncate text to stay within AI model limits
    const textForAI = articleText.slice(0, 6000);


    // --- Part 2: Run AI Models in Parallel for speed ---
    let summaryResult = { summary: '' };
    let keywordsResult = { response: '' };

    try {
        [summaryResult, keywordsResult] = await Promise.all([
            // Summarization model call
            env.AI.run('@cf/mistral/mistral-7b-instruct-v0.1', {
				prompt: `Generate a concise, one-paragraph summary of the following text:\n\n${textForAI}`,
				max_tokens: 250
			}),

            // Keyword generation model call
            env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
                prompt: `Based on the following article text, generate 7-10 relevant SEO keywords, separated by commas:\n\n${textForAI}`
            })
        ]);
    } catch (error) {
        console.error("AI call failed:", error);
    }


    // --- Part 3: Inject the AI Content back into the page ---
    const summaryText = summaryResult.response || 'Could not generate summary.';
    
    let generatedKeywords = [];
    const rawKeywords = keywordsResult.response || '';

    // A more robust cleanup using a regular expression
    generatedKeywords = rawKeywords
        .replace(/.*:/, '') 
        .split(',') 
        .map(k => k.trim()) 
        .filter(Boolean); 

    if (generatedKeywords.length > 10) {
        generatedKeywords.length = 10;
    }

    const augmenter = new HTMLRewriter()
      .on('head', {
        element(element) {
			const baseHref = new URL(targetUrl).origin;
      		element.prepend(`<base href="${baseHref}" />`, { html: true });
			
          	generatedKeywords.forEach(keyword => {
            if (keyword) {
              element.append(`<meta name="keywords" content="${keyword.trim()}">`, { html: true });
            }
          });
        }
      })
      .on('body', {
        element(element) {
          const summaryBox = `
            <div style="background: #f0f8ff; border: 2px solid #b0e0e6; padding: 15px; margin: 20px auto; border-radius: 8px; font-family: sans-serif; max-width: 800px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h3 style="margin-top: 0; color: #005f73;">AI-Generated Summary (TL;DR)</h3>
              <p style="color: #0a9396;">${summaryText}</p>
            </div>
          `;
          element.prepend(summaryBox, { html: true });
        }
      });

    return augmenter.transform(response);
  },
};