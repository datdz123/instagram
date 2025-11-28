<?php
add_action( 'acf/init', 'my_acf_init_block_types' );
function my_acf_init_block_types() {
	// if ( function_exists( 'acf_register_block_type' ) )
	// {
	// 	acf_register_block_type( array(
	// 		'name' => 'block_home-banner',
	// 		'title' => ( '[Block] Home banner' ),
	// 		'description' => ( 'block_home-banner' ),
	// 		'render_template' => 'blocks/block_home-banner.php',
	// 		'keywords' => array( 'block_home-banner', 'quote' ),
	// 		'supports' => array(
	// 			'anchor' => true,
	// 		),
	// 		'api_version' => 3, 
	// 		'acf_block_version' => 3, 
	// 		'example' => array(
	// 			'attributes' => array(
	// 				'mode' => 'preview',
	// 				'data' => array(
	// 					'preview_image_help' => get_stylesheet_directory_uri() . '/assets/preview/home-banner.png',
	// 				)
	// 			)
	// 		)
	// 	) );
	// }
}
