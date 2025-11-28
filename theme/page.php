<?php
/**
 * The template for displaying all pages
 *
 * This is the template that displays all pages by default. Please note that
 * this is the WordPress construct of pages: specifically, posts with a post
 * type of `page`.
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package gnws
 */

get_header();
?>

<main>
	<?php the_content() ?>
</main>
<h1 class="hidden">
	<?php echo wp_get_document_title(); ?>
</h1>

<?php
get_footer();
