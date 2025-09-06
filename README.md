# AI Content Augmenter 

An intelligent Cloudflare Worker that augments any web article on the fly. It uses Workers AI to generate a TL;DR summary and SEO keywords, injecting them directly into the page without modifying the original source.

---

##  Live Demo

This project is live and ready to use!

**URL:** **[https://ai-content-augmenter.manoj-krishna.workers.dev/](https://ai-content-augmenter.manoj-krishna.workers.dev/)**

### How to Use the Demo

Simply append `?url=` to the end of the demo link, followed by the full URL of the article you want to process.

**Example:**
[https://ai-content-augmenter.manoj-krishna.workers.dev/?url=https://en.wikipedia.org/wiki/Cloudflare]

---

## Features

* **AI-Powered Summarization:** Adds a clean, AI-generated TL;DR summary to the top of any article for quick reading.
* **Dynamic SEO Keywords:** Injects relevant `<meta name="keywords">` into the page's `<head>`, improving discoverability for search engines.
* **Runs on the Edge:** Built with Cloudflare Workers for extremely low latency, processing requests in the data center closest to the user.
* **Non-Invasive:** Modifies web content in-flight without ever altering the original source website.

---

## How It Works

This application leverages the power of Cloudflare's developer platform to create an intelligent layer on top of the existing web.

The entire process happens in milliseconds:
1.  A user requests a webpage through the Worker's URL.
2.  The Cloudflare Worker intercepts the request.
3.  It fetches the original page content and extracts the clean text using `HTMLRewriter`.
4.  The text is sent to two different **Workers AI** models in parallel:
    * **`@cf/mistral/mistral-7b-instruct-v0.1`** generates the summary.
    * **`@cf/meta/llama-2-7b-chat-int8`** generates the SEO keywords.
5.  The Worker uses `HTMLRewriter` again to stream the original page back to the user, seamlessly injecting the AI-generated summary and keywords.

---

## Local Development

You can clone this repository and run the project on your local machine.

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18 or later)
* A free [Cloudflare account](https://dash.cloudflare.com)

### Setup & Run
1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/manoj-krishna/ai-content-augmenter.git](https://github.com/manoj-krishna/ai-content-augmenter.git)
    cd ai-content-augmenter
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the local development server:**
    ```bash
    wrangler dev
    ```

4.  **Open your browser** to `http://localhost:8787` and use the same `?url=` format to test.

---

## Key Technologies Used

* **Cloudflare Workers:** Serverless compute platform.
* **Workers AI:** For running machine learning models at the edge.
* **Wrangler CLI:** The command-line tool for Cloudflare Workers.
* **HTMLRewriter:** A streaming HTML parser and rewriter.
* **JavaScript**

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
