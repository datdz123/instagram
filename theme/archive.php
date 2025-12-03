<?php
/**
 * The template for displaying archive pages
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package instagram
 */

get_header();
?>

	<section id="primary" class="news-archive">
		<main id="main" class="news-archive__main">

		<?php if ( have_posts() ) : ?>
			<?php
			$term        = get_queried_object();
			$term_name   = isset( $term->name ) ? $term->name : get_the_archive_title();
			$term_desc   = isset( $term->description ) ? $term->description : '';
			$post_count  = $wp_query->found_posts;
			?>

			<header class="news-archive__hero">
				<p class="news-archive__eyebrow"><?php esc_html_e( 'Chuyên mục', 'instagram' ); ?></p>
				<h1 class="news-archive__title"><?php echo esc_html( $term_name ); ?></h1>
				<?php if ( $term_desc ) : ?>
					<div class="news-archive__description the_content">
						<?php echo wp_kses_post( wpautop( $term_desc ) ); ?>
					</div>
				<?php endif; ?>
				<span class="news-archive__count">
					<?php
					printf(
						esc_html__( '%s bài viết', 'instagram' ),
						number_format_i18n( $post_count )
					);
					?>
				</span>
			</header>

			<div class="news-archive__grid">
				<?php
				while ( have_posts() ) :
					the_post();
					$excerpt = get_the_excerpt();
					?>
					<article id="post-<?php the_ID(); ?>" <?php post_class( 'news-archive__card' ); ?>>
						<a class="news-archive__thumb" href="<?php the_permalink(); ?>">
							<?php
							if ( has_post_thumbnail() ) {
								the_post_thumbnail( 'large' );
							} else {
								echo '<div class="news-archive__thumb--placeholder"></div>';
							}
							?>
						</a>

						<div class="news-archive__card-body">
							<div class="news-archive__card-meta">
								<span><?php echo esc_html( get_the_date( 'd/m/Y' ) ); ?></span>
								<?php
								$post_categories = get_the_category();
								if ( ! empty( $post_categories ) ) :
									?>
									<span class="news-archive__dot" aria-hidden="true"></span>
									<span><?php echo esc_html( $post_categories[0]->name ); ?></span>
								<?php endif; ?>
							</div>

							<h2 class="news-archive__card-title">
								<a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
							</h2>

							<p class="news-archive__card-excerpt">
								<?php echo esc_html( wp_trim_words( $excerpt, 26, '…' ) ); ?>
							</p>

							<a class="news-archive__card-link" href="<?php the_permalink(); ?>">
								<?php esc_html_e( 'Đọc tiếp', 'instagram' ); ?>
							</a>
						</div>
					</article>
					<?php
				endwhile;
				?>
			</div>

			<div class="news-archive__pagination">
				<?php
				the_posts_pagination(
					array(
						'mid_size'  => 2,
						'prev_text' => __( '← Trước', 'instagram' ),
						'next_text' => __( 'Sau →', 'instagram' ),
					)
				);
				?>
			</div>

		<?php else : ?>

			<div class="news-archive__empty">
				<h2><?php esc_html_e( 'Chưa có bài viết', 'instagram' ); ?></h2>
				<p><?php esc_html_e( 'Quay lại sau để xem thêm nội dung mới.', 'instagram' ); ?></p>
			</div>

		<?php endif; ?>
		</main><!-- #main -->
	</section><!-- #primary -->

<?php
get_footer();
