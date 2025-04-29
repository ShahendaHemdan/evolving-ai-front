function initializeApp() {
    console.log('App initializing...');
    initDynamicSections();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Initialize all sections
async function initDynamicSections() {
    try {
        await Promise.all([
            fetchAITools(),
            fetchAIUpdates(),
            fetchAIEditors()
        ]);
    } catch (error) {
        console.error('Error loading sections:', error);
    }
}

// ======================
// 1. AI TOOLS SECTION (Public APIs)
// ======================
async function fetchAITools() {
    const toolsContainer = document.getElementById('tools-container');
    toolsContainer.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-ai-purple" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2">Loading AI tools...</p></div>';

    try {
        // Try Public APIs
        const response = await fetch('https://api.publicapis.org/entries?category=artificial_intelligence&https=true');
        if (!response.ok) throw new Error('Public APIs failed');

        const data = await response.json();
        const tools = data.entries.slice(0, 6).map(entry => ({
            name: entry.API,
            description: entry.Description || "AI service",
            image: `https://logo.clearbit.com/${new URL(entry.Link).hostname}`,
            badge: "Free",
            url: entry.Link,
            category: "AI Tool"
        }));

        renderTools(tools);
    } catch (error) {
        console.error('Error fetching tools:', error);
        // Fallback to GitHub API
        try {
            const ghResponse = await fetch('https://api.github.com/search/repositories?q=topic:ai-tools&sort=stars&order=desc');
            if (!ghResponse.ok) throw new Error('GitHub API failed');

            const ghData = await ghResponse.json();
            const tools = ghData.items.slice(0, 6).map(item => ({
                name: item.name,
                description: item.description || "AI tool",
                image: item.owner.avatar_url,
                url: item.html_url,
                badge: "GitHub",
                category: "AI Tool"
            }));
            renderTools(tools);
        } catch (ghError) {
            console.error('GitHub fallback failed:', ghError);
            // Ultimate fallback to static data
            // const fallbackTools = [
            //     {
            //         name: "Hugging Face",
            //         description: "Open-source AI models and datasets",
            //         image: "https://huggingface.co/front/assets/huggingface_logo.svg",
            //         badge: "Popular",
            //         url: "https://huggingface.co",
            //         category: "AI Platform"
            //     },
            //     {
            //         name: "TensorFlow",
            //         description: "Open source machine learning framework",
            //         image: "https://www.tensorflow.org/images/tf_logo_social.png",
            //         badge: "Google",
            //         url: "https://www.tensorflow.org",
            //         category: "ML Framework"
            //     }
            // ];
            // renderTools(fallbackTools);
            toolsContainer.innerHTML += '<div class="col-12"><div class="alert alert-warning mt-3">Using fallback tools data</div></div>';
        }
    }
}

// ======================
// 2. AI NEWS SECTION (Alternative Free API)
// ======================
async function fetchAIUpdates() {
    const updatesContainer = document.getElementById('updates-container');
    updatesContainer.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-ai-purple" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2">Loading AI news...</p></div>';

    try {
        // Using NewsAPI.org (requires free API key)
        const API_KEY = '74745af1fde94a1d872420e5cca7973e'; // Get from https://newsapi.org/
        const response = await fetch(`https://newsapi.org/v2/everything?q=AI&pageSize=3&apiKey=${API_KEY}`);
        if (!response.ok) throw new Error('News API failed');

        const data = await response.json();
        const updates = data.articles.map(article => ({
            title: article.title,
            description: article.description || "Latest AI news",
            image: article.urlToImage || "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
            url: article.url,
            date: new Date(article.publishedAt).toLocaleDateString(),
            category: "AI News"
        }));

        renderUpdates(updates);
    } catch (error) {
        console.error('Error fetching news:', error);
        // Fallback to static data
        // const fallbackNews = [
        //     {
        //         title: "AI Breakthrough in Healthcare",
        //         description: "Researchers develop new AI model for disease detection",
        //         image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef",
        //         url: "#",
        //         date: new Date().toLocaleDateString(),
        //         category: "Research"
        //     }
        // ];
        // renderUpdates(fallbackNews);
        updatesContainer.innerHTML += '<div class="col-12"><div class="alert alert-warning mt-3">Using fallback news data</div></div>';
    }
}

// ======================
// 3. AI EDITORS SECTION (GitHub API)
// ======================
async function fetchAIEditors() {
    const editorsContainer = document.getElementById('editors-container');
    editorsContainer.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-ai-purple" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2">Loading AI editors...</p></div>';

    try {
        const response = await fetch('https://api.github.com/search/repositories?q=topic:ai-editor');
        if (!response.ok) throw new Error('GitHub API failed');

        const data = await response.json();
        const editors = data.items.slice(0, 6).map(item => ({
            name: item.name,
            description: item.description || "AI-powered code editor",
            image: item.owner.avatar_url,
            url: item.html_url,
            badge: "GitHub"
        }));

        renderEditors(editors);
    } catch (error) {
        console.error('Error fetching editors:', error);
        // Fallback to static data
        // const fallbackEditors = [
        //     {
        //         name: "VS Code + Copilot",
        //         description: "AI pair programming in VS Code",
        //         image: "https://code.visualstudio.com/assets/images/code-stable.png",
        //         url: "https://code.visualstudio.com",
        //         badge: "Popular"
        //     }
        // ];
        // renderEditors(fallbackEditors);
        editorsContainer.innerHTML += '<div class="col-12"><div class="alert alert-warning mt-3">Using fallback editor data</div></div>';
    }
}

// ======================
// RENDER FUNCTIONS (unchanged)
// ======================
function renderTools(tools) {
    const container = document.getElementById('tools-container');
    if (!container) return;
    container.innerHTML = '';

    tools.forEach(tool => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-3 mb-4';
        col.innerHTML = `
            <div class="card h-100 border-0 shadow-sm card-hover">
                <div class="position-relative">
                    <img src="${tool.image}" class="card-img-top" alt="${tool.name}" style="height: 180px; object-fit: contain; background: #f8f9fa; padding: 10px;">
                    ${tool.badge ? `<span class="position-absolute top-0 end-0 bg-ai-purple text-white px-2 py-1 m-2 rounded-pill fs-6">${tool.badge}</span>` : ''}
                </div>
                <div class="card-body">
                    <span class="badge bg-secondary mb-2">${tool.category}</span>
                    <h5 class="card-title">${tool.name}</h5>
                    <p class="card-text">${tool.description}</p>
                </div>
                <div class="card-footer bg-white border-0">
                    <a href="${tool.url}" class="btn ai-btn w-100" target="_blank">Try Now</a>
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

function renderEditors(editors) {
    const container = document.getElementById('editors-container');
    if (!container) return;
    container.innerHTML = '';

    editors.forEach(editor => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        col.innerHTML = `
            <div class="card h-100 border-0 shadow-sm card-hover">
                <div class="position-relative">
                    <img src="${editor.image}" class="card-img-top" alt="${editor.name}" style="height: 180px; object-fit: contain; padding: 20px; background: #f8f9fa;">
                    ${editor.badge ? `<span class="position-absolute top-0 end-0 bg-ai-purple text-white px-2 py-1 m-2 rounded-pill fs-6">${editor.badge}</span>` : ''}
                </div>
                <div class="card-body">
                    <h5 class="card-title">${editor.name}</h5>
                    <p class="card-text">${editor.description}</p>
                </div>
                <div class="card-footer bg-white border-0">
                    <a href="${editor.url}" class="btn ai-btn w-100" target="_blank">Learn More</a>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}