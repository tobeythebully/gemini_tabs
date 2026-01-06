// ============================================
// STORAGE MANAGER
// ============================================
class StorageManager {
    static get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch {
            return defaultValue;
        }
    }

    static set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
}

// ============================================
// BOOKMARK MANAGER
// ============================================
class BookmarkManager {
    constructor() {
        this.bookmarks = StorageManager.get('bookmarks', []);
        this.bookmarkList = document.getElementById('bookmarkList');
        this.bookmarksList = document.getElementById('bookmarksList');
        this.render();
    }

    add(title, url) {
        const bookmark = {
            id: `bm_${Date.now()}`,
            title: title || 'Untitled',
            url: url,
            createdAt: new Date().toISOString()
        };
        this.bookmarks.push(bookmark);
        this.save();
        this.render();
        return bookmark;
    }

    update(id, newTitle) {
        const bookmark = this.bookmarks.find(b => b.id === id);
        if (bookmark) {
            bookmark.title = newTitle;
            this.save();
            this.render();
        }
    }

    delete(id) {
        this.bookmarks = this.bookmarks.filter(b => b.id !== id);
        this.save();
        this.render();
    }

    isBookmarked(url) {
        return this.bookmarks.some(b => b.url === url);
    }

    getByUrl(url) {
        return this.bookmarks.find(b => b.url === url);
    }

    save() {
        StorageManager.set('bookmarks', this.bookmarks);
    }

    render() {
        // Render bookmark bar
        if (this.bookmarks.length === 0) {
            this.bookmarkList.innerHTML = '<span class="bookmark-empty">북마크가 없습니다. 탭에서 ⭐를 눌러 추가하세요.</span>';
        } else {
            this.bookmarkList.innerHTML = this.bookmarks.map(b => `
                <div class="bookmark-item" data-url="${b.url}" data-id="${b.id}">
                    <span class="bookmark-star">⭐</span>
                    <span class="bookmark-title">${b.title}</span>
                    <span class="bookmark-delete" data-id="${b.id}">✕</span>
                </div>
            `).join('');

            // Add click handlers
            this.bookmarkList.querySelectorAll('.bookmark-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    if (e.target.classList.contains('bookmark-delete')) {
                        e.stopPropagation();
                        this.delete(e.target.dataset.id);
                    } else {
                        window.tabManager.navigateToUrl(item.dataset.url);
                    }
                });
            });
        }

        // Render settings list
        if (this.bookmarksList) {
            if (this.bookmarks.length === 0) {
                this.bookmarksList.innerHTML = '<div class="list-empty">저장된 북마크가 없습니다</div>';
            } else {
                this.bookmarksList.innerHTML = this.bookmarks.map(b => `
                    <div class="list-item" data-id="${b.id}">
                        <div class="list-item-content">
                            <div class="list-item-title">${b.title}</div>
                            <div class="list-item-subtitle">${b.url}</div>
                        </div>
                        <div class="list-item-actions">
                            <button class="edit" data-id="${b.id}">수정</button>
                            <button class="delete" data-id="${b.id}">삭제</button>
                        </div>
                    </div>
                `).join('');

                // Add handlers
                this.bookmarksList.querySelectorAll('.edit').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const id = btn.dataset.id;
                        const bookmark = this.bookmarks.find(b => b.id === id);
                        const newTitle = prompt('북마크 제목 수정:', bookmark.title);
                        if (newTitle !== null && newTitle.trim()) {
                            this.update(id, newTitle.trim());
                        }
                    });
                });

                this.bookmarksList.querySelectorAll('.delete').forEach(btn => {
                    btn.addEventListener('click', () => {
                        if (confirm('이 북마크를 삭제하시겠습니까?')) {
                            this.delete(btn.dataset.id);
                        }
                    });
                });
            }
        }
    }
}

// ============================================
// PROMPT MANAGER
// ============================================
class PromptManager {
    constructor() {
        this.prompts = StorageManager.get('prompts', []);
        this.promptsList = document.getElementById('promptsList');
        this.addBtn = document.getElementById('addPromptBtn');
        this.commandInput = document.getElementById('newCommand');
        this.promptInput = document.getElementById('newPrompt');

        this.initListeners();
        this.render();
    }

