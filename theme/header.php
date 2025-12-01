<?php

/**
 * The header for our theme
 *
 * This is the template that displays the `head` element and everything up
 * until the `#content` element.
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package gnws
 */

?>
<!doctype html>
<html <?php language_attributes(); ?>>

<head>
        <meta charset="<?php bloginfo('charset'); ?>">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="profile" href="https://gmpg.org/xfn/11">
        <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>

        <?php wp_body_open(); ?>

       <header class="header">
               <div class="header__logo">
                       <?php
                       if (function_exists('the_custom_logo') && has_custom_logo()) {
                               
                        the_custom_logo();
                       } 
                       ?>
               </div>
                <nav class="header__nav">
                        <a href="https://fastdl.app/faq" class="header__faq">
                                Faq
                        </a>
                        <div class="header__lang">
                                <button class="header__lang-button">
                                        en
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style="display: flex">
                                                <path d="M6 8L10 12L14 8" stroke="black" stroke-width="1.5" stroke-linecap="round"></path>
                                        </svg>
                                </button>
                                <ul class="header__lang-menu">
                                        <li>
                                                <a href="https://fastdl.app/ar">
                                                        العربية
                                                </a>
                                        </li>
                                        <li>
                                                <a href="https://fastdl.app/bn">
                                                        भोजपुरी
                                                </a>
                                        </li>
                                        <li>
                                                <a href="https://fastdl.app/cs">
                                                        Čeština
                                                </a>
                                        </li>
                                        <li>
                                                <a href="https://fastdl.app/de">
                                                        Deutsch
                                                </a>
                                        </li>
                                        <li>
                                                <span>
                                                        English
                                                </span>
                                        </li>
                                        <li>
                                                <a href="https://fastdl.app/es">
                                                        Español
                                                </a>
                                        </li>
                                        <li>
                                                <a href="https://fastdl.app/fa">
                                                        فارسی
                                                </a>
                                        </li>
                                        <li>
                                                <a href="https://fastdl.app/fr">
                                                        Français
                                                </a>
                                        </li>
                                        <li>
                                                <a href="https://fastdl.app/hi">
                                                        हिन्दी
                                                </a>
                                        </li>
                                        <li>
                                                <a href="https://fastdl.app/id">
                                                        Bahasa Indonesia
                                                </a>
                                        </li>
                                        <li>
                                                <a href="https://fastdl.app/it">
                                                        Italiano
                                                </a>
                                        </li>
                                        <li>
                                                <a href="https://fastdl.app/ja">
                                                        日本語
                                                </a>
                                        </li>
                                        <li>
                                                <a href="https://fastdl.app/ko">
                                                        한국어
                                                </a>
                                        </li>
                                        <li>
                                                <a href="https://fastdl.app/ms">
                                                        Bahasa Melayu
                                                </a>
                                        </li>
                                        <li>
                                                <a href="https://fastdl.app/nl">
                                                        Nederlands
                                                </a>
                                        </li>
                                        <li>
                                                <a href="https://fastdl.app/pl">
                                                        Polski
                                                </a>
                                        </li>
                                        <li>
                                                <a href="https://fastdl.app/pt">
                                                        Português
                                                </a>
                                        </li>
                                        <li>
                                                <a href="https://fastdl.app/ro">
                                                        Română
                                                </a>
                                        </li>
                                        <li>
                                                <a href="https://fastdl.app/ru">
                                                        Русский
                                                </a>
                                        </li>
                                        <li>
                                                <a href="https://fastdl.app/sk">
                                                        Slovenčina
                                                </a>
                                        </li>
                                        <li>
                                                <a href="https://fastdl.app/sv">
                                                        Svenska
                                                </a>
                                        </li>
                                        <li>
                                                <a href="https://fastdl.app/th">
                                                        ไทย / Phasa Thai
                                                </a>
                                        </li>
                                        <li>
                                                <a href="https://fastdl.app/tr">
                                                        Türkçe
                                                </a>
                                        </li>
                                        <li>
                                                <a href="https://fastdl.app/vi">
                                                        Tiếng Việt
                                                </a>
                                        </li>
                                        <li>
                                                <a href="https://fastdl.app/zh">
                                                        中文
                                                </a>
                                        </li>
                                </ul>
                        </div>
                </nav>
        </header>