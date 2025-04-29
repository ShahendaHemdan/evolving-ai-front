function initializeApp() {
    console.log('App initializing...');
    initChat();
    initDynamicSections();
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Chat functionality remains the same
function initChat() {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    chatForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        addMessageToChat(message, 'user');
        chatInput.value = '';

        setTimeout(() => {
            let botResponse;
            if (message.toLowerCase().includes('latest ai')) {
                botResponse = "The latest AI advancements include multimodal models with enhanced capabilities.";
            } else if (message.toLowerCase().includes('tool')) {
                botResponse = "Check out our latest AI tools section above!";
            } else {
                botResponse = "I can tell you about AI tools and updates. Try asking about 'latest AI tools'.";
            }
            addMessageToChat(botResponse, 'bot');
        }, 1000);
    });

    function addMessageToChat(text, sender) {
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const messageElement = document.createElement('div');
        messageElement.className = `d-flex mb-3 justify-content-${sender === 'user' ? 'end' : 'start'}`;

        const messageContent = document.createElement('div');
        messageContent.className = `p-3 rounded-3 ${sender === 'user' ? 'bg-ai-purple text-white' : 'bg-light text-dark'}`;
        messageContent.style.maxWidth = '75%';

        messageContent.innerHTML = `
            <p class="mb-0">${text}</p>
            <small class="${sender === 'user' ? 'text-white-50' : 'text-muted'}">${time}</small>
        `;

        messageElement.appendChild(messageContent);
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Initialize dynamic sections with free APIs
function initDynamicSections() {
    fetchAITools();
    fetchAIUpdates();
}

// Fetch AI tools from PublicAPIs.org and render
async function fetchAITools() {
    const toolsContainer = document.getElementById('tools-container');
    
    // Show loading spinner
    toolsContainer.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-ai-purple" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2">Loading AI tools...</p></div>';

    try {
        // Option 1: Hugging Face API (most reliable)
        console.log('Trying Hugging Face API...');
        const hfResponse = await fetch('https://huggingface.co/api/models?sort=downloads&direction=-1&limit=8');
        if (!hfResponse.ok) throw new Error(`Hugging Face API error: ${hfResponse.status}`);
        
        const hfData = await hfResponse.json();
        console.log('Hugging Face data received:', hfData);
        
        if (Array.isArray(hfData) && hfData.length > 0) {
            const tools = hfData.map(model => ({
                name: model.modelId.split('/').pop() || model.modelId,
                category: model.tags?.find(tag => !tag.includes(':')) || 'AI Model',
                description: model.pipeline_tag || 'State-of-the-art model',
                image: 'https://huggingface.co/front/assets/huggingface_logo-noborder.svg',
                badge: model.downloads > 1000000 ? 'Popular' : 'New',
                url: `https://huggingface.co/${model.modelId}`
            }));
            return renderTools(tools);
        }

        // Option 2: GitHub API as fallback
        console.log('Trying GitHub API...');
        const ghResponse = await fetch('https://api.github.com/repos/owainlewis/awesome-artificial-intelligence/contents/README.md');
        if (ghResponse.ok) {
            const ghData = await ghResponse.json();
            const markdown = atob(ghData.content);
            const tools = parseToolsFromMarkdown(markdown);
            if (tools.length > 0) {
                return renderTools(tools.slice(0, 8));
            }
        }

        // Option 3: Local tools.json
        console.log('Trying local tools.json...');
        const localResponse = await fetch('tools.json');
        if (localResponse.ok) {
            const localTools = await localResponse.json();
            if (localTools.length > 0) {
                return renderTools(localTools);
            }
        }

        throw new Error('All API sources failed');
        
    } catch (error) {
        console.error('Error in fetchAITools:', error);
        // Fallback to hardcoded tools
        const fallbackTools = [
            {
                "name": "TensorFlow",
                "category": "Machine Learning",
                "description": "Open source library for machine learning",
                "image": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
                "badge": "Popular",
                "url": "https://www.tensorflow.org/"
            },
            {
                "name": "PyTorch",
                "category": "Deep Learning",
                "description": "Open source machine learning framework",
                "image": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
                "badge": "Popular",
                "url": "https://pytorch.org/"
            },
            {
                "name": "Hugging Face",
                "category": "NLP",
                "description": "State-of-the-art NLP models",
                "image": "https://huggingface.co/front/assets/huggingface_logo-noborder.svg",
                "badge": "Trending",
                "url": "https://huggingface.co/"
            }
        ];
        renderTools(fallbackTools);

        // Show error message
        toolsContainer.insertAdjacentHTML('afterbegin', `
            <div class="col-12">
                <div class="alert alert-warning">
                    Couldn't load live tools. Showing sample data.
                    ${error.message}
                </div>
            </div>
        `);
    }
}

// Helper function to parse markdown (same as before)
function parseToolsFromMarkdown(markdown) {
    const tools = [];
    const lines = markdown.split('\n');
    let inToolsSection = false;

    for (const line of lines) {
        if (line.startsWith('## Frameworks and Libraries')) {
            inToolsSection = true;
            continue;
        }
        if (inToolsSection && line.startsWith('##')) {
            break;
        }
        if (inToolsSection && line.startsWith('- [')) {
            const match = line.match(/^- \[(.*?)\]\((.*?)\) - (.*)/);
            if (match) {
                tools.push({
                    name: match[1],
                    category: "AI Framework",
                    description: match[3],
                    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
                    badge: "Open Source",
                    url: match[2]
                });
            }
        }
    }
    return tools;
}

// Fetch AI updates from NewsAPI (requires free API key)
async function fetchAIUpdates() {
    try {
        const updatesContainer = document.getElementById('updates-container');
        updatesContainer.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-ai-purple" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2">Loading AI updates...</p></div>';

        const NEWS_API_KEY = '74745af1fde94a1d872420e5cca7973e'; // Replace with your key
        const response = await fetch(`https://newsapi.org/v2/everything?q=artificial+intelligence&pageSize=3&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`);
        if (!response.ok) throw new Error('Failed to fetch updates');

        const data = await response.json();
        const updates = data.articles.map(article => ({
            title: article.title || 'AI Update',
            category: "AI News",
            description: article.description || 'Latest AI news update',
            date: new Date(article.publishedAt).toLocaleDateString() || new Date().toLocaleDateString(),
            image: article.urlToImage || "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
            url: article.url || '#'
        }));
        renderUpdates(updates);
    } catch (error) {
        console.error('Error fetching AI updates:', error);
        const localUpdates = [
            {
                "title": "New Breakthrough in AI Research",
                "category": "Research",
                "description": "Scientists make progress in neural networks",
                "date": new Date().toLocaleDateString(),
                "image": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
                "url": "#"
            }
        ];
        renderUpdates(localUpdates);
    }
}

// Render functions remain the same
function renderTools(tools) {
    const container = document.getElementById('tools-container');
    if (!container) return;

    container.innerHTML = '';

    if (tools.length === 0) {
        container.innerHTML = '<div class="col-12 text-center py-5"><p>No tools available</p></div>';
        return;
    }

    tools.forEach(tool => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-3 mb-4';
        col.innerHTML = `
            <div class="card h-100 border-0 shadow-sm card-hover">
                <div class="position-relative">
                    <img src="${tool.image}" class="card-img-top" alt="${tool.name}" style="height: 180px; object-fit: cover;">
                    ${tool.badge ? `<span class="position-absolute top-0 end-0 bg-ai-purple text-white px-2 py-1 m-2 rounded-pill fs-6">${tool.badge}</span>` : ''}
                </div>
                <div class="card-body">
                    <span class="badge bg-secondary mb-2">${tool.category}</span>
                    <h5 class="card-title">${tool.name}</h5>
                    <p class="card-text">${tool.description}</p>
                </div>
                <div class="card-footer bg-white border-0">
                    <a href="${tool.url}" class="btn ai-btn w-100">Try Now</a>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}

function renderUpdates(updates) {
    const container = document.getElementById('updates-container');
    if (!container) return;

    container.innerHTML = '';

    if (updates.length === 0) {
        container.innerHTML = '<div class="col-12 text-center py-5"><p>No updates available</p></div>';
        return;
    }

    updates.forEach(update => {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6 mb-4';
        col.innerHTML = `
            <div class="card h-100 border-0 shadow-sm card-hover">
                <img src="${update.image}" class="card-img-top" alt="${update.title}" style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-ai-purple">${update.category}</span>
                        <small class="text-muted">${update.date}</small>
                    </div>
                    <h5 class="card-title">${update.title}</h5>
                    <p class="card-text">${update.description}</p>
                </div>
                <div class="card-footer bg-white border-0">
                    <a href="${update.url}" class="btn btn-outline-secondary w-100">Read More</a>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}