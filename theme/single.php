<?php
/**
 * The template for displaying all single posts
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/#single-post
 *
 * @package gnws
 */

get_header();
?>

	<section id="primary" class="news-detail">
		<main id="main" class="news-detail__main">

			<?php
			/* Start the Loop */
			while ( have_posts() ) :
				the_post();
				$categories  = get_the_category();
				$category    = ! empty( $categories ) ? $categories[0] : null;
				$readingTime = str_word_count( wp_strip_all_tags( get_the_content() ) );
				$readingTime = ceil( $readingTime / 200 );
				?>

				<article id="post-<?php the_ID(); ?>" <?php post_class( 'news-detail__article' ); ?>>

					<div class="news-detail__hero">
						<div class="news-detail__hero-content">
							<?php if ( $category ) : ?>
								<a class="news-detail__badge" href="<?php echo esc_url( get_category_link( $category ) ); ?>">
									<?php echo esc_html( $category->name ); ?>
								</a>
							<?php endif; ?>
							<h1 class="news-detail__title"><?php the_title(); ?></h1>
							<div class="news-detail__meta">
								<span><?php echo esc_html( get_the_date( 'd/m/Y' ) ); ?></span>
								<span class="news-detail__dot" aria-hidden="true"></span>
								<span><?php printf( esc_html__( '%s phút đọc', 'gnws' ), $readingTime ); ?></span>
							</div>
						</div>

						<?php if ( has_post_thumbnail() ) : ?>
							<div class="news-detail__thumbnail">
								<?php the_post_thumbnail( 'large' ); ?>
							</div>
						<?php endif; ?>
					</div>

					<div class="news-detail__layout">
						<div class="news-detail__content the_content">
							<?php the_content(); ?>
						</div>

						<aside class="news-detail__sidebar">
							<div class="news-detail__card">
								<h3><?php esc_html_e( 'Thông tin bài viết', 'gnws' ); ?></h3>
								<ul>
									<li>
										<span><?php esc_html_e( 'Tác giả', 'gnws' ); ?></span>
										<strong><?php the_author(); ?></strong>
									</li>
									<li>
										<span><?php esc_html_e( 'Ngày đăng', 'gnws' ); ?></span>
										<strong><?php echo esc_html( get_the_date( 'd/m/Y' ) ); ?></strong>
									</li>
									<li>
										<span><?php esc_html_e( 'Thời gian đọc', 'gnws' ); ?></span>
										<strong><?php printf( esc_html__( '%s phút', 'gnws' ), $readingTime ); ?></strong>
									</li>
								</ul>
							</div>

							<div class="news-detail__card news-detail__share">
								<h3><?php esc_html_e( 'Chia sẻ bài viết', 'gnws' ); ?></h3>
								<div class="news-detail__share-links">
									<a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo rawurlencode( get_permalink() ); ?>" target="_blank" rel="noopener noreferrer">Facebook</a>
									<a href="https://twitter.com/intent/tweet?url=<?php echo rawurlencode( get_permalink() ); ?>&text=<?php echo rawurlencode( get_the_title() ); ?>" target="_blank" rel="noopener noreferrer">Twitter</a>
									<a href="https://www.linkedin.com/sharing/share-offsite/?url=<?php echo rawurlencode( get_permalink() ); ?>" target="_blank" rel="noopener noreferrer">LinkedIn</a>
								</div>
							</div>
						</aside>
					</div>

					<?php
					$blog_page_id = (int) get_option( 'page_for_posts' );
					$blog_page    = $blog_page_id ? get_permalink( $blog_page_id ) : get_post_type_archive_link( 'post' );
					if ( ! $blog_page ) {
						$blog_page = home_url( '/' );
					}

					$related_args = array(
						'post_type'           => 'post',
						'posts_per_page'      => 3,
						'post__not_in'        => array( get_the_ID() ),
						'ignore_sticky_posts' => true,
					);

					if ( $category ) {
						$related_args['category__in'] = array( $category->term_id );
					}

					$related_query = new WP_Query( $related_args );

					if ( $related_query->have_posts() ) :
						?>
						<div class="news-detail__related">
							<div class="news-detail__related-head">
								<h3><?php esc_html_e( 'Bài viết liên quan', 'gnws' ); ?></h3>
								<a class="news-detail__related-all" href="<?php echo esc_url( $blog_page ); ?>">
									<?php esc_html_e( 'Xem tất cả', 'gnws' ); ?>
								</a>
							</div>

							<div class="news-detail__related-list">
								<?php
								while ( $related_query->have_posts() ) :
									$related_query->the_post();
									?>
									<a class="news-detail__related-item" href="<?php the_permalink(); ?>">
										<?php if ( has_post_thumbnail() ) : ?>
											<div class="news-detail__related-thumb">
												<?php the_post_thumbnail( 'medium_large' ); ?>
											</div>
										<?php endif; ?>
										<div class="news-detail__related-meta">
											<span><?php echo esc_html( get_the_date( 'd/m/Y' ) ); ?></span>
											<h4><?php the_title(); ?></h4>
										</div>
									</a>
									<?php
								endwhile;
								wp_reset_postdata();
								?>
							</div>
						</div>
						<?php
					endif;
					?>

					<div class="news-detail__after">
						<?php
						the_post_navigation(
							array(
								'next_text' => '<span class="news-detail__nav-label">' . __( 'Bài tiếp theo', 'gnws' ) . '</span><span class="news-detail__nav-title">%title</span>',
								'prev_text' => '<span class="news-detail__nav-label">' . __( 'Bài trước', 'gnws' ) . '</span><span class="news-detail__nav-title">%title</span>',
							)
						);
						?>
					</div>

					
				</article>

				<?php
				// End the loop.
			endwhile;
			?>

		</main><!-- #main -->
	</section><!-- #primary -->

<?php
get_footer();