    initListeners() {
        if (this.addBtn) {
            this.addBtn.addEventListener('click', () => this.addFromForm());
        }

        if (this.promptInput) {
            this.promptInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addFromForm();
            });
        }
    }

    addFromForm() {
        let command = this.commandInput.value.trim();
        const prompt = this.promptInput.value.trim();

        if (!command || !prompt) {
            alert('커맨드와 프롬프트를 모두 입력해주세요.');
            return;
        }

        // Ensure command starts with /
        if (!command.startsWith('/')) {
            command = '/' + command;
        }

        // Check for duplicate
        if (this.prompts.some(p => p.command === command)) {
            alert('이미 존재하는 커맨드입니다.');
            return;
        }

        this.add(command, prompt);
        this.commandInput.value = '';
        this.promptInput.value = '';
    }

    add(command, prompt) {
        const item = {
            id: `pm_${Date.now()}`,
            command: command,
            prompt: prompt
        };
        this.prompts.push(item);
        this.save();
        this.render();
        return item;
    }

    update(id, command, prompt) {
        const item = this.prompts.find(p => p.id === id);
        if (item) {
            item.command = command;
            item.prompt = prompt;
            this.save();
            this.render();
        }
    }

    delete(id) {
        this.prompts = this.prompts.filter(p => p.id !== id);
        this.save();
        this.render();
    }

    getByCommand(command) {
        return this.prompts.find(p => p.command === command);
    }

    save() {
        StorageManager.set('prompts', this.prompts);

        // Update prompts in all open tabs immediately (no restart needed)
        if (window.tabManager && window.tabManager.tabs) {
            const promptsData = JSON.stringify(this.prompts);
            window.tabManager.tabs.forEach(tab => {
                tab.webview.executeJavaScript(`
                    window.__prompts = ${promptsData};
                `).catch(() => { });
            });
        }
    }

    render() {
        if (!this.promptsList) return;

        if (this.prompts.length === 0) {
            this.promptsList.innerHTML = '<div class="list-empty">저장된 프롬프트가 없습니다</div>';
        } else {
            this.promptsList.innerHTML = this.prompts.map(p => `
                <div class="list-item" data-id="${p.id}">
                    <div class="list-item-content">
                        <div class="list-item-title">${p.command}</div>
                        <div class="list-item-subtitle">${p.prompt}</div>
                    </div>
                    <div class="list-item-actions">
                        <button class="edit" data-id="${p.id}">수정</button>
                        <button class="delete" data-id="${p.id}">삭제</button>
                    </div>
                </div>
            `).join('');

            // Add handlers
            this.promptsList.querySelectorAll('.edit').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.dataset.id;
                    const item = this.prompts.find(p => p.id === id);
                    const listItem = btn.closest('.list-item');

                    // Replace with edit form
                    listItem.innerHTML = `
                        <div class="edit-form" style="display: flex; gap: 8px; flex: 1; align-items: center;">
                            <input type="text" class="edit-command" value="${item.command}" style="width: 80px; padding: 8px; background: #333; border: 1px solid #555; border-radius: 4px; color: white;">
                            <input type="text" class="edit-prompt" value="${item.prompt}" style="flex: 1; padding: 8px; background: #333; border: 1px solid #555; border-radius: 4px; color: white;">
                            <button class="save-edit" style="padding: 8px 12px; background: #fff; color: #000; border: none; border-radius: 4px; cursor: pointer;">저장</button>
                            <button class="cancel-edit" style="padding: 8px 12px; background: #444; color: #fff; border: none; border-radius: 4px; cursor: pointer;">취소</button>
                        </div>
                    `;

                    listItem.querySelector('.save-edit').addEventListener('click', () => {
                        const newCommand = listItem.querySelector('.edit-command').value.trim();
                        const newPrompt = listItem.querySelector('.edit-prompt').value.trim();
                        if (newCommand && newPrompt) {
                            this.update(id, newCommand, newPrompt);
                        }
                    });

                    listItem.querySelector('.cancel-edit').addEventListener('click', () => {
                        this.render();
                    });
                });
            });

            this.promptsList.querySelectorAll('.delete').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (confirm('이 프롬프트를 삭제하시겠습니까?')) {
                        this.delete(btn.dataset.id);
                    }
                });
            });
        }
    }
}

