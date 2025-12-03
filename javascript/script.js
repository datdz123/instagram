
// API endpoint paths - từ wp_localize_script trong functions.php
const INSTAGRAM_API_ENDPOINT = instagram_ajax?.endpoint ;
const INSTAGRAM_VIDEO_DOWNLOAD_ENDPOINT = instagram_ajax?.videoDownloadEndpoint;
document.addEventListener('DOMContentLoaded', () => {
    

    // Add modal styles if not already added
    if (!document.getElementById('story-viewer-styles')) {
        const style = document.createElement('style');
        style.id = 'story-viewer-styles';
        style.textContent = `
      .story-viewer-modal, .image-zoom-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .story-viewer-modal__overlay, .image-zoom-modal__overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        cursor: pointer;
      }
      
      .story-viewer-modal__content, .image-zoom-modal__content {
        position: relative;
        z-index: 10001;
        max-width: 90vw;
        max-height: 90vh;
        background: #000;
        border-radius: 8px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      
      .story-viewer-modal__close, .image-zoom-modal__close {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.5);
        color: #fff;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        z-index: 10002;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.3s;
      }
      
      .story-viewer-modal__close:hover, .image-zoom-modal__close:hover {
        background: rgba(0, 0, 0, 0.8);
      }
      
      .story-viewer {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        max-width: 100%;
        max-height: 90vh;
      }
      
      .story-viewer__media {
        max-width: 100%;
        max-height: 70vh;
        object-fit: contain;
      }
      
      .story-viewer__music {
        padding: 20px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        margin-top: 20px;
        width: 100%;
        max-width: 500px;
      }
      
      .story-viewer__music-info {
        color: #fff;
        margin-bottom: 10px;
      }
      
      .story-viewer__music-title {
        font-size: 18px;
        font-weight: bold;
        margin: 0 0 5px 0;
      }
      
      .story-viewer__music-artist {
        font-size: 14px;
        margin: 0;
        opacity: 0.8;
      }
      
      .story-viewer__audio {
        width: 100%;
        margin-top: 10px;
      }
      
      .image-zoom-modal__image {
        max-width: 90vw;
        max-height: 90vh;
        object-fit: contain;
      }
      
      .media-content--story {
        cursor: pointer;
      }
      
      .tags__item--image.tags__item_pointer {
        cursor: pointer;
      }
    `;
        document.head.appendChild(style);
    }
    const categoryNav = document.querySelectorAll('.category-custom .category__element');

    if (categoryNav.length) {
        const setActive = (target) => {
            categoryNav.forEach((item) => item.classList.remove('category__element_active'));
            target.classList.add('category__element_active');
        };

        // Try to match current location with available links (useful when navigating away and back)
        const matchedItem = Array.from(categoryNav).find((item) => {
            const link = item.querySelector('a');
            if (!link) {
                return false;
            }
            const linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/$/, '');
            const currentPath = window.location.pathname.replace(/\/$/, '');
            return linkPath === currentPath;
        });

        if (matchedItem) {
            setActive(matchedItem);
        } else {
            setActive(categoryNav[0]);
        }

        categoryNav.forEach((item) => {
            item.addEventListener(
                'click',
                () => {
                    setActive(item);
                },
                true
            );

            const link = item.querySelector('a');
            if (link) {
                link.addEventListener('focus', () => setActive(item));
            }
        });
    }

    // Instagram Form Handler
    const searchForm = document.querySelector('.search-form');
    if (!searchForm) {
        
        return;
    }

    const searchInput = document.getElementById('search-form-input');
    const pasteButton = document.querySelector('.search-form__clipboard-paste');
    const clearButton = document.querySelector('.search-form__clipboard-clear');
    const searchButton = document.querySelector('.search-form__button');
    const searchResultContainer = document.querySelector('.search-result');

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        handleSearchButtonClick();
    });

    let currentQuery = '';
    const DOWNLOAD_BUTTON_ICON =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9ImRvd25sb2FkIj4KPHBhdGggaWQ9IlZlY3RvciIgZD0iTTIxIDE1VjE5QzIxIDE5LjUzMDQgMjAuNzg5MyAyMC4wMzkxIDIwLjQxNDIgMjAuNDE0MkMyMC4wMzkxIDIwLjc4OTMgMTkuNTMwNCAyMSAxOSAyMUg1QzQuNDY5NTcgMjEgMy45NjA4NiAyMC43ODkzIDMuNTg1NzkgMjAuNDE0MkMzLjIxMDcxIDIwLjAzOTEgMyAxOS41MzA0IDMgMTlWMTUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGlkPSJWZWN0b3JfMiIgZD0iTTcgMTBMMTIgMTVMMTcgMTAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGlkPSJWZWN0b3JfMyIgZD0iTTEyIDE1VjMiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjwvZz4KPC9zdmc+Cg==';

    const PROFILE_TABS = [
        { key: 'posts', label: 'posts' },
        { key: 'stories', label: 'stories' },
        { key: 'highlights', label: 'highlights' },
        { key: 'reels', label: 'reels' },
    ];

    const profileViewState = {
        username: '',
        profileUrl: '',
        profileAvatar: '',
        isPrivate: false,
        posts: null, // null = chưa fetch, [] = đã fetch nhưng rỗng, [data] = có dữ liệu
        sections: {}, // Cache cho các tab: { posts: data, stories: data, ... }
        pagination: {}, // lưu maxId cho từng tab nếu cần
        highlightsData: {}, // lưu highlight data để lấy stories
        fetchingTabs: new Set(), // Track các tab đang fetch để tránh duplicate requests
    };

    function isRawInputFormatValid(value) {
        const trimmed = value.trim();

        // Empty
        if (!trimmed) {
            return false;
        }

        // Không cho phép khoảng trắng hoặc dấu phẩy
        if (/[\s,]/.test(trimmed)) {
            return false;
        }

        return true;
    }

    function normalizeInstagramInput(value) {
        const trimmed = value.trim();
        if (!trimmed) {
            return '';
        }

        // Already full URL with protocol
        if (/^https?:\/\/+/i.test(trimmed)) {
            return trimmed;
        }

        const withoutAt = trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;

        // Starts with instagram.com but missing protocol
        if (withoutAt.toLowerCase().startsWith('instagram.com')) {
            return `https://${withoutAt}`;
        }

        return `https://www.instagram.com/${withoutAt}`;
    }

    // Handle input change
    window.handleInputChange = function () {
        currentQuery = searchInput.value.trim();
        updateButtonsVisibility();
    };

    // Handle paste from clipboard
    window.handlePasteButtonClick = async function () {
        try {
            const text = await navigator.clipboard.readText();
            searchInput.value = text;
            currentQuery = text.trim();
            updateButtonsVisibility();
        } catch (err) {
            console.error('Failed to read clipboard:', err);
        }
    };

    // Handle clear button
    window.handleClearButtonClick = function () {
        searchInput.value = '';
        currentQuery = '';
        updateButtonsVisibility();
        clearSearchResult();
    };

    // Handle search button
    window.handleSearchButtonClick = async function () {
        // 1) Validate raw input trước khi chuẩn hoá URL
        if (!isRawInputFormatValid(currentQuery)) {
            console.warn('Invalid input format:', currentQuery);
            showError('Link format is incorrect');
            return;
        }

        const normalizedQuery = normalizeInstagramInput(currentQuery);
        if (!normalizedQuery) {
            showError('Link format is incorrect');
            return;
        }

        // Update input and stored query so the user sees the resolved URL
        currentQuery = normalizedQuery;
        searchInput.value = normalizedQuery;
        updateButtonsVisibility();

        // Show loading state
        showLoading();
        searchButton.disabled = true;

        try {
            

            // Kiểm tra xem có phải profile URL không để call song song
            const isProfileUrl = !normalizedQuery.includes('/p/') && 
                                 !normalizedQuery.includes('/reel/') && 
                                 !normalizedQuery.includes('/reels/') && 
                                 !normalizedQuery.includes('/tv/');

            // Lấy username từ URL để gọi song song posts
            let usernameFromUrl = '';
            if (isProfileUrl) {
                try {
                    const urlObj = new URL(normalizedQuery);
                    const pathParts = urlObj.pathname.split('/').filter(Boolean);
                    if (pathParts.length > 0 && !['stories', 'explore', 'accounts'].includes(pathParts[0])) {
                        usernameFromUrl = pathParts[0];
                    }
                } catch (e) {
                    console.warn('Could not parse username from URL:', e);
                }
            }

            // Nếu là profile, call song song: profile + posts
            if (isProfileUrl && usernameFromUrl) {
                
                
                const [profileResponse, postsResponse] = await Promise.all([
                    fetch(INSTAGRAM_API_ENDPOINT, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url: normalizedQuery })
                    }),
                    fetch(INSTAGRAM_API_ENDPOINT, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contentType: 'posts', username: usernameFromUrl, maxId: '' })
                    })
                ]);

                

                if (!profileResponse.ok) {
                    const errorText = await profileResponse.text();
                    console.error('Profile handler HTTP error response:', errorText);
                    showError('An error occurred while processing your request. Please check console for details.');
                    return;
                }

                let profileResult, postsResult;
                try {
                    profileResult = await profileResponse.json();
                    postsResult = await postsResponse.json();
                } catch (jsonError) {
                    console.error('Failed to parse JSON from handler:', jsonError);
                    showError('An error occurred while processing your request. Please check console for details.');
                    return;
                }

                
                

                if (profileResult.success) {
                    // Pre-cache posts data trước khi display profile
                    if (postsResult.success) {
                        profileViewState.posts = postsResult.data;
                        profileViewState.sections['posts'] = postsResult.data;
                        
                    }
                    displayResult(profileResult.data);
                    
                    // Pre-fetch các tab còn lại sau khi profile hiển thị (không chặn UI)
                    prefetchRemainingTabs(usernameFromUrl);
                } else {
                    console.error('Instagram handler returned error:', {
                        error: profileResult.error,
                        httpCode: profileResult.httpCode,
                        raw: profileResult.raw,
                    });
                    showError(profileResult.error || 'Link format is incorrect');
                }
            } else {
                // Không phải profile URL, call bình thường
                const response = await fetch(INSTAGRAM_API_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: normalizedQuery })
                });

                

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Handler HTTP error response:', errorText);
                    showError('An error occurred while processing your request. Please check console for details.');
                    return;
                }

                let result;
                try {
                    result = await response.json();
                } catch (jsonError) {
                    console.error('Failed to parse JSON from handler:', jsonError);
                    showError('An error occurred while processing your request. Please check console for details.');
                    return;
                }

                

                if (result.success) {
                    displayResult(result.data);
                } else {
                    console.error('Instagram handler returned error:', {
                        error: result.error,
                        httpCode: result.httpCode,
                        raw: result.raw,
                    });
                    showError(result.error || 'Link format is incorrect');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showError('An error occurred while processing your request. Please check console for details.');
        } finally {
            searchButton.disabled = false;
        }
    };

    // Helper function để đảm bảo URL ảnh có đầy đủ domain
    function getFullImageUrl(url) {
        if (!url || typeof url !== 'string') return url;
        
        // Nếu đã là full URL (có protocol), return luôn
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        
        // Nếu là relative URL (bắt đầu bằng /), thêm origin
        if (url.startsWith('/')) {
            return window.location.origin + url;
        }
        
        // Nếu là path không có / ở đầu, thêm origin + /
        return window.location.origin + '/' + url;
    }

    // Pre-fetch các tab còn lại (stories, highlights, reels) sau khi profile đã load
    function prefetchRemainingTabs(username) {
        if (!username) return;
        
        const tabsToPreFetch = ['stories', 'highlights', 'reels'];
        
        
        // Sử dụng Promise.all để fetch song song tất cả tabs
        const fetchPromises = tabsToPreFetch.map(async (tabKey) => {
            // Skip nếu đã có cache
            if (profileViewState.sections[tabKey]) {
                
                return;
            }
            
            // Đánh dấu đang fetch
            profileViewState.fetchingTabs.add(tabKey);
            
            try {
                const response = await fetch(INSTAGRAM_API_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contentType: tabKey, username: username, maxId: '' })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        profileViewState.sections[tabKey] = result.data;
                        
                    }
                }
            } catch (error) {
                console.warn(`[Optimization] Failed to pre-fetch ${tabKey}:`, error);
            } finally {
                profileViewState.fetchingTabs.delete(tabKey);
            }
        });
        
        // Fire and forget - không cần await, chỉ cache background
        Promise.all(fetchPromises).then(() => {
            
        });
    }

    // Handle paste event
    window.handleInputPaste = function (e) {
        setTimeout(() => {
            currentQuery = searchInput.value.trim();
            updateButtonsVisibility();
        }, 10);
    };

    function updateButtonsVisibility() {
        if (currentQuery) {
            pasteButton.style.display = 'none';
            clearButton.style.display = 'flex';
        } else {
            pasteButton.style.display = 'flex';
            clearButton.style.display = 'none';
        }
    }

    function showLoading() {
        if (!searchResultContainer) return;

        searchResultContainer.innerHTML = `
            <div class="loader-component">
                <div class="loader-component__circles">
                    <span class="loader-component__circle"></span>
                    <span class="loader-component__circle"></span>
                    <span class="loader-component__circle"></span>
                </div>
                <p class="loader-component__message">We are downloading the profile. Please wait :)</p>
            </div>
        `;
        searchResultContainer.style.display = 'block';
    }

    function showError(message) {
        if (!searchResultContainer) return;

        searchResultContainer.innerHTML = `
            <section class="search-result">
                <!----><!----><!---->
                <div class="error-message fallback-popup fallback-popup--extension">
                    <p class="error-message__text" style="display: none;">${message}</p>
                    <div class="fallback-popup__text-container">
                        <p class="fallback-popup__text">${message} 😕 We couldn't download this content.<br> 👉 Try our partner — SaveFrom Helper can handle it with no problem!</p>
                    </div>
                    <button class="fallback-popup__btn" type="button">
                        <span class="fallback-popup__btn-text">Install the extension</span>
                    </button>
                </div>
            </section>
        `;
        searchResultContainer.style.display = 'block';
    }

    function clearSearchResult() {
        if (!searchResultContainer) return;
        searchResultContainer.innerHTML = '';
        searchResultContainer.style.display = 'none';
    }

    function displayResult(data) {
        if (!searchResultContainer) return;

        // DEBUG: Log incoming data structure
        console.log('[displayResult] Received data:', data);
        console.log('[displayResult] Has user:', !!data.user, 'Has username:', !!data.username, 'Has media:', !!data.media);

        // Check if it's profile data or post data
        if (data.user || data.username) {
            console.log('[displayResult] -> Calling displayProfileResult');
            displayProfileResult(data);
        } else if (data.media) {
            console.log('[displayResult] -> Calling displayPostResult');
            displayPostResult(data);
        } else {
            console.warn('[displayResult] Unknown data structure, trying displayPostResult as fallback');
            displayPostResult(data);
        }
    }

    function displayProfileResult(data) {
        if (!searchResultContainer) return;

        // API instagram120: một số response có dạng { user: { result: [ { user: {...} } ] } }
        // Chuẩn hoá: cố gắng luôn lấy ra object "user" cuối cùng.
        const topUserBlock = data.user || data;
        const fromResultArray =
            Array.isArray(topUserBlock.result) && topUserBlock.result.length > 0
                ? topUserBlock.result[0].user || topUserBlock.result[0]
                : null;

        const user = fromResultArray || topUserBlock.user || topUserBlock;

        const username = user.username || user.user?.username || '';
        const fullName = user.full_name || user.fullName || user.user?.full_name || '';
        const profilePic =
            user.profile_pic_url ||
            user.profilePicUrl ||
            user.profile_pic_url_hd ||
            user.user?.profile_pic_url ||
            '';

        const postsCount =
            user.media_count ||
            user.edge_owner_to_timeline_media?.count ||
            user.posts_count ||
            0;

        const followersCount =
            user.follower_count ||
            user.edge_followed_by?.count ||
            user.followers ||
            0;

        const followingCount =
            user.following_count ||
            user.edge_follow?.count ||
            user.following ||
            0;

        // Một số API trả posts trong field riêng, một số trong user
        const posts = data.posts || user.posts || [];

        const isPrivate = Boolean(user.is_private || user.is_private_account);

        profileViewState.username = username;
        profileViewState.profileUrl = `https://www.instagram.com/${username}`;
        profileViewState.profileAvatar = profilePic;
        profileViewState.isPrivate = isPrivate;
        // Không reset cache nếu đã có pre-cached data từ parallel fetch
        // Chỉ reset nếu username khác
        const currentCachedUsername = profileViewState._cachedUsername;
        if (currentCachedUsername !== username) {
            profileViewState.posts = profileViewState.posts || null; // Giữ nếu đã pre-cache
            profileViewState.sections = profileViewState.sections || {};
            profileViewState.pagination = {};
            profileViewState.fetchingTabs.clear();
            profileViewState._cachedUsername = username;
        }

        const tabsMarkup = PROFILE_TABS.map((tab, index) => `
            <li class="tabs-component__item">
                <button class="tabs-component__button ${index === 0 ? 'tabs-component__button--active' : ''}" type="button" data-tab="${tab.key}">
                    ${tab.label}
                </button>
            </li>
        `).join('');

        searchResultContainer.innerHTML = `
            <section class="search-result">
                <div class="output-component">
                    <p class="output-component__title">Search result</p>
                    <div class="output-profile" scrolltargetselector="#googleAds-desktop-underInput, #googleAds-desktop-underResultTitle, #googleAds-mobile-underInput, #googleAds-mobile-underResultTitle" data-username="${username}">
                        <div class="user-info">
                            <div class="avatar user-info__avatar">
                                <div class="avatar__wrapper">
                                    <img class="avatar__image" src="${profilePic}" alt="avatar">
                                    <div class="avatar__button" role="button" tabindex="0" data-avatar-url="${profilePic}">
                                        <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" class="avatar__icon">
                                            <rect width="40" height="40" x="5" y="5" rx="20"></rect>
                                            <path fill="none" d="M5 8.88889V6.55556C5 6.143 5.16389 5.74733 5.45561 5.45561C5.74733 5.16389 6.143 5 6.55556 5H8.88889M15.1111 5H17.4444C17.857 5 18.2527 5.16389 18.5444 5.45561C18.8361 5.74733 19 6.143 19 6.55556V8.88889M19 15.1111V17.4444C19 17.857 18.8361 18.2527 18.5444 18.5444C18.2527 18.8361 17.857 19 17.4444 19H15.1111M8.88889 19H6.55556C6.143 19 5.74733 18.8361 5.45561 18.5444C5.16389 18.2527 5 17.857 5 17.4444V15.1111" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                            <rect width="40" height="40" x="5" y="5" stroke-width="2" rx="20"></rect>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <p class="user-info__username">
                                <span class="user-info__username-text">@${username}</span>
                                <a class="user-info__link" href="https://www.instagram.com/${username}" target="_blank" rel="noopener noreferrer"></a>
                            </p>
                            <ul class="stats user-info__stats">
                                <li class="stats__item"><span class="stats__value">${postsCount}</span><span class="stats__name">posts</span></li>
                                <li class="stats__item"><span class="stats__value">${followersCount}</span><span class="stats__name">followers</span></li>
                                <li class="stats__item"><span class="stats__value">${followingCount}</span><span class="stats__name">following</span></li>
                            </ul>
                            <p class="user-info__full-name">${fullName}</p>
                        </div>
                        <ul class="tabs-component">
                            ${tabsMarkup}
                        </ul>
                        <div class="tab-content js-tab-content" data-active-tab="posts">
                            ${profileViewState.posts ? renderTabData('posts', profileViewState.posts, { isPrivate }) : ((posts && posts.length > 0) ? renderTabData('posts', posts, { isPrivate }) : renderInlineLoader())}
                        </div>
                    </div>
                </div>
            </section>
        `;
        searchResultContainer.style.display = 'block';
        setupProfileTabHandlers();
        
        // Chỉ fetch posts nếu chưa có cache (từ parallel fetch)
        const tabContent = searchResultContainer.querySelector('.tab-content');
        if (tabContent && tabContent.getAttribute('data-active-tab') === 'posts') {
            // Kiểm tra xem đã có pre-cached posts chưa
            const hasCachedPosts = profileViewState.posts && 
                (Array.isArray(profileViewState.posts) ? profileViewState.posts.length > 0 : Object.keys(profileViewState.posts).length > 0);
            
            if (!hasCachedPosts && (!posts || (Array.isArray(posts) && posts.length === 0))) {
                // Chưa có cache và chưa có posts từ profile, cần fetch
                
                fetchProfileTabData('posts', tabContent, true);
            } else {
                
            }
        }

        // Setup highlight handlers if highlights tab is active
        setTimeout(() => {
            const tabContent = searchResultContainer.querySelector('.tab-content');
            if (tabContent && tabContent.getAttribute('data-active-tab') === 'highlights') {
                setupHighlightHandlers();
            }
        }, 100);
    }

    function setupProfileTabHandlers() {
        if (!searchResultContainer) return;

        const tabButtons = searchResultContainer.querySelectorAll('.tabs-component__button');
        if (!tabButtons.length) {
            bindAvatarZoomButton();
            setupPostImageZoomHandlers();
            return;
        }

        tabButtons.forEach((button) => {
            button.addEventListener('click', () => {
                if (button.classList.contains('tabs-component__button--active')) {
                    return;
                }

                tabButtons.forEach((btn) => btn.classList.remove('tabs-component__button--active'));
                button.classList.add('tabs-component__button--active');
                handleProfileTabChange(button.dataset.tab);
            });
        });

        bindAvatarZoomButton();
        setupPostImageZoomHandlers();
    }

    function bindAvatarZoomButton() {
        if (!searchResultContainer) return;
        const avatarButton = searchResultContainer.querySelector('.avatar__button[data-avatar-url]');
        if (!avatarButton || avatarButton.dataset.zoomBound === 'true') {
            return;
        }

        const openAvatarModal = () => {
            const url = avatarButton.dataset.avatarUrl;
            openAvatarImageModal(url);
        };

        avatarButton.addEventListener('click', (e) => {
            e.preventDefault();
            openAvatarModal();
        });

        avatarButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openAvatarModal();
            }
        });

        avatarButton.dataset.zoomBound = 'true';
    }

    function setupPostImageZoomHandlers() {
        if (!searchResultContainer) return;
        const mediaButtons = searchResultContainer.querySelectorAll('.profile-media-list__item .tags__item--image[data-media-url]');
        mediaButtons.forEach((button) => {
            if (button.dataset.zoomBound === 'true') {
                return;
            }
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const mediaUrl = button.dataset.mediaUrl;
                const downloadUrl = button.dataset.downloadUrl || mediaUrl;
                const timestamp = parseInt(button.dataset.timestamp || '', 10) || null;
                openImageModal(mediaUrl, {
                    type: 'post',
                    downloadUrl,
                    timestamp,
                    username: profileViewState.username,
                    avatarUrl: profileViewState.profileAvatar,
                    totalItems: 1,
                    activeIndex: 0,
                });
            });
            button.dataset.zoomBound = 'true';
        });
    }

    function handleProfileTabChange(tabKey) {
        if (!tabKey || !searchResultContainer) {
            return;
        }

        const tabContent = searchResultContainer.querySelector('.tab-content');
        if (!tabContent) {
            return;
        }

        tabContent.setAttribute('data-active-tab', tabKey);

        // Check cache trước - nếu đã có dữ liệu, dùng cache ngay (không fetch lại)
        const cachedData = tabKey === 'posts' ? profileViewState.posts : profileViewState.sections[tabKey];
        
        if (cachedData !== null && cachedData !== undefined) {
            // Kiểm tra xem có dữ liệu thực sự không
            const hasData = Array.isArray(cachedData) 
                ? cachedData.length > 0 
                : (cachedData && Object.keys(cachedData).length > 0);
            
            if (hasData) {
                // Có cache, dùng ngay
                
                tabContent.innerHTML = renderTabData(tabKey, cachedData, { isPrivate: profileViewState.isPrivate });
                if (tabKey === 'highlights') {
                    setTimeout(() => setupHighlightHandlers(), 100);
                }
                if (tabKey === 'posts') {
                    setupPostImageZoomHandlers();
                }
                return;
            }
        }

        // Không có cache hoặc cache rỗng, fetch từ API
        tabContent.innerHTML = renderInlineLoader();
        fetchProfileTabData(tabKey, tabContent);
    }

    function fetchProfileTabData(tabKey, tabContent, isAutoFetch = false) {
        if (!profileViewState.username) {
            return;
        }

        // Check cache trước - nếu đã có dữ liệu và không phải auto-fetch, không fetch lại
        const cachedData = tabKey === 'posts' ? profileViewState.posts : profileViewState.sections[tabKey];
        if (cachedData !== null && cachedData !== undefined) {
            // Nếu có cache và không phải array rỗng, dùng cache
            if (Array.isArray(cachedData) && cachedData.length > 0) {
                if (!isAutoFetch) {
                    
                    tabContent.innerHTML = renderTabData(tabKey, cachedData, { isPrivate: profileViewState.isPrivate });
                    if (tabKey === 'highlights') {
                        setTimeout(() => setupHighlightHandlers(), 100);
                    }
            if (tabKey === 'posts') {
                setupPostImageZoomHandlers();
            }
                    return;
                }
            } else if (!Array.isArray(cachedData)) {
                // Nếu là object (có dữ liệu), dùng cache
                if (!isAutoFetch) {
                    
                    tabContent.innerHTML = renderTabData(tabKey, cachedData, { isPrivate: profileViewState.isPrivate });
                    if (tabKey === 'highlights') {
                        setTimeout(() => setupHighlightHandlers(), 100);
                    }
                    return;
                }
            }
        }

        // Tránh duplicate requests - nếu đang fetch thì không fetch lại
        if (profileViewState.fetchingTabs.has(tabKey)) {
            
            return;
        }

        // Đánh dấu đang fetch và hiển thị loading
        profileViewState.fetchingTabs.add(tabKey);
        
        // Hiển thị loading ngay khi bắt đầu fetch (nếu chưa có loading)
        if (tabContent && !tabContent.querySelector('.loader-component')) {
            tabContent.innerHTML = renderInlineLoader();
        }

        const currentMaxId = profileViewState.pagination[tabKey] || '';

        console.log('Fetching profile tab data:', {
            tabKey,
            username: profileViewState.username,
            maxId: currentMaxId,
            isAutoFetch,
        });

        fetch(INSTAGRAM_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contentType: tabKey,
                username: profileViewState.username,
                maxId: currentMaxId,
            }),
        })
            .then(async (response) => {
                

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Tab "${tabKey}" handler HTTP error:`, errorText);
                    throw new Error(`HTTP ${response.status}`);
                }

                return response.json();
            })
            .then((result) => {
                // Remove from fetching set
                profileViewState.fetchingTabs.delete(tabKey);

                if (!tabContent || tabContent.getAttribute('data-active-tab') !== tabKey) {
                    return;
                }

                if (result.success) {
                    console.log(`[fetchProfileTabData] ${tabKey} response structure:`, {
                        hasData: !!result.data,
                        dataType: typeof result.data,
                        isArray: Array.isArray(result.data),
                        hasEdges: !!(result.data?.edges),
                        hasResult: !!(result.data?.result),
                        dataKeys: result.data ? Object.keys(result.data).slice(0, 10) : [],
                        edgesCount: result.data?.edges?.length || 0,
                        resultEdgesCount: result.data?.result?.edges?.length || 0,
                        fullDataStructure: JSON.stringify(result.data).substring(0, 500) // First 500 chars for debugging
                    });

                    // Lưu lại maxId nếu API trả về để phân trang (nếu có)
                    if (result.data && typeof result.data.next_max_id !== 'undefined') {
                        profileViewState.pagination[tabKey] = result.data.next_max_id;
                    }

                    // Cache dữ liệu
                    profileViewState.sections[tabKey] = result.data;
                    // Also save to profileViewState.posts if this is posts tab
                    if (tabKey === 'posts') {
                        profileViewState.posts = result.data;
                    }
                    
                    tabContent.innerHTML = renderTabData(tabKey, result.data);

                    // Setup highlight handlers if highlights tab
                    if (tabKey === 'highlights') {
                        setTimeout(() => setupHighlightHandlers(), 100);
                    }
                    if (tabKey === 'posts') {
                        setupPostImageZoomHandlers();
                    }
                } else {
                    tabContent.innerHTML = renderEmptyTabMessage(tabKey, result.error || `Failed to load ${tabKey}`);
                }
            })
            .catch((error) => {
                // Remove from fetching set on error
                profileViewState.fetchingTabs.delete(tabKey);
                
                console.error(`Error fetching ${tabKey}:`, error);
                if (tabContent && tabContent.getAttribute('data-active-tab') === tabKey) {
                    tabContent.innerHTML = renderEmptyTabMessage(tabKey, 'Unable to load this content right now');
                }
            });
    }

    function renderTabData(tabKey, payload, options = {}) {
        // Special handling for highlights
        if (tabKey === 'highlights') {
            const highlights = normalizeHighlightsItems(payload);
            if (!highlights.length) {
                return renderEmptyTabMessage(tabKey);
            }
            return `
                <ul class="highlights-component">
                    ${highlights.map(renderHighlightItem).join('')}
                </ul>
            `;
        }

        // Regular posts/stories/reels
        const items = normalizeMediaItems(payload);

        if (!items.length) {
            if (options.isPrivate && tabKey === 'posts') {
                return renderPrivateAccountMessage();
            }
            return renderEmptyTabMessage(tabKey);
        }

        return `
            <ul class="profile-media-list">
                ${items.map(renderMediaItem).join('')}
            </ul>
            <div class="trigger" style="height: 1px;"></div>
        `;
    }

    /**
     * Convert Instagram image URL to local path in images folder
     * PHP đã download và lưu với MD5 hash, nên cần dùng MD5 hash đúng
     * Nếu URL đã là local (từ PHP proxy), dùng luôn
     * Nếu chưa, trả về URL gốc và để PHP proxy handle
     */
  

    function normalizeMediaItems(payload) {
        if (!payload) {
            
            return [];
        }

        // Log full payload structure for debugging
        

        let sourceItems = [];

        // Handle Instagram120 API's edges structure
        // Check for edges at different levels: payload.edges, payload.result.edges, payload.data.edges
        // IMPORTANT: Check nested structures BEFORE checking if payload is array
        if (payload.result?.edges && Array.isArray(payload.result.edges)) {
            
            sourceItems = payload.result.edges.map(edge => edge.node || edge);
        } else if (payload.data?.edges && Array.isArray(payload.data.edges)) {
            
            sourceItems = payload.data.edges.map(edge => edge.node || edge);
        } else if (payload.edges && Array.isArray(payload.edges)) {
            
            sourceItems = payload.edges.map(edge => edge.node || edge);
        } else if (Array.isArray(payload)) {
            
            sourceItems = payload;
        } else {
            // Try to find items in various possible locations
            // If payload.result exists but doesn't have edges, it might be the actual data
            if (payload.result && !payload.result.edges) {
                // payload.result might be the actual array or object with items
                const resultData = payload.result;
                if (Array.isArray(resultData)) {
                    sourceItems = resultData;
                } else if (resultData.edges && Array.isArray(resultData.edges)) {
                    sourceItems = resultData.edges.map(edge => edge.node || edge);
                } else {
                    sourceItems = resultData.items || resultData.media || resultData.data || [];
                }
            } else {
                sourceItems = payload.items || payload.media || payload.data || payload.result || [];
            }
        }

        if (!Array.isArray(sourceItems)) {
            
            return [];
        }

        

        return sourceItems.map((item, index) => {
            // Debug: log first item structure
            if (index === 0) {
               
            }

            // Handle highlights structure: cover_media.cropped_image_version.url
            let thumbnail = '';
            let download = '';

            // Check for highlights structure first
            if (item.cover_media?.cropped_image_version) {
                const croppedImage = item.cover_media.cropped_image_version;
                // Check if url_wrapped is a local proxy URL (from our server)
                const urlWrapped = croppedImage.url_wrapped || '';
                const isLocalProxy = urlWrapped && (
                    urlWrapped.startsWith('/wp-content/themes/instagram/') ||
                    urlWrapped.includes('/wp-content/themes/instagram/') ||
                    (urlWrapped.startsWith('/') && !urlWrapped.startsWith('//') && !urlWrapped.includes('api/instagram/get'))
                );

                // Use url_wrapped only if it's our local proxy, otherwise use url (which will be proxied)
                if (isLocalProxy) {
                    thumbnail = urlWrapped;
                    download = urlWrapped;
                } else {
                    // Use url (already proxied by PHP)
                    thumbnail = croppedImage.url || '';
                    download = croppedImage.url || '';
                }
            } else {
                // Handle Instagram120 API structure with image_versions2 and video_versions
                if (item.image_versions2?.candidates?.length > 0) {
                    // Get the best quality image (first candidate is usually highest quality)
                    const bestImage = item.image_versions2.candidates[0];
                    // PHP đã proxy và trả về local URL, dùng trực tiếp
                    thumbnail = bestImage.url || '';
                    download = thumbnail;
                }

                if (item.video_versions?.length > 0) {
                    // Get the best quality video (first version is usually highest quality)
                    const bestVideo = item.video_versions[0];
                    download = bestVideo.url || '';
                } else if (!download && thumbnail) {
                    download = thumbnail;
                }

                // Fallback to other possible structures
                if (!thumbnail) {
                    thumbnail = item.thumbnail_url
                        || item.display_url
                        || item.cover
                        || item.preview_url
                        || item.image_url
                        || item.image
                        || item.media_url
                        || item.url
                        || '';
                }

                if (!download) {
                    download = item.video_url
                        || item.display_url
                        || item.url
                        || item.resource_url
                        || item.download_url
                        || thumbnail
                        || '';
                }
            }

            const caption = item.caption_text
                || item.caption?.text
                || item.caption
                || item.title
                || item.description
                || '';

            const likes = item.like_count || item.likes || 0;
            const comments = item.comment_count || item.comments || 0;
            const timestamp = item.taken_at_timestamp || item.taken_at || item.timestamp || item.time || null;

            return {
                thumbnail,
                download,
                caption,
                likes,
                comments,
                timestamp,
            };
        });
    }

    function normalizeHighlightsItems(payload) {
        if (!payload) {
            return [];
        }

        const sourceItems = Array.isArray(payload)
            ? payload
            : payload.items || payload.media || payload.data || payload.result || [];

        if (!Array.isArray(sourceItems)) {
            return [];
        }

        // Store highlights data for later use
        sourceItems.forEach((item) => {
            if (item.id) {
                profileViewState.highlightsData[item.id] = item;
            }
        });

        return sourceItems.map((item) => {
            // Get image URL from cover_media.cropped_image_version
            let imageUrl = '';
            if (item.cover_media?.cropped_image_version) {
                const croppedImage = item.cover_media.cropped_image_version;
                // Check if url_wrapped is a local proxy URL (from our server)
                const urlWrapped = croppedImage.url_wrapped || '';
                const isLocalProxy = urlWrapped && (
                    urlWrapped.startsWith('/wp-content/themes/instagram/') ||
                    urlWrapped.includes('/wp-content/themes/instagram/') ||
                    (urlWrapped.startsWith('/') && !urlWrapped.startsWith('//') && !urlWrapped.includes('api/instagram/get'))
                );

                // Use url_wrapped only if it's our local proxy, otherwise use url (which will be proxied)
                if (isLocalProxy) {
                    imageUrl = urlWrapped;
                } else {
                    // Use url (already proxied by PHP)
                    imageUrl = croppedImage.url || '';
                }
            }

            // Get title
            const title = item.title || '';

            return {
                id: item.id || '',
                imageUrl,
                title,
            };
        });
    }

    function renderHighlightItem(highlight) {
        const imageUrl = getFullImageUrl(highlight.imageUrl);
        return `
            <li class="highlight highlights-component__highlight">
                <button class="highlight__button" type="button" data-highlight-id="${highlight.id}">
                    <img class="highlight__image" src="${imageUrl}" alt="cover">
                    ${highlight.title ? `<p class="highlight__title">${highlight.title}</p>` : ''}
                </button>
            </li>
        `;
    }

    function setupHighlightHandlers() {
        if (!searchResultContainer) return;

        const highlightButtons = searchResultContainer.querySelectorAll('.highlight__button');
        highlightButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const highlightId = button.dataset.highlightId;
                if (!highlightId) return;

                handleHighlightClick(highlightId, button);
            });
        });
    }

    function handleHighlightClick(highlightId, button) {
        const tabContent = searchResultContainer.querySelector('.tab-content');
        if (!tabContent) return;

        // Show loading
        tabContent.innerHTML = renderInlineLoader();

        // Fetch highlight stories
        fetchHighlightStories(highlightId, tabContent);
    }

    function fetchHighlightStories(highlightId, tabContent) {
        if (!profileViewState.username) {
            tabContent.innerHTML = renderEmptyTabMessage('highlights', 'Unable to load stories');
            return;
        }

        console.log('Fetching highlight stories:', {
            highlightId,
            username: profileViewState.username,
        });

        // First, try to get stories from cached highlight data
        const highlightData = profileViewState.highlightsData[highlightId];
        if (highlightData && highlightData.stories) {
            
            tabContent.innerHTML = renderHighlightStories(highlightData.stories);
            return;
        }

        // Try to fetch highlight stories from API
        fetch(INSTAGRAM_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                highlightId: highlightId,
                username: profileViewState.username,
            }),
        })
            .then(async (response) => {
                

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Highlight stories HTTP error:', errorText);
                    throw new Error(`HTTP ${response.status}`);
                }

                return response.json();
            })
            .then((result) => {
                if (!tabContent || tabContent.getAttribute('data-active-tab') !== 'highlights') {
                    return;
                }

                if (result.success) {
                    
                    // Store stories in highlight data
                    if (highlightData) {
                        highlightData.stories = result.data;
                    }
                    tabContent.innerHTML = renderHighlightStories(result.data);
                } else {
                    console.error('Failed to fetch highlight stories:', result.error);
                    tabContent.innerHTML = renderEmptyTabMessage('highlights', result.error || 'Failed to load stories');
                }
            })
            .catch((error) => {
                console.error('Error fetching highlight stories:', error);
                if (tabContent && tabContent.getAttribute('data-active-tab') === 'highlights') {
                    tabContent.innerHTML = renderEmptyTabMessage('highlights', 'Unable to load stories right now');
                }
            });
    }

    function renderHighlightStories(data) {
        const stories = normalizeStoryItems(data);

        if (!stories.length) {
            return renderEmptyTabMessage('highlights', 'No stories available');
        }

        // Store stories for modal access
        if (!window.storyViewerData) {
            window.storyViewerData = {};
        }
        window.storyViewerData.currentStories = stories;

        const html = `
            <ul class="profile-media-list">
                ${stories.map((item, index) => renderStoryItem(item, index)).join('')}
            </ul>
            <div class="trigger" style="height: 1px;"></div>
        `;

        // Setup event listeners after a short delay to ensure DOM is ready
        setTimeout(() => {
            setupStoryViewers();
        }, 100);

        return html;
    }

    function setupStoryViewers() {
        if (!searchResultContainer) return;

        // Click on story item to view with music
        const storyItems = searchResultContainer.querySelectorAll('.media-content--story');
        storyItems.forEach((item) => {
            item.addEventListener('click', (e) => {
                // Don't trigger if clicking on tags button or download button
                if (e.target.closest('.tags__item--image') || e.target.closest('.button__download')) {
                    return;
                }
                const index = parseInt(item.dataset.storyIndex);
                if (!isNaN(index) && window.storyViewerData?.currentStories) {
                    openStoryViewer(index);
                }
            });
        });

        // Click on expand button to zoom image
        const expandButtons = searchResultContainer.querySelectorAll('.tags__item--image.tags__item_pointer');
        expandButtons.forEach((button) => {
            const hasStoryIndex = button.dataset.storyIndex !== undefined && button.dataset.storyIndex !== '';
            if (!hasStoryIndex) {
                return;
            }
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(button.dataset.storyIndex);
                if (!isNaN(index) && window.storyViewerData?.currentStories) {
                    openStoryZoom(index);
                }
            });
        });

        // Click on download button
        const downloadButtons = searchResultContainer.querySelectorAll('.button__download[data-story-index]');
        downloadButtons.forEach((button) => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const index = parseInt(button.dataset.storyIndex);
                const downloadUrl = button.dataset.downloadUrl;
                if (downloadUrl && window.storyViewerData?.currentStories?.[index]) {
                    downloadStoryFile(downloadUrl, index, button);
                }
            });
        });
    }

    function downloadStoryFile(url, index, button = null) {
        if (!url || url === '#') {
            console.error('Invalid download URL');
            alert('Download URL is not available');
            return;
        }

        

        // Generate filename with .mp4 extension
        const filename = `story_${index}_${Date.now()}.mp4`;

        // Show loading indicator
        let originalText = 'Download';
        if (button) {
            originalText = button.textContent;
            button.textContent = 'Downloading...';
            button.disabled = true;
        }

        // Use proxy endpoint to download video
        const proxyUrl = `${INSTAGRAM_VIDEO_DOWNLOAD_ENDPOINT}?url=${encodeURIComponent(url)}`;

        // Create download link that will trigger browser's download dialog
        const link = document.createElement('a');
        link.href = proxyUrl;
        link.download = filename;
        link.style.display = 'none';

        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Restore button after a delay
        setTimeout(() => {
            if (button) {
                button.textContent = originalText;
                button.disabled = false;
            }
        }, 1000);

        
    }

    function openStoryViewer(index) {
        const stories = window.storyViewerData?.currentStories;
        if (!stories || !stories[index]) return;

        const story = stories[index];
        const musicInfo = story.music || story.originalItem?.music || story.originalItem?.audio_track || null;

        // Create modal HTML
        const musicHtml = musicInfo ? `
            <div class="story-viewer__music">
                <div class="story-viewer__music-info">
                    ${musicInfo.title ? `<p class="story-viewer__music-title">${musicInfo.title}</p>` : ''}
                    ${musicInfo.artist ? `<p class="story-viewer__music-artist">${musicInfo.artist}</p>` : ''}
                </div>
                ${musicInfo.audio_url ? `<audio controls class="story-viewer__audio"><source src="${musicInfo.audio_url}" type="audio/mpeg"></audio>` : ''}
            </div>
        ` : '';

        const mediaHtml = story.isVideo
            ? `<video class="story-viewer__media" controls autoplay><source src="${story.videoUrl}" type="video/mp4"></video>`
            : `<img class="story-viewer__media" src="${story.thumbnail}" alt="story">`;

        const modalHtml = `
            <div class="story-viewer-modal" id="story-viewer-modal">
                <div class="story-viewer-modal__overlay"></div>
                <div class="story-viewer-modal__content">
                    <button class="story-viewer-modal__close" type="button">&times;</button>
                    <div class="story-viewer">
                        ${mediaHtml}
                        ${musicHtml}
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('story-viewer-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Setup close handlers
        const modal = document.getElementById('story-viewer-modal');
        const closeBtn = modal.querySelector('.story-viewer-modal__close');
        const overlay = modal.querySelector('.story-viewer-modal__overlay');

        const closeModal = () => {
            modal.remove();
        };

        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);

        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    function openStoryZoom(index) {
        const stories = window.storyViewerData?.currentStories;
        if (!stories || !stories[index]) return;

        const story = stories[index];
        const imageUrl = story.thumbnail || story.videoUrl;
        const downloadUrl = story.videoUrl || story.thumbnail || imageUrl;
        openImageModal(imageUrl, {
            type: 'story',
            downloadUrl,
            timestamp: story.timestamp || null,
            username: profileViewState.username,
            avatarUrl: profileViewState.profileAvatar,
            totalItems: stories.length,
            activeIndex: index,
        });
    }

    function openImageModal(imageUrl, options = {}) {
        if (!imageUrl) {
            console.warn('[openImageModal] Missing image URL');
            return;
        }

        const modalId = 'media-preview-modal';
        const finalImageUrl = getFullImageUrl(imageUrl);
        const downloadUrl = getFullImageUrl(options.downloadUrl || imageUrl);
        const type = options.type || 'post';
        const isAvatar = type === 'avatar';
        const aspectRatio = options.aspectRatio || '1 / 1';
        const wrapperMode = options.aspectRatio
            ? (parseFloat(options.aspectRatio) >= 1 ? 'media-modal-item__wrapper--more' : 'media-modal-item__wrapper--less')
            : 'media-modal-item__wrapper--more';
        const username = options.username || profileViewState.username || '';
        const avatarUrl = getFullImageUrl(options.avatarUrl || profileViewState.profileAvatar || '');
        const timestamp = options.timestamp || null;
        const timeLabel = options.timeLabel || (timestamp ? getTimeAgo(timestamp) : '');
        const totalItems = Math.max(parseInt(options.totalItems, 10) || 1, 1);
        const activeIndex = Math.min(Math.max(parseInt(options.activeIndex, 10) || 0, 0), totalItems - 1);
        const aspectAttr = aspectRatio ? `style="aspect-ratio: ${aspectRatio}"` : '';

        const wrapperClasses = [
            'media-modal-item__wrapper',
            isAvatar ? 'avatar-media-item__wrapper' : '',
            wrapperMode,
        ]
            .filter(Boolean)
            .join(' ');

        const contentClasses = ['media-modal__content', isAvatar ? 'avatar-media-modal__content' : '']
            .filter(Boolean)
            .join(' ');

        const metaHtml =
            username || timeLabel || avatarUrl
                ? `
            <div class="media-modal__meta">
                ${avatarUrl ? `<img class="media-modal__avatar" src="${avatarUrl}" alt="avatar">` : ''}
                ${username ? `<p class="media-modal__username">${username}</p>` : ''}
                ${timeLabel ? `<p class="media-modal__time">${timeLabel}</p>` : ''}
            </div>
        `
                : '';

        const advancementHtml =
            totalItems > 1
                ? `
            <div class="advancement-bar media-modal__advancement-bar">
                ${Array.from({ length: totalItems })
                    .map((_, idx) => {
                        const width = (100 / totalItems).toFixed(2);
                        const activeClass = idx === activeIndex ? 'advancement-bar__item--active' : '';
                        return `<div class="advancement-bar__item ${activeClass}" style="width: ${width}%;"></div>`;
                    })
                    .join('')}
            </div>
        `
                : '';

        const prevButtonClass = [
            'media-modal__button',
            'media-modal__button--prev',
            activeIndex === 0 ? 'media-modal__button--disabled' : '',
        ]
            .filter(Boolean)
            .join(' ');

        const nextButtonClass = [
            'media-modal__button',
            'media-modal__button--next',
            activeIndex >= totalItems - 1 ? 'media-modal__button--disabled' : '',
        ]
            .filter(Boolean)
            .join(' ');

        const desktopDownloadHtml = downloadUrl
            ? `
            <a class="button button--filled media-modal__button--desktop-download" href="${downloadUrl}" download="true" aria-label="Download image">
                <img src="${DOWNLOAD_BUTTON_ICON}" alt="Download desktop button">
            </a>
        `
            : '';

        const mobileDownloadHtml = downloadUrl
            ? `<a class="button button--filled media-modal__button--download" href="${downloadUrl}" download="true">Download</a>`
            : '';

        const modalHtml = `
            <div class="media-modal" id="${modalId}">
                <div class="${contentClasses}">
                    ${metaHtml}
                    ${advancementHtml}
                    <div class="media-modal__media">
                        <button class="${prevButtonClass}" type="button" ${activeIndex === 0 ? 'disabled' : ''}></button>
                        <div class="media-modal-item">
                            <div class="${wrapperClasses}" ${aspectAttr}>
                                ${desktopDownloadHtml}
                                <img class="media-modal-item__content" src="${finalImageUrl}" alt="preview">
                            </div>
                        </div>
                        <button class="${nextButtonClass}" type="button" ${activeIndex >= totalItems - 1 ? 'disabled' : ''}></button>
                    </div>
                    ${mobileDownloadHtml}
                </div>
                <button class="media-modal__button media-modal__button--go-back" type="button">Go Back</button>
            </div>
        `;

        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const modal = document.getElementById(modalId);
        if (!modal) return;
        const goBackBtn = modal.querySelector('.media-modal__button--go-back');

        const closeModal = () => {
            modal.remove();
            document.removeEventListener('keydown', handleEscape);
        };

        if (goBackBtn) {
            goBackBtn.addEventListener('click', closeModal);
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    // Dedicated modal for avatar, to match existing HTML/CSS structure exactly
    function openAvatarImageModal(imageUrl) {
        if (!imageUrl) {
            console.warn('[openAvatarImageModal] Missing image URL');
            return;
        }

        const modalId = 'media-preview-modal';
        const finalImageUrl = getFullImageUrl(imageUrl);
        const downloadUrl = finalImageUrl;
        const aspectRatio = '1080 / 1080';

        const modalHtml = `
            <div class="media-modal" id="${modalId}">
                <div class="media-modal__content avatar-media-modal__content">
                    <div class="media-modal-item__wrapper avatar-media-item__wrapper media-modal-item__wrapper--more" style="aspect-ratio: ${aspectRatio};">
                        <a class="button button--filled media-modal__button--desktop-download" href="${downloadUrl}" download="true">
                            <img src="${DOWNLOAD_BUTTON_ICON}" alt="Download desktop button">
                        </a>
                        <img class="media-content__image avatar-media-content__image" src="${finalImageUrl}" alt="preview">
                    </div>
                    <a class="button button--filled media-modal__button--download" href="${downloadUrl}" download="true"> Download </a>
                </div>
                <button class="media-modal__button media-modal__button--go-back" type="button"> Go Back </button>
            </div>
        `;

        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const modal = document.getElementById(modalId);
        if (!modal) return;
        const goBackBtn = modal.querySelector('.media-modal__button--go-back');

        const closeModal = () => {
            modal.remove();
            document.removeEventListener('keydown', handleEscape);
        };

        if (goBackBtn) {
            goBackBtn.addEventListener('click', closeModal);
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    function normalizeStoryItems(payload) {
        if (!payload) {
            return [];
        }

        

        const sourceItems = Array.isArray(payload)
            ? payload
            : payload.items || payload.media || payload.data || payload.result || payload.stories || [];

        if (!Array.isArray(sourceItems)) {
            return [];
        }

        return sourceItems.map((item) => {
            

            // Get thumbnail/image - check multiple possible fields
            let thumbnail = item.thumbnail_url
                || item.display_url
                || item.image_url
                || item.image
                || item.media_url
                || item.url
                || item.cover_media?.cropped_image_version?.url
                || item.cover_media?.cropped_image_version?.url_wrapped
                || item.image_versions2?.candidates?.[0]?.url
                || item.carousel_media?.[0]?.image_versions2?.candidates?.[0]?.url
                || '';

            // Check if thumbnail is already a local proxy URL
            const isLocalProxy = thumbnail && (
                thumbnail.includes('/wp-content/themes/instagram/images/') ||
                thumbnail.startsWith('/wp-content/themes/instagram/')
            );

            // If not local proxy and it's an Instagram CDN URL, it should have been proxied by PHP
            // But if it's still an Instagram URL, log a warning
            if (thumbnail && !isLocalProxy && thumbnail.includes('cdninstagram.com')) {
                console.warn('Thumbnail URL not proxied:', thumbnail);
            }

            // Get video URL (for download)
            const videoUrl = item.video_url
                || item.video_versions?.[0]?.url
                || item.video
                || item.download_url
                || item.url
                || '';

            // Check if it's a video
            const isVideo = Boolean(
                item.video_url
                || item.video
                || item.video_versions?.length > 0
                || item.type === 'video'
                || item.media_type === 'video'
                || item.product_type === 'igtv'
            );

            // Get timestamp
            const timestamp = item.taken_at_timestamp || item.taken_at || item.timestamp || item.time || null;

            

            // Get music/audio info
            const music = item.music || item.audio || item.audio_track || null;

            return {
                thumbnail,
                videoUrl: isVideo ? videoUrl : thumbnail,
                isVideo,
                timestamp,
                music,
                originalItem: item, // Keep original item for full data
            };
        });
    }

    function renderStoryItem(item, index) {
        const timeAgo = item.timestamp ? getTimeAgo(item.timestamp) : '';
        const videoTag = item.isVideo ? '<span class="tags__item tags__item--video"></span>' : '';

        // Ensure thumbnail is not empty
        if (!item.thumbnail) {
            console.warn('Story item missing thumbnail:', item);
        }

        // Generate download filename
        const downloadFilename = `story_${index}_${Date.now()}.mp4`;
        
        // Đảm bảo URL có đầy đủ domain
        const thumbnailUrl = getFullImageUrl(item.thumbnail || '');
        const downloadUrl = getFullImageUrl(item.videoUrl || item.thumbnail || '');

        return `
            <li class="profile-media-list__item" data-story-index="${index}">
                <div class="media-content media-content--story" data-story-index="${index}">
                    <img class="media-content__image" src="${thumbnailUrl}" alt="preview" onerror="console.error('Failed to load image:', this.src)">
                    <div class="tags media-content__tags">
                        ${videoTag}
                        <button class="tags__item tags__item--image tags__item_pointer" data-story-index="${index}"></button>
                    </div>
                </div>
                <div class="media-content__info">
                    <button class="button button--filled button__download" data-story-index="${index}" data-download-url="${downloadUrl}" download="true">Download</button>
                    <div class="media-content__meta">
                        ${timeAgo ? `<p class="media-content__meta-time" title="${new Date(item.timestamp * 1000).toLocaleString()}"><span></span> ${timeAgo}</p>` : ''}
                    </div>
                </div>
            </li>
        `;
    }

    function renderMediaItem(item) {
        
        const captionHtml = item.caption ? `<p class="media-content__caption">${truncateText(item.caption, 120)}</p>` : '';
        const likesHtml = item.likes ? `<p class="media-content__meta-like"><span></span> ${item.likes}</p>` : '';
        const commentsHtml = item.comments ? `<p class="media-content__meta-comment"><span></span> ${item.comments}</p>` : '';
        const timeAgo = item.timestamp ? getTimeAgo(item.timestamp) : '';
        
        // Đảm bảo URL có đầy đủ domain
        const thumbnailUrl = getFullImageUrl(item.thumbnail);
        const downloadUrlFull = getFullImageUrl(item.download);

        return `
            <li class="profile-media-list__item">
                <div class="media-content media-content--post">
                    <img class="media-content__image" src="${thumbnailUrl}" alt="preview">
                    <div class="tags media-content__tags">
                        <button class="tags__item tags__item--image tags__item_pointer" type="button" data-media-url="${thumbnailUrl}" data-download-url="${downloadUrlFull}" data-timestamp="${item.timestamp || ''}"></button>
                    </div>
                </div>
                <div class="media-content__info">
                    ${captionHtml}
                    <a class="button button--filled button__download" href="${downloadUrlFull}" download="true">Download</a>
                    <div class="media-content__meta">
                        <div>
                            ${likesHtml}
                            ${commentsHtml}
                        </div>
                        ${timeAgo ? `<p class="media-content__meta-time"><span></span> ${timeAgo}</p>` : ''}
                    </div>
                </div>
            </li>
        `;
    }

    function renderEmptyTabMessage(tabKey, customMessage) {
        const message = customMessage || `No ${getTabLabel(tabKey)} are available right now.`;

        return `
            <div class="error-message fallback-popup fallback-popup--extension">
                <div class="fallback-popup__text-container">
                    <p class="fallback-popup__text">${message}</p>
                </div>
            </div>
        `;
    }

    function renderPrivateAccountMessage() {
        return `
            <div class="error-message fallback-popup fallback-popup--extension">
                <div class="fallback-popup__text-container">
                    <p class="fallback-popup__text">You have entered the link to a private account. Please, try to use the link to a public account.</p>
                </div>
            </div>
        `;
    }

    function renderInlineLoader() {
        return `
            <div class="loader-component">
                <div class="loader-component__circles">
                    <span class="loader-component__circle"></span>
                    <span class="loader-component__circle"></span>
                    <span class="loader-component__circle"></span>
                </div>
                <p class="loader-component__message">We are downloading the profile. Please wait :)</p>
            </div>
        `;
    }

    function getTabLabel(tabKey) {
        const match = PROFILE_TABS.find((tab) => tab.key === tabKey);
        return match ? match.label : tabKey;
    }

    function displayPostResult(data) {
        let media = data.media || data;
        
        // DEBUG: Log full media structure
        console.log('[displayPostResult] Full data:', data);
        console.log('[displayPostResult] Media object:', media);
        console.log('[displayPostResult] Media is array:', Array.isArray(media));
        
        // Handle case where media is an array (e.g., reel/post response)
        if (Array.isArray(media) && media.length > 0) {
            media = media[0]; // Get first item
            console.log('[displayPostResult] Extracted first item from array:', media);
        }
        
        // Handle Instagram120 API structure
        let mediaUrl = '';
        let downloadUrl = '';
        
        // Check for pictureUrl field first (common in API response)
        if (media.pictureUrl) {
            mediaUrl = media.pictureUrl;
            console.log('[displayPostResult] Found pictureUrl:', mediaUrl);
        }
        // Check for urls array structure
        else if (media.urls?.length > 0) {
            const firstUrl = media.urls[0];
            mediaUrl = firstUrl.url || firstUrl.pictureUrl || '';
            downloadUrl = firstUrl.url || '';
            console.log('[displayPostResult] Found urls array:', media.urls);
        }
        // Get thumbnail from image_versions2.candidates (Instagram120 API structure)
        else if (media.image_versions2?.candidates?.length > 0) {
            mediaUrl = media.image_versions2.candidates[0].url || '';
            console.log('[displayPostResult] Found image_versions2:', mediaUrl);
        }
        // Fallback to legacy fields
        if (!mediaUrl) {
            mediaUrl = media.thumbnail_url || media.display_url || media.cover || '';
            console.log('[displayPostResult] Using fallback mediaUrl:', mediaUrl);
        }
        
        // Get video download URL from urls array first
        if (media.urls?.length > 0) {
            // Find video URL in urls array
            const videoItem = media.urls.find(u => u.type === 'video' || u.url?.includes('.mp4'));
            if (videoItem) {
                downloadUrl = videoItem.url || '';
            } else {
                downloadUrl = media.urls[0].url || '';
            }
            console.log('[displayPostResult] Download URL from urls:', downloadUrl);
        }
        else if (media.video_versions?.length > 0) {
            downloadUrl = media.video_versions[0].url || '';
            console.log('[displayPostResult] Found video_versions:', downloadUrl);
        }
        // Fallback to legacy fields or use image URL
        if (!downloadUrl) {
            downloadUrl = media.video_url || media.display_url || mediaUrl || '';
            console.log('[displayPostResult] Using fallback downloadUrl:', downloadUrl);
        }
        
        console.log('[displayPostResult] Final URLs - mediaUrl:', mediaUrl, 'downloadUrl:', downloadUrl);
        
        mediaUrl = getFullImageUrl(mediaUrl);
        downloadUrl = getFullImageUrl(downloadUrl);
        
        // Extract metadata
        const meta = media.meta || {};
        const caption = meta.title || media.caption?.text || media.caption || '';
        const likesCount = meta.like_count || media.like_count || media.likes || 0;
        const commentsCount = meta.comment_count || media.comment_count || media.comments || 0;
        const timestamp = meta.taken_at || media.taken_at || media.timestamp || null;
        const timeAgo = timestamp ? getTimeAgo(timestamp) : '';
        const timeTitle = timestamp ? new Date(timestamp * 1000).toLocaleString() : '';
        
        // Check if it's a video/reel - also check if downloadUrl contains .mp4
        const isVideo = media.media_type === 2 
            || media.video_versions?.length > 0 
            || media.urls?.some(u => u.type === 'video')
            || (downloadUrl && downloadUrl.includes('.mp4'))
            || media.product_type === 'clips'; // Reels have product_type = clips
        
        // Get comments if available
        const comments = meta.comments || media.comments_list || [];
        
        // Get dimensions for aspect ratio
        const width = meta.original_width || media.original_width || 640;
        const height = meta.original_height || media.original_height || 1136;
        const aspectRatio = `${width} / ${height}`;
        const isVertical = height > width;
        const aspectClass = isVertical ? 'media-content--less_0-75' : 'media-content--more';

        // Build comments HTML
        let commentsHtml = '';
        if (Array.isArray(comments) && comments.length > 0) {
            commentsHtml = comments.slice(0, 10).map(comment => {
                const username = comment.user?.username || comment.username || 'user';
                const text = comment.text || '';
                return `
                    <ul class="output-list__comments">
                        <li>
                            <p class="output-list__comments-username">
                                <a class="caption-link comment-username" href="https://www.instagram.com/${username}" target="_blank">@${username}</a>
                            </p>
                            <p>${text}</p>
                        </li>
                    </ul>
                `;
            }).join('');
        }

        // Render với template mới cho reels/posts
        searchResultContainer.innerHTML = `
            <div class="output-component">
                <p class="output-component__title">Search result</p>
                <div class="output-list">
                    <ul class="output-list__list output-list__list--one-item">
                        <li class="output-list__item">
                            <div class="media-content ${aspectClass}" style="aspect-ratio: ${aspectRatio};"
                                data-video-url="${downloadUrl}"
                                data-media-url="${mediaUrl}"
                                data-is-video="${isVideo}"
                                data-time-ago="${timeAgo}"
                                data-aspect-ratio="${aspectRatio}">
                                <img class="media-content__image" src="${mediaUrl}" alt="preview">
                                <div class="tags media-content__tags">
                                    ${isVideo ? '<span class="tags__item tags__item--video"></span>' : ''}
                                    <button class="tags__item tags__item--image tags__item_pointer"
                                        data-video-url="${downloadUrl}"
                                        data-media-url="${mediaUrl}"
                                        data-is-video="${isVideo}"
                                        data-time-ago="${timeAgo}"
                                        data-aspect-ratio="${aspectRatio}"></button>
                                </div>
                            </div>
                            <div class="media-content__info">
                                <a class="button button--filled button__download" href="${downloadUrl}" download="true">Download${isVideo ? ' Video' : ''}</a>
                            </div>
                        </li>
                        <div class="trigger" style="height: 1px;"></div>
                    </ul>
                    ${caption ? `
                    <div class="output-list__caption">
                        <p>${truncateText(caption, 200)}</p>
                    </div>
                    ` : ''}
                    <div class="output-list__info">
                        ${timeAgo ? `<p class="output-list__info-time" title="${timeTitle}"><span></span> ${timeAgo}</p>` : ''}
                        ${likesCount ? `<p class="output-list__info-like"><span></span> ${likesCount.toLocaleString()} likes</p>` : ''}
                        ${commentsCount ? `<p class="output-list__info-comment"><span></span> ${commentsCount.toLocaleString()} comments</p>` : ''}
                    </div>
                    ${commentsHtml}
                </div>
            </div>
        `;
        searchResultContainer.style.display = 'block';
        
        // Setup click handlers for media preview
        setupReelMediaHandlers();
    }
    
    /**
     * Setup event handlers for reel/post media clicks
     */
    function setupReelMediaHandlers() {
        if (!searchResultContainer) return;
        
        // Click on image to open video modal
        const mediaContent = searchResultContainer.querySelector('.output-list .media-content[data-video-url]');
        if (mediaContent) {
            const img = mediaContent.querySelector('.media-content__image');
            if (img) {
                img.style.cursor = 'pointer';
                img.addEventListener('click', (e) => {
                    e.preventDefault();
                    const videoUrl = mediaContent.dataset.videoUrl;
                    const mediaUrl = mediaContent.dataset.mediaUrl;
                    const isVideo = mediaContent.dataset.isVideo === 'true';
                    const timeAgo = mediaContent.dataset.timeAgo;
                    const aspectRatio = mediaContent.dataset.aspectRatio;
                    
                    openVideoModal({
                        videoUrl,
                        mediaUrl,
                        isVideo,
                        timeAgo,
                        aspectRatio
                    });
                });
            }
        }
        
        // Click on expand button to open modal
        const expandButton = searchResultContainer.querySelector('.output-list .tags__item--image.tags__item_pointer');
        if (expandButton) {
            expandButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const videoUrl = expandButton.dataset.videoUrl;
                const mediaUrl = expandButton.dataset.mediaUrl;
                const isVideo = expandButton.dataset.isVideo === 'true';
                const timeAgo = expandButton.dataset.timeAgo;
                const aspectRatio = expandButton.dataset.aspectRatio;
                
                openVideoModal({
                    videoUrl,
                    mediaUrl,
                    isVideo,
                    timeAgo,
                    aspectRatio
                });
            });
        }
        
        // Click on video icon to open modal (same as expand button)
        const videoIcon = searchResultContainer.querySelector('.output-list .tags__item--video');
        if (videoIcon && mediaContent) {
            videoIcon.style.cursor = 'pointer';
            videoIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const videoUrl = mediaContent.dataset.videoUrl;
                const mediaUrl = mediaContent.dataset.mediaUrl;
                const isVideo = mediaContent.dataset.isVideo === 'true';
                const timeAgo = mediaContent.dataset.timeAgo;
                const aspectRatio = mediaContent.dataset.aspectRatio;
                
                openVideoModal({
                    videoUrl,
                    mediaUrl,
                    isVideo,
                    timeAgo,
                    aspectRatio
                });
            });
        }
    }
    
    /**
     * Open video/media modal for reels and posts
     */
    function openVideoModal(options = {}) {
        const {
            videoUrl = '',
            mediaUrl = '',
            isVideo = false,
            timeAgo = '',
            aspectRatio = '720 / 1280'
        } = options;
        
        const modalId = 'media-preview-modal';
        const downloadUrl = videoUrl || mediaUrl;
        
        // Parse aspect ratio for wrapper class
        const [width, height] = aspectRatio.split('/').map(s => parseInt(s.trim()));
        const isVertical = height > width;
        const wrapperClass = isVertical ? 'media-modal-item__wrapper--less' : 'media-modal-item__wrapper--more';
        
        // Determine if we should show video - if videoUrl contains .mp4, always show video
        const shouldShowVideo = isVideo || (videoUrl && videoUrl.includes('.mp4'));
        
        // Create media element (video or image) - always use videoUrl for video
        const mediaHtml = shouldShowVideo 
            ? `<video class="media-modal-item__content" src="${videoUrl}" preload="auto" autoplay playsinline controls></video>`
            : `<img class="media-modal-item__content" src="${mediaUrl}" alt="preview">`;
        
        const modalHtml = `
            <div class="media-modal" id="${modalId}">
                <div class="media-modal__content">
                    ${timeAgo ? `
                    <div class="media-modal__meta">
                        <p class="media-modal__time">${timeAgo}</p>
                    </div>
                    ` : ''}
                    <div class="advancement-bar media-modal__advancement-bar">
                        <div class="advancement-bar__item advancement-bar__item--active" style="width: 100%;"></div>
                    </div>
                    <div class="media-modal__media">
                        <button class="media-modal__button media-modal__button--prev media-modal__button--disabled" type="button" disabled></button>
                        <div class="media-modal-item">
                            <div class="media-modal-item__wrapper ${wrapperClass}" style="aspect-ratio: ${aspectRatio};">
                                ${mediaHtml}
                            </div>
                        </div>
                        <a class="button button--filled media-modal__button--desktop-download" href="${downloadUrl}" download="true">
                            <img src="${DOWNLOAD_BUTTON_ICON}" alt="Download">
                        </a>
                        <button class="media-modal__button media-modal__button--next media-modal__button--disabled" type="button" disabled></button>
                    </div>
                    <a class="button button--filled media-modal__button--download" href="${downloadUrl}" download="true">Download</a>
                </div>
                <button class="media-modal__button media-modal__button--go-back">Go back</button>
            </div>
        `;
        
        // Remove existing modal
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Setup close handlers
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        const goBackBtn = modal.querySelector('.media-modal__button--go-back');
        
        const closeModal = () => {
            // Pause video if playing
            const video = modal.querySelector('video');
            if (video) {
                video.pause();
            }
            modal.remove();
            document.removeEventListener('keydown', handleEscape);
        };
        
        if (goBackBtn) {
            goBackBtn.addEventListener('click', closeModal);
        }
        
        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Escape key to close
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    function getTimeAgo(timestamp) {
        const now = Date.now() / 1000;
        const diff = now - timestamp;

        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
        if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
        return `${Math.floor(diff / 31536000)} years ago`;
    }

    function truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }


    // Initialize button visibility
    updateButtonsVisibility();
});


