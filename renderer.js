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
// UI HELPER (Custom Toast & Confirm)
// ============================================
class UIHelper {
    static showToast(message, icon = '✅', duration = 3000) {
        const toast = document.getElementById('customToast');
        const toastIcon = document.getElementById('toastIcon');
        const toastMessage = document.getElementById('toastMessage');

        if (!toast) return;

        toastIcon.textContent = icon;
        toastMessage.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    static showConfirm(title, message) {
        return new Promise((resolve) => {
            const modal = document.getElementById('customConfirmModal');
            const titleEl = document.getElementById('confirmTitle');
            const messageEl = document.getElementById('confirmMessage');
            const okBtn = document.getElementById('confirmOkBtn');
            const cancelBtn = document.getElementById('confirmCancelBtn');
            const closeBtn = document.getElementById('closeConfirmModal');

            if (!modal) {
                resolve(confirm(message)); // Fallback to native
                return;
            }

            titleEl.textContent = title;
            messageEl.textContent = message;
            modal.classList.add('active');

            const cleanup = () => {
                modal.classList.remove('active');
                okBtn.removeEventListener('click', onOk);
                cancelBtn.removeEventListener('click', onCancel);
                closeBtn.removeEventListener('click', onCancel);
            };

            const onOk = () => { cleanup(); resolve(true); };
            const onCancel = () => { cleanup(); resolve(false); };

            okBtn.addEventListener('click', onOk);
            cancelBtn.addEventListener('click', onCancel);
            closeBtn.addEventListener('click', onCancel);
        });
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

    getByIndex(index) {
        return this.bookmarks[index] || null;
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
                        const listItem = btn.closest('.list-item');

                        // Replace with edit form
                        listItem.innerHTML = `
                            <div class="edit-form" style="display: flex; gap: 8px; flex: 1; align-items: center;">
                                <input type="text" class="edit-title" value="${bookmark.title}" style="flex: 1; padding: 8px; background: #333; border: 1px solid #555; border-radius: 4px; color: white;" placeholder="북마크 제목">
                                <button class="save-edit" style="padding: 8px 12px; background: #fff; color: #000; border: none; border-radius: 4px; cursor: pointer;">저장</button>
                                <button class="cancel-edit" style="padding: 8px 12px; background: #444; color: #fff; border: none; border-radius: 4px; cursor: pointer;">취소</button>
                            </div>
                            <div style="font-size: 11px; color: #666; margin-top: 4px; padding-left: 4px;">${bookmark.url}</div>
                        `;

                        // Focus the input
                        const input = listItem.querySelector('.edit-title');
                        input.focus();
                        input.select();

                        // Save button handler
                        listItem.querySelector('.save-edit').addEventListener('click', () => {
                            const newTitle = input.value.trim();
                            if (newTitle) {
                                this.update(id, newTitle);
                            }
                        });

                        // Cancel button handler
                        listItem.querySelector('.cancel-edit').addEventListener('click', () => {
                            this.render();
                        });

                        // Enter key to save, Escape to cancel
                        input.addEventListener('keydown', (e) => {
                            if (e.key === 'Enter') {
                                const newTitle = input.value.trim();
                                if (newTitle) {
                                    this.update(id, newTitle);
                                }
                            } else if (e.key === 'Escape') {
                                this.render();
                            }
                        });
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
        if (window.downloadManager) {
            window.downloadManager.render();
        }
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
// DOWNLOAD MANAGER
// ============================================
class DownloadManager {
    constructor() {
        // Auto-migrate from old paraRoot setting if exists
        const oldParaRoot = StorageManager.get('paraRoot', null);
        this.downloadFolder = StorageManager.get('downloadFolder', null) || oldParaRoot;

        // Save migrated value if applicable
        if (this.downloadFolder && !StorageManager.get('downloadFolder', null)) {
            StorageManager.set('downloadFolder', this.downloadFolder);
        }

        this.pathInput = document.getElementById('downloadFolderPath');
        this.selectBtn = document.getElementById('selectDownloadFolder');

        this.initListeners();
        this.render();
    }

    initListeners() {
        if (this.selectBtn) {
            this.selectBtn.addEventListener('click', () => this.selectFolder());
        }
    }

    async selectFolder() {
        if (!window.electronAPI || !window.electronAPI.selectFolder) {
            alert('파일 시스템 API를 사용할 수 없습니다.');
            return;
        }

        const folderPath = await window.electronAPI.selectFolder();
        if (folderPath) {
            this.downloadFolder = folderPath;
            StorageManager.set('downloadFolder', folderPath);
            this.render();
        }
    }

    async saveConversation(content, filename) {
        if (!this.downloadFolder) {
            alert('다운로드 폴더를 먼저 설정해주세요.\n설정 → 📁 다운로드 탭에서 폴더를 선택하세요.');
            return false;
        }

        const filePath = `${this.downloadFolder}/${filename}.md`;

        const result = await window.electronAPI.saveMarkdown(filePath, content);
        if (result.error) {
            alert('저장 실패: ' + result.error);
            return false;
        }

        return true;
    }

    render() {
        if (this.pathInput) {
            this.pathInput.value = this.downloadFolder || '';
        }
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
            <button class="tab-save" title="대화 저장">💾</button>
            <button class="tab-bookmark" title="북마크">☆</button>
            <button class="tab-close" title="탭 닫기 (⌘W)">✕</button>
        `;

        // Tab click handler
        tabEl.addEventListener('click', (e) => {
            if (!e.target.classList.contains('tab-close') && !e.target.classList.contains('tab-bookmark') && !e.target.classList.contains('tab-save')) {
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

        // Save button
        const saveBtn = tabEl.querySelector('.tab-save');
        saveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.saveConversation(tabId);
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
                    window.__dropdownVisible = false;
                    window.__selectedIndex = 0;
                    window.__filteredPrompts = [];
                    
                    // Create dropdown element
                    var dropdown = document.createElement('div');
                    dropdown.id = '__prompt_dropdown';
                    dropdown.style.cssText = 'position:absolute;z-index:99999;background:#1a1a1a;border:1px solid #333;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.4);max-height:200px;overflow-y:auto;display:none;min-width:200px;';
                    document.body.appendChild(dropdown);
                    
                    function showDropdown(x, y, filter) {
                        var filterLower = (filter || '').toLowerCase();
                        window.__filteredPrompts = window.__prompts.filter(function(p) {
                            return p.command.toLowerCase().includes(filterLower) || p.prompt.toLowerCase().includes(filterLower);
                        });
                        
                        if (window.__filteredPrompts.length === 0) {
                            hideDropdown();
                            return;
                        }
                        
                        window.__selectedIndex = 0;
                        renderDropdown();
                        
                        // Viewport boundary check
                        var dropdownWidth = 250; // min-width + padding
                        var dropdownHeight = Math.min(window.__filteredPrompts.length * 50, 200); // max-height
                        var viewportWidth = window.innerWidth;
                        var viewportHeight = window.innerHeight;
                        
                        // Adjust X if dropdown would overflow right edge
                        if (x + dropdownWidth > viewportWidth - 10) {
                            x = Math.max(10, viewportWidth - dropdownWidth - 10);
                        }
                        
                        // Adjust Y if dropdown would overflow bottom edge
                        if (y + dropdownHeight > viewportHeight - 10) {
                            // Show above the cursor instead
                            y = Math.max(10, y - dropdownHeight - 30);
                        }
                        
                        dropdown.style.left = x + 'px';
                        dropdown.style.top = y + 'px';
                        dropdown.style.display = 'block';
                        window.__dropdownVisible = true;
                    }
                    
                    function hideDropdown() {
                        dropdown.style.display = 'none';
                        window.__dropdownVisible = false;
                        window.__filteredPrompts = [];
                    }
                    
                    function renderDropdown() {
                        // Clear dropdown using DOM manipulation (TrustedHTML compliant)
                        while (dropdown.firstChild) {
                            dropdown.removeChild(dropdown.firstChild);
                        }
                        
                        window.__filteredPrompts.forEach(function(p, i) {
                            var item = document.createElement('div');
                            item.setAttribute('data-index', i);
                            item.style.cssText = 'padding:10px 14px;cursor:pointer;border-bottom:1px solid #222;background:' + (i === window.__selectedIndex ? '#333' : 'transparent');
                            
                            var cmdDiv = document.createElement('div');
                            cmdDiv.style.cssText = 'color:#fff;font-weight:500;';
                            cmdDiv.textContent = p.command;
                            
                            var promptDiv = document.createElement('div');
                            promptDiv.style.cssText = 'color:#888;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:300px;';
                            promptDiv.textContent = p.prompt.length > 50 ? p.prompt.substring(0, 50) + '...' : p.prompt;
                            
                            item.appendChild(cmdDiv);
                            item.appendChild(promptDiv);
                            
                            // Prevent focus loss on mousedown
                            item.addEventListener('mousedown', function(e) {
                                e.preventDefault();
                            });
                            
                            item.addEventListener('click', function(e) {
                                e.preventDefault();
                                e.stopPropagation();
                                selectPrompt(i);
                            });
                            
                            item.addEventListener('mouseenter', function() {
                                window.__selectedIndex = i;
                                // Update visual only without re-rendering to avoid focus issues
                                dropdown.querySelectorAll('[data-index]').forEach(function(el, idx) {
                                    el.style.background = idx === i ? '#333' : 'transparent';
                                });
                            });
                            
                            dropdown.appendChild(item);
                        });
                    }
                    
                    function selectPrompt(index) {
                        var promptItem = window.__filteredPrompts[index];
                        if (!promptItem) return;
                        
                        var cmdInfo = getCommandAtCursor();
                        if (!cmdInfo) {
                            hideDropdown();
                            return;
                        }
                        
                        window.__promptProcessing = true;
                        var savedPrompt = promptItem.prompt;
                        
                        // Find editor with multiple selectors
                        var editor = document.querySelector('.ql-editor') || 
                                     document.activeElement;
                        
                        if (!editor || !editor.isContentEditable) {
                            console.log('[Dropdown] No editable element found');
                            window.__promptProcessing = false;
                            hideDropdown();
                            return;
                        }
                        
                        setTimeout(function() {
                            var fullText = editor.innerText || '';
                            var newText = fullText.replace(cmdInfo.command, savedPrompt);
                            
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
                        
                        hideDropdown();
                    }
                    
                    function getCaretCoordinates() {
                        var sel = window.getSelection();
                        if (!sel.rangeCount) return null;
                        var range = sel.getRangeAt(0).cloneRange();
                        range.collapse(true);
                        var rect = range.getClientRects()[0];
                        if (!rect) {
                            var span = document.createElement('span');
                            span.textContent = '\\u200b';
                            range.insertNode(span);
                            rect = span.getBoundingClientRect();
                            span.parentNode.removeChild(span);
                        }
                        return rect ? { x: rect.left, y: rect.bottom + 5 } : null;
                    }
                    
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
                        if (command.length < 1) return null;
                        
                        return {
                            command: command,
                            start: start,
                            end: cursorPos,
                            node: node
                        };
                    }
                    
                    // Input handler to detect / and show dropdown
                    document.addEventListener('keyup', function(e) {
                        // Skip modifier keys and navigation keys
                        if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta' ||
                            e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
                            e.key === 'Tab' || e.key === 'Enter' || e.key === 'Escape') return;
                        
                        // Only process when typing in an editable area
                        var activeEl = document.activeElement;
                        if (!activeEl) return;
                        if (!activeEl.isContentEditable && activeEl.tagName !== 'INPUT' && activeEl.tagName !== 'TEXTAREA') return;
                        
                        var cmdInfo = getCommandAtCursor();
                        if (cmdInfo && cmdInfo.command.startsWith('/')) {
                            var coords = getCaretCoordinates();
                            if (coords) {
                                var filter = cmdInfo.command.substring(1);
                                showDropdown(coords.x, coords.y, filter);
                            }
                        } else {
                            hideDropdown();
                        }
                    }, true);
                    
                    document.addEventListener('keydown', function(e) {
                        // Handle dropdown navigation
                        if (window.__dropdownVisible) {
                            if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                e.stopPropagation();
                                window.__selectedIndex = Math.min(window.__selectedIndex + 1, window.__filteredPrompts.length - 1);
                                // Update visual and scroll into view
                                dropdown.querySelectorAll('[data-index]').forEach(function(el, idx) {
                                    el.style.background = idx === window.__selectedIndex ? '#333' : 'transparent';
                                    if (idx === window.__selectedIndex) {
                                        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                                    }
                                });
                                return;
                            }
                            if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                e.stopPropagation();
                                window.__selectedIndex = Math.max(window.__selectedIndex - 1, 0);
                                // Update visual and scroll into view
                                dropdown.querySelectorAll('[data-index]').forEach(function(el, idx) {
                                    el.style.background = idx === window.__selectedIndex ? '#333' : 'transparent';
                                    if (idx === window.__selectedIndex) {
                                        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                                    }
                                });
                                return;
                            }
                            if (e.key === 'Tab' || e.key === 'Enter') {
                                e.preventDefault();
                                e.stopPropagation();
                                e.stopImmediatePropagation();
                                selectPrompt(window.__selectedIndex);
                                return;
                            }
                            if (e.key === 'Escape') {
                                e.preventDefault();
                                hideDropdown();
                                return;
                            }
                        }
                        
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
                                
                                hideDropdown();
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
                    
                    // Hide dropdown on click outside
                    document.addEventListener('click', function(e) {
                        if (!dropdown.contains(e.target)) {
                            hideDropdown();
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

    async saveConversation(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        // Check if download folder is configured
        if (!window.downloadManager || !window.downloadManager.downloadFolder) {
            UIHelper.showToast('다운로드 폴더를 먼저 설정해주세요. 설정 → 📁 다운로드 탭에서 폴더를 선택하세요.', '⚠️', 4000);
            return;
        }

        // Extract conversation from Gemini
        try {
            const conversationData = await tab.webview.executeJavaScript(`
                (() => {
                    const messages = [];
                    
                    // 2024/2025 Gemini DOM structure uses custom HTML elements
                    // <user-query> for user messages, <model-response> for AI responses
                    const turns = document.querySelectorAll('user-query, model-response');
                    
                    console.log('[Extract] Found', turns.length, 'turns with user-query/model-response');
                    
                    turns.forEach(turn => {
                        const isUser = turn.tagName === 'USER-QUERY';
                        
                        let content = '';
                        if (isUser) {
                            // User message: text in .query-content
                            const contentEl = turn.querySelector('.query-content');
                            if (contentEl) {
                                content = contentEl.innerText.trim();
                            }
                        } else {
                            // Model response: text in .response-container-content
                            const contentEl = turn.querySelector('.response-container-content');
                            if (contentEl) {
                                content = contentEl.innerText.trim();
                            }
                        }
                        
                        if (content && content.length > 0) {
                            messages.push({
                                role: isUser ? 'user' : 'assistant',
                                content: content
                            });
                        }
                    });
                    
                    console.log('[Extract] Extracted', messages.length, 'messages');
                    
                    // Fallback if new selectors don't work
                    if (messages.length === 0) {
                        // Try older conversation-turn selector
                        const oldTurns = document.querySelectorAll('.conversation-turn');
                        console.log('[Extract] Fallback: found', oldTurns.length, 'conversation-turn elements');
                        
                        oldTurns.forEach(turn => {
                            const content = turn.innerText.trim();
                            if (content) {
                                messages.push({
                                    role: 'assistant',
                                    content: content
                                });
                            }
                        });
                    }
                    
                    // Last resort: raw text from main area
                    if (messages.length === 0) {
                        const mainContent = document.querySelector('.conversation-container') || 
                                            document.querySelector('[role="main"]') ||
                                            document.body;
                        const rawText = mainContent.innerText || '';
                        console.log('[Extract] Using raw fallback, length:', rawText.length);
                        return { raw: rawText.substring(0, 50000) };
                    }
                    
                    return { messages };
                })()
            `);

            // Format as markdown
            let markdown = '';
            const title = tab.tabEl.querySelector('.tab-title').textContent || '대화';
            const now = new Date();
            const dateStr = now.toISOString().slice(0, 10);
            const timeStr = now.toTimeString().slice(0, 5);

            markdown += `# ${title}\n\n`;
            markdown += `> 저장 일시: ${dateStr} ${timeStr}\n\n`;
            markdown += `---\n\n`;

            if (conversationData.messages && conversationData.messages.length > 0) {
                console.log('[Save] Found', conversationData.messages.length, 'messages');
                conversationData.messages.forEach(msg => {
                    if (msg.role === 'user') {
                        markdown += `### 사용자\n\n${msg.content}\n\n`;
                    } else {
                        markdown += `### Gemini\n\n${msg.content}\n\n`;
                    }
                });
            } else if (conversationData.raw) {
                console.log('[Save] Using raw fallback, length:', conversationData.raw.length);
                // raw fallback일 경우에도 헤더 추가
                markdown += `### 대화 내용\n\n${conversationData.raw}\n`;
            } else {
                UIHelper.showToast('대화 내용을 추출할 수 없습니다.', '❌', 3000);
                return;
            }

            // Show scroll warning before asking for filename
            const proceedWithSave = await this.showScrollWarning();
            if (!proceedWithSave) return; // User cancelled

            // Ask for filename using custom modal
            const defaultFilename = `${title.replace(/[^가-힣a-zA-Z0-9]/g, '_')}_${dateStr}`;
            const filename = await this.showSaveModal(defaultFilename);

            if (!filename) return; // User cancelled

            // Save using DownloadManager
            const success = await window.downloadManager.saveConversation(markdown, filename);

            UIHelper.showToast(`저장 완료! ${filename}.md`, '✅', 3000);
        } catch (err) {
            console.error('Failed to save conversation:', err);
            UIHelper.showToast('대화 저장 중 오류가 발생했습니다: ' + err.message, '❌', 4000);
        }
    }

    showSaveModal(defaultFilename) {
        return new Promise((resolve) => {
            const modal = document.getElementById('saveModal');
            const input = document.getElementById('saveFilenameInput');
            const confirmBtn = document.getElementById('confirmSaveBtn');
            const cancelBtn = document.getElementById('cancelSaveBtn');
            const closeBtn = document.getElementById('closeSaveModal');

            input.value = defaultFilename;
            modal.classList.add('active');
            input.focus();
            input.select();

            const cleanup = () => {
                modal.classList.remove('active');
                confirmBtn.removeEventListener('click', onConfirm);
                cancelBtn.removeEventListener('click', onCancel);
                closeBtn.removeEventListener('click', onCancel);
                input.removeEventListener('keydown', onKeydown);
            };

            const onConfirm = () => {
                const value = input.value.trim();
                cleanup();
                resolve(value || null);
            };

            const onCancel = () => {
                cleanup();
                resolve(null);
            };

            const onKeydown = (e) => {
                if (e.key === 'Enter') onConfirm();
                if (e.key === 'Escape') onCancel();
            };

            confirmBtn.addEventListener('click', onConfirm);
            cancelBtn.addEventListener('click', onCancel);
            closeBtn.addEventListener('click', onCancel);
            input.addEventListener('keydown', onKeydown);
        });
    }

    showScrollWarning() {
        return UIHelper.showConfirm(
            '📜 대화 저장 안내',
            '대화 내용이 긴 경우, 전체 대화를 저장하려면\n대화 창을 맨 위까지 스크롤한 후 저장해주세요.\n\n스크롤하지 않으면 현재 화면에 보이는\n일부 대화만 저장될 수 있습니다.\n\n계속 저장하시겠습니까?'
        );
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
window.downloadManager = new DownloadManager();
window.settingsModal = new SettingsModal();
window.tabManager = new TabManager();

// Listen for global shortcuts from main process
if (window.electronAPI && window.electronAPI.onShortcut) {
    window.electronAPI.onShortcut((action, data) => {
        switch (action) {
            case 'new-tab':
                window.tabManager.createTab();
                break;
            case 'close-tab':
                window.tabManager.closeCurrentTab();
                break;
            case 'switch-tab':
                window.tabManager.switchToTab(data);
                break;
            case 'open-bookmark':
                const bookmark = window.bookmarkManager.getByIndex(data);
                if (bookmark) {
                    window.tabManager.createTab(bookmark.url);
                }
                break;
        }
    });
}