// ============================================
// SETTINGS MODAL
// ============================================
class SettingsModal {
    constructor() {
        this.modal = document.getElementById('settingsModal');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.closeBtn = document.getElementById('closeSettings');
        this.tabs = document.querySelectorAll('.modal-tab');
        this.contents = document.querySelectorAll('.tab-content');

        this.initListeners();
    }

    initListeners() {
        this.settingsBtn.addEventListener('click', () => this.open());
        this.closeBtn.addEventListener('click', () => this.close());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });

        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
    }

    open() {
        this.modal.classList.add('active');
        window.bookmarkManager.render();
        window.promptManager.render();
    }

    close() {
        this.modal.classList.remove('active');
    }

    switchTab(tabName) {
        this.tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
        this.contents.forEach(c => c.classList.toggle('active', c.id === `${tabName}Tab`));
    }
}

// ============================================
// TAB MANAGER
// ============================================
class TabManager {
    constructor() {
        this.tabs = [];
        this.activeTabId = null;
        this.tabCounter = 0;

        this.tabList = document.getElementById('tabList');
        this.webviewContainer = document.getElementById('webviewContainer');
        this.newTabBtn = document.getElementById('newTabBtn');

        this.init();
    }

    init() {
        this.newTabBtn.addEventListener('click', () => this.createTab());
        this.createTab();
    }

    createTab(url = 'https://gemini.google.com/') {
        const tabId = `tab-${++this.tabCounter}`;

        const tabEl = document.createElement('div');
        tabEl.className = 'tab loading';
        tabEl.dataset.tabId = tabId;
        tabEl.innerHTML = `
            <div class="tab-icon"></div>
            <span class="tab-title">새 탭</span>
            <button class="tab-bookmark" title="북마크">☆</button>
            <button class="tab-close" title="탭 닫기 (⌘W)">✕</button>
        `;

        // Tab click handler
        tabEl.addEventListener('click', (e) => {
            if (!e.target.classList.contains('tab-close') && !e.target.classList.contains('tab-bookmark')) {
                this.switchToTabById(tabId);
            }
        });

        // Close button
        tabEl.querySelector('.tab-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeTab(tabId);
        });

