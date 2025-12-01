
document.addEventListener('DOMContentLoaded', () => {
  console.log('script.js loaded');
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
      console.log('searchForm not found');
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
    const PROFILE_TABS = [
        { key: 'posts', label: 'posts' },
        { key: 'stories', label: 'stories' },
        { key: 'highlights', label: 'highlights' },
        { key: 'reels', label: 'reels' },
    ];

    const profileViewState = {
        username: '',
        profileUrl: '',
        isPrivate: false,
        posts: [],
        sections: {},
        pagination: {}, // lưu maxId cho từng tab nếu cần
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
    window.handleInputChange = function() {
        currentQuery = searchInput.value.trim();
        updateButtonsVisibility();
    };

    // Handle paste from clipboard
    window.handlePasteButtonClick = async function() {
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
    window.handleClearButtonClick = function() {
        searchInput.value = '';
        currentQuery = '';
        updateButtonsVisibility();
        clearSearchResult();
    };

    // Handle search button
    window.handleSearchButtonClick = async function() {
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
            console.log('Sending request to ajax-instagram-handler.php with URL:', normalizedQuery);

            const response = await fetch('/wp-content/themes/instagram/ajax-instagram-handler.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: normalizedQuery })
            });

            console.log('Handler HTTP status:', response.status);

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
            
            console.log('API Response:', result);

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
        } catch (error) {
            console.error('Error:', error);
            showError('An error occurred while processing your request. Please check console for details.');
        } finally {
            searchButton.disabled = false;
        }
    };

    // Handle paste event
    window.handleInputPaste = function(e) {
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

        // Check if it's profile data or post data
        if (data.user || data.username) {
            displayProfileResult(data);
        } else if (data.media) {
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
        profileViewState.isPrivate = isPrivate;
        profileViewState.posts = posts;
        profileViewState.sections = {
            posts,
        };

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
                                    <div class="avatar__button">
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
                            ${renderTabData('posts', posts, { isPrivate })}
                        </div>
                    </div>
                </div>
            </section>
        `;
        searchResultContainer.style.display = 'block';
        setupProfileTabHandlers();
    }

    function setupProfileTabHandlers() {
        if (!searchResultContainer) return;

        const tabButtons = searchResultContainer.querySelectorAll('.tabs-component__button');
        if (!tabButtons.length) {
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

        if (tabKey === 'posts') {
            tabContent.innerHTML = renderTabData('posts', profileViewState.posts, { isPrivate: profileViewState.isPrivate });
            return;
        }

        if (profileViewState.sections[tabKey]) {
            tabContent.innerHTML = renderTabData(tabKey, profileViewState.sections[tabKey]);
            return;
        }

        tabContent.innerHTML = renderInlineLoader();
        fetchProfileTabData(tabKey, tabContent);
    }

    function fetchProfileTabData(tabKey, tabContent) {
        if (!profileViewState.username) {
            return;
        }

        const currentMaxId = profileViewState.pagination[tabKey] || '';

        console.log('Fetching profile tab data:', {
            tabKey,
            username: profileViewState.username,
            maxId: currentMaxId,
        });

        fetch('/wp-content/themes/instagram/ajax-instagram-handler.php', {
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
                console.log(`Tab "${tabKey}" handler HTTP status:`, response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Tab "${tabKey}" handler HTTP error:`, errorText);
                    throw new Error(`HTTP ${response.status}`);
                }

                return response.json();
            })
            .then((result) => {
                if (!tabContent || tabContent.getAttribute('data-active-tab') !== tabKey) {
                    return;
                }

                if (result.success) {
                    // Lưu lại maxId nếu API trả về để phân trang (nếu có)
                    if (result.data && typeof result.data.next_max_id !== 'undefined') {
                        profileViewState.pagination[tabKey] = result.data.next_max_id;
                    }

                    profileViewState.sections[tabKey] = result.data;
                    tabContent.innerHTML = renderTabData(tabKey, result.data);
                } else {
                    tabContent.innerHTML = renderEmptyTabMessage(tabKey, result.error || `Failed to load ${tabKey}`);
                }
            })
            .catch((error) => {
                console.error(`Error fetching ${tabKey}:`, error);
                if (tabContent && tabContent.getAttribute('data-active-tab') === tabKey) {
                    tabContent.innerHTML = renderEmptyTabMessage(tabKey, 'Unable to load this content right now');
                }
            });
    }

    function renderTabData(tabKey, payload, options = {}) {
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

    function normalizeMediaItems(payload) {
        if (!payload) {
            return [];
        }

        const sourceItems = Array.isArray(payload)
            ? payload
            : payload.items || payload.media || payload.data || payload.result || [];

        if (!Array.isArray(sourceItems)) {
            return [];
        }

        return sourceItems.map((item) => {
            const thumbnail = item.thumbnail_url
                || item.display_url
                || item.cover
                || item.preview_url
                || item.image_url
                || item.image
                || item.media_url
                || '';

            const download = item.video_url
                || item.display_url
                || item.url
                || item.resource_url
                || item.download_url
                || thumbnail;

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

    function renderMediaItem(item) {
        const captionHtml = item.caption ? `<p class="media-content__caption">${truncateText(item.caption, 120)}</p>` : '';
        const likesHtml = item.likes ? `<p class="media-content__meta-like"><span></span> ${item.likes}</p>` : '';
        const commentsHtml = item.comments ? `<p class="media-content__meta-comment"><span></span> ${item.comments}</p>` : '';
        const timeAgo = item.timestamp ? getTimeAgo(item.timestamp) : '';

        return `
            <li class="profile-media-list__item">
                <div class="media-content media-content--post">
                    <img class="media-content__image" src="${item.thumbnail}" alt="preview">
                    <div class="tags media-content__tags">
                        <button class="tags__item tags__item--image tags__item_pointer"></button>
                    </div>
                </div>
                <div class="media-content__info">
                    ${captionHtml}
                    <a class="button button--filled button__download" href="${item.download}" download="true">Download</a>
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
        const media = data.media || data;
        const mediaUrl = media.thumbnail_url || media.display_url || '';
        const downloadUrl = media.video_url || media.display_url || '';
        const caption = media.caption?.text || '';
        const likesCount = media.like_count || 0;
        const commentsCount = media.comment_count || 0;

        searchResultContainer.innerHTML = `
            <div class="output-component">
                <p class="output-component__title">Search result</p>
                <div class="output-profile">
                    <ul class="profile-media-list">
                        <li class="profile-media-list__item">
                            <div class="media-content media-content--post">
                                <img class="media-content__image" src="${mediaUrl}" alt="preview">
                            </div>
                            <div class="media-content__info">
                                ${caption ? `<p class="media-content__caption">${caption}</p>` : ''}
                                <a class="button button--filled button__download" href="${downloadUrl}" download="true">Download</a>
                                <div class="media-content__meta">
                                    <div>
                                        ${likesCount ? `<p class="media-content__meta-like"><span></span> ${likesCount}</p>` : ''}
                                        ${commentsCount ? `<p class="media-content__meta-comment"><span></span> ${commentsCount}</p>` : ''}
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        `;
        searchResultContainer.style.display = 'block';
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


