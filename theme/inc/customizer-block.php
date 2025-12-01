<?php
add_action('acf/init', 'my_acf_init_block_types');
function my_acf_init_block_types()
{
	if (function_exists('acf_register_block_type')) {
		acf_register_block_type(
			array(
				'name' => 'block_home-banner',
				'title' => ('[Block] Home banner'),
				'description' => ('Block banner for home page'),
				'render_template' => 'blocks/block_banner.php',
				'keywords' => array('block_home-banner', 'quote'),
				'supports' => array(
					'anchor' => true,
				),
				'api_version' => 3,
				'acf_block_version' => 3,
				'example' => array(
					'attributes' => array(
						'mode' => 'preview',
						'data' => array(
							'preview_image_help' => get_stylesheet_directory_uri() . '/assets/preview/home-banner.png',
						)
					)
				)
			)
		);

		acf_register_block_type(
			array(
				'name' => 'block_result',
				'title' => ('[Block] Result'),
				'description' => ('Block result for home page'),
				'render_template' => 'blocks/block_result.php',
				'keywords' => array('block_result', 'result'),
				'supports' => array(
					'anchor' => true,
				),
				'api_version' => 3,
				'acf_block_version' => 3,
				'example' => array(
					'attributes' => array(
						'mode' => 'preview',
						'data' => array(
							'preview_image_help' => get_stylesheet_directory_uri() . '/assets/preview/block_result.png',
						)
					)
				)
			)
		);

		acf_register_block_type(
			array(
				'name' => 'block_download',
				'title' => ('[Block] Download'),
				'description' => ('Block download for home page'),
				'render_template' => 'blocks/block_download.php',
				'keywords' => array('block_download', 'download'),
				'supports' => array(
					'anchor' => true,
				),
				'api_version' => 3,
				'acf_block_version' => 3,
				'example' => array(
					'attributes' => array(
						'mode' => 'preview',
						'data' => array(
							'preview_image_help' => get_stylesheet_directory_uri() . '/assets/preview/block_download.png',
						)
					)
				)
			)
		);

		acf_register_block_type(
			array(
				'name' => 'block_benefit_home',
				'title' => ('[Block] Benefit Home'),
				'description' => ('Block benefit for home page'),
				'render_template' => 'blocks/block_benefit_home.php',
				'keywords' => array('block_benefit_home', 'benefit'),
				'supports' => array(
					'anchor' => true,
				),
				'api_version' => 3,
				'acf_block_version' => 3,
				'example' => array(
					'attributes' => array(
						'mode' => 'preview',
						'data' => array(
							'preview_image_help' => get_stylesheet_directory_uri() . '/assets/preview/block_benefit_home.png',
						)
					)
				)
			)
		);
		acf_register_block_type(
			array(
				'name' => 'block_benefit',
				'title' => ('[Block] Benefit'),
				'description' => ('Block benefit for home page'),
				'render_template' => 'blocks/block_benefit.php',
				'keywords' => array('block_benefit', 'benefit'),
			'api_version' => 3,
			'acf_block_version' => 3,
			'example' => array(
				'attributes' => array(
					'mode' => 'preview',
					'data' => array(
						'preview_image_help' => get_stylesheet_directory_uri() . '/assets/preview/block_benefit.png',
					)
				)	
			)
			)
					);
		acf_register_block_type(
			array(
				'name' => 'block_feature',
				'title' => ('[Block] Feature'),
				'description' => ('Block feature for home page'),
				'render_template' => 'blocks/block_feature.php',
				'keywords' => array('block_feature', 'feature'),
			'api_version' => 3,
			'acf_block_version' => 3,
			'example' => array(
				'attributes' => array(
					'mode' => 'preview',
					'data' => array(
						'preview_image_help' => get_stylesheet_directory_uri() . '/assets/preview/block_feature.png',
					)
				)
			)
		)
					);
					acf_register_block_type(
			array(
				'name' => 'block_extension',
				'title' => ('[Block] Extension'),
				'description' => ('Block extension for home page'),
				'render_template' => 'blocks/block_extension.php',
				'keywords' => array('block_extension', 'extension'),
		'api_version' => 3,
		'acf_block_version' => 3,
		'example' => array(
			'attributes' => array(
				'mode' => 'preview',
				'data' => array(
					'preview_image_help' => get_stylesheet_directory_uri() . '/assets/preview/block_extension.png',
				)
			)
		)
				)
				);
		acf_register_block_type(
			array(
				'name' => 'block_faq',
				'title' => ('[Block] Faq'),
				'description' => ('Block faq for home page'),
				'render_template' => 'blocks/block_faq.php',
				'keywords' => array('block_faq', 'faq'),
			'api_version' => 3,
			'acf_block_version' => 3,
			'example' => array(
				'attributes' => array(
					'mode' => 'preview',
					'data' => array(
						'preview_image_help' => get_stylesheet_directory_uri() . '/assets/preview/block_faq.png',
					)
				)
			)
		),
		);
	}
}