        // Bookmark button
        const bookmarkBtn = tabEl.querySelector('.tab-bookmark');
        bookmarkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleBookmark(tabId);
        });

        this.tabList.insertBefore(tabEl, this.newTabBtn);

        // Create webview
        const webview = document.createElement('webview');
        webview.id = tabId;
        webview.src = url;
        webview.setAttribute('partition', 'persist:gemini');
        webview.setAttribute('allowpopups', 'true');

        // Title update function
        const updateTitle = (title) => {
            if (!title || title === 'Gemini') return;
            const cleanTitle = title
                .replace(' - Google 기반 AI', '')
                .replace(' - Google AI', '')
                .replace('Gemini', '')
                .trim() || 'Gemini';
            tabEl.querySelector('.tab-title').textContent = cleanTitle;
        };

        // Update bookmark button state
        const updateBookmarkState = () => {
            const currentUrl = webview.getURL();
            const isBookmarked = window.bookmarkManager && window.bookmarkManager.isBookmarked(currentUrl);
            bookmarkBtn.textContent = isBookmarked ? '★' : '☆';
            bookmarkBtn.classList.toggle('bookmarked', isBookmarked);
        };

        webview.addEventListener('page-title-updated', (e) => {
            updateTitle(e.title);
            tabEl.classList.remove('loading');
        });

        // Poll for title and handle Tab key for prompt insertion
        let titlePollInterval;
        webview.addEventListener('dom-ready', () => {
            console.log('[App] dom-ready fired for webview');
            if (titlePollInterval) clearInterval(titlePollInterval);

            titlePollInterval = setInterval(() => {
                webview.executeJavaScript(`
                    (() => {
                        const headerTitle = document.querySelector('.conversation-actions-menu-button span');
                        if (headerTitle && headerTitle.innerText.trim()) {
                            return headerTitle.innerText.trim();
                        }
                        const selected = document.querySelector('.conversation[aria-selected="true"]');
                        if (selected) {
                            return selected.innerText.split('\\n')[0].trim();
                        }
                        return null;
                    })()
                `)
                    .then(updateTitle)
                    .catch(() => { });

                updateBookmarkState();
            }, 2000);

            // Inject Tab key handler for prompt commands (supports inline commands)
            const promptsData = JSON.stringify(window.promptManager.prompts);
            webview.executeJavaScript(`
                if (!window.__promptHandlerAdded) {
                    window.__promptHandlerAdded = true;
                    window.__promptProcessing = false;
                    window.__prompts = ${promptsData};
                    
                    // Find command at cursor position
                    function getCommandAtCursor() {
                        var sel = window.getSelection();
                        if (!sel.rangeCount) return null;
                        
                        var range = sel.getRangeAt(0);
                        var node = range.startContainer;
                        
                        // Handle case where cursor is in element node
                        if (node.nodeType !== Node.TEXT_NODE) {
                            // Try to find text node child
                            if (node.childNodes.length > 0 && range.startOffset > 0) {
                                node = node.childNodes[range.startOffset - 1];
                                if (node.nodeType === Node.TEXT_NODE) {
                                    // Cursor is at end of this text node
                                    var text = node.textContent;
                                    var cursorPos = text.length;
                                    return findCommandInText(text, cursorPos, node);
                                }
                            }
                            return null;
                        }
                        
                        var text = node.textContent;
                        var cursorPos = range.startOffset;
                        return findCommandInText(text, cursorPos, node);
                    }
                    
                    function findCommandInText(text, cursorPos, node) {
                        // Search backwards from cursor to find /
                        var start = cursorPos - 1;
                        while (start >= 0) {
                            var char = text[start];
                            if (char === '/') break;
                            if (char === ' ' || char === '\\n') return null; // Space breaks command
                            start--;
                        }
                        
                        if (start < 0 || text[start] !== '/') return null;
                        
                        var command = text.substring(start, cursorPos);
                        if (command.length < 2) return null; // At least /x
                        
                        return {
                            command: command,
                            start: start,
                            end: cursorPos,
                            node: node
                        };
                    }
                    
                    document.addEventListener('keydown', function(e) {
                        if (e.key === 'Tab') {
                            if (window.__promptProcessing) return;
                            
                            var editor = document.querySelector('.ql-editor');
                            if (!editor) return;
                            
                            var cmdInfo = getCommandAtCursor();
                            if (!cmdInfo) return;
                            
                            // Find matching prompt
                            var promptItem = null;
                            for (var i = 0; i < window.__prompts.length; i++) {
                                if (window.__prompts[i].command === cmdInfo.command) {
                                    promptItem = window.__prompts[i];
                                    break;
                                }
                            }
                            
                            if (promptItem) {
                                e.preventDefault();
                                e.stopPropagation();
                                e.stopImmediatePropagation();
                                
                                window.__promptProcessing = true;
                                
                                // Save command for replacement
                                var savedCommand = cmdInfo.command;
                                var savedPrompt = promptItem.prompt;
                                var editor = document.querySelector('.ql-editor');
                                
                                // Use text replacement approach instead of Range API
                                // This works better with Korean IME composition
                                setTimeout(function() {
                                    var fullText = editor.innerText || '';
                                    var newText = fullText.replace(savedCommand, savedPrompt);
                                    
                                    // Select all and replace
                                    var range = document.createRange();
                                    range.selectNodeContents(editor);
                                    var sel = window.getSelection();
                                    sel.removeAllRanges();
                                    sel.addRange(range);
                                    
                                    document.execCommand('delete', false, null);
                                    document.execCommand('insertText', false, newText.trim());
                                    
                                    setTimeout(function() {
                                        window.__promptProcessing = false;
                                    }, 100);
                                }, 50);
                            }
                        }
                    }, true);
                } else {
                    window.__prompts = ${promptsData};
                }
            `).catch(function () { });
        });

        // Listen for console messages from webview for debugging
        webview.addEventListener('console-message', (e) => {
            console.log('[Webview]', e.message);
        });

        webview.addEventListener('ipc-message', (e) => {
            if (e.channel === 'prompt-command') {
                this.handlePromptCommand(webview, e.args[0]);
            }
        });

        const originalRemove = webview.remove.bind(webview);
        webview.remove = () => {
            if (titlePollInterval) clearInterval(titlePollInterval);
            originalRemove();
        };

        webview.addEventListener('did-start-loading', () => tabEl.classList.add('loading'));
        webview.addEventListener('did-stop-loading', () => {
            tabEl.classList.remove('loading');
            updateBookmarkState();
        });
        webview.addEventListener('did-navigate', () => updateBookmarkState());
        webview.addEventListener('did-navigate-in-page', () => updateBookmarkState());

        this.webviewContainer.appendChild(webview);
        this.tabs.push({ id: tabId, tabEl, webview });
        this.switchToTabById(tabId);

        return tabId;
    }

    handlePromptCommand(webview, command) {
        const promptItem = window.promptManager.getByCommand(command);
        if (promptItem) {
            webview.executeJavaScript(`
                (() => {
                    const editor = document.querySelector('.ql-editor');
                    if (editor) {
                        editor.innerHTML = '<p>${promptItem.prompt.replace(/'/g, "\\'")}</p>';
                        editor.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                })()
            `).catch(() => { });
        }
    }

    toggleBookmark(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        const url = tab.webview.getURL();
        const title = tab.tabEl.querySelector('.tab-title').textContent;

        if (window.bookmarkManager.isBookmarked(url)) {
            const bookmark = window.bookmarkManager.getByUrl(url);
            if (bookmark) {
                window.bookmarkManager.delete(bookmark.id);
            }
        } else {
            window.bookmarkManager.add(title, url);
        }

        // Update button state
        const bookmarkBtn = tab.tabEl.querySelector('.tab-bookmark');
        const isBookmarked = window.bookmarkManager.isBookmarked(url);
        bookmarkBtn.textContent = isBookmarked ? '★' : '☆';
        bookmarkBtn.classList.toggle('bookmarked', isBookmarked);
    }

    navigateToUrl(url) {
        const activeTab = this.getActiveTab();
        if (activeTab) {
            activeTab.webview.src = url;
        }
    }

    switchToTabById(tabId) {
        this.tabs.forEach(tab => {
            const isActive = tab.id === tabId;
            tab.tabEl.classList.toggle('active', isActive);
            tab.webview.classList.toggle('active', isActive);
        });
        this.activeTabId = tabId;
    }

    switchToTab(index) {
        if (index >= 0 && index < this.tabs.length) {
            this.switchToTabById(this.tabs[index].id);
        }
    }

    closeTab(tabId) {
        const tabIndex = this.tabs.findIndex(t => t.id === tabId);
        if (tabIndex === -1) return;

        const tab = this.tabs[tabIndex];
        tab.tabEl.remove();
        tab.webview.remove();
        this.tabs.splice(tabIndex, 1);

        if (this.tabs.length === 0) {
            this.createTab();
            return;
        }

        if (this.activeTabId === tabId) {
            const newIndex = Math.min(tabIndex, this.tabs.length - 1);
            this.switchToTabById(this.tabs[newIndex].id);
        }
    }

    closeCurrentTab() {
        if (this.activeTabId) {
            this.closeTab(this.activeTabId);
        }
    }

    getActiveTab() {
        return this.tabs.find(t => t.id === this.activeTabId);
    }
}

// ============================================
// INITIALIZE
// ============================================
// Detect platform and add class to body for CSS
if (window.electronAPI && window.electronAPI.platform) {
    const platform = window.electronAPI.platform === 'darwin' ? 'mac' : 'win';
    document.body.classList.add(`platform-${platform}`);
}

window.bookmarkManager = new BookmarkManager();
window.promptManager = new PromptManager();
window.settingsModal = new SettingsModal();
window.tabManager = new TabManager();
