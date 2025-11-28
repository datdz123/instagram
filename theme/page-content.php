<?php

/**
Template Name: Page content
 */

get_header();
?>
<main>
	<section class="my-20">
		<div class="container the_content">
			<?php the_content() ?>
		</div>
	</section>
</main>
<h1 class="hidden">
	<?php echo wp_get_document_title(); ?>
</h1>
<?php
get_footer();