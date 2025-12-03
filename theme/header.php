<?php

/**
 * The header for our theme
 *
 * This is the template that displays the `head` element and everything up
 * until the `#content` element.
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package instagram
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
                        <?php if (have_rows('list_page','option')): ?>
                                <?php while (have_rows('list_page','option')): the_row(); ?>
                                <?php if(get_sub_field('title') && get_sub_field('link')):?>
                                        <a href="<?php the_sub_field('link'); ?>" class="header__faq">
                                                <?php the_sub_field('title'); ?>
                                        </a>
                                <?php endif; ?>
                                <?php endwhile; ?>
                        <?php endif; ?>


                        <?php
                        $languages = pll_the_languages(array(
                                'raw'          => 1,
                                'hide_if_empty' => 0,
                                'show_flags'   => 0,
                                'show_names'   => 1,
                        ));

                        $current_lang = pll_current_language('slug');
                        ?>

                        <div class="header__lang">
                                <button class="header__lang-button">
                                        <?php echo strtoupper($current_lang); ?>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" style="display: flex">
                                                <path d="M6 8L10 12L14 8" stroke="black" stroke-width="1.5" stroke-linecap="round" />
                                        </svg>
                                </button>

                                <ul class="header__lang-menu">
                                        <?php foreach ($languages as $lang) : ?>
                                                <li>
                                                        <?php if ($lang['current_lang']) : ?>
                                                                <span><?php echo esc_html($lang['name']); ?></span>
                                                        <?php else : ?>
                                                                <a href="<?php echo esc_url($lang['url']); ?>">
                                                                        <?php echo esc_html($lang['name']); ?>
                                                                </a>
                                                        <?php endif; ?>
                                                </li>
                                        <?php endforeach; ?>
                                </ul>
                        </div>

                </nav>
        </header>