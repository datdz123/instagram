<?php

/**
Template Name: Giao diện
 */

get_header();
?>
<main>
	<?php
	if ( have_rows( 'template_components' ) )
	{
		while ( have_rows( 'template_components' ) ) :
			the_row();
			$module_name = get_row_layout();
			switch ( $module_name ) :
				case $module_name:
					get_template_part( 'components/' . $module_name );
			endswitch;
		endwhile;
	}
	?>
	<h1 class="hidden">
		<?php echo wp_title() ?>
	</h1>

</main>

<?php
get_footer();