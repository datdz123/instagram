<?php

/**
 * The template for displaying the footer
 *
 * Contains the closing of the `#content` element and all content thereafter.
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package gnws
 */

?>
<footer class="footer">
  <div class="custom-logo-link">
  <?php if (get_field('logo', 'option')) : ?>
    <img src="<?php echo wp_get_attachment_image_url(get_field('logo', 'option'), 'full'); ?>" alt="<?php bloginfo('name'); ?>">
  <?php endif; ?>
  </div>
  <div class="footer__links">
  
      <?php if (have_rows('list_link', 'option')) : ?>
        <?php while (have_rows('list_link', 'option')) : the_row(); ?>
        <ul class="footer__list">
          <?php if(have_rows('list_link')) : ?>
            <?php while (have_rows('list_link')) : the_row(); ?>
              <li>
                <a href="<?php the_sub_field('link'); ?>">
                  <?php the_sub_field('title'); ?>
                </a>
              </li>
            <?php endwhile; ?>
          <?php endif; ?>
        </ul>
      <?php endwhile; ?>
    <?php endif; ?>
  </div>
  <div class="footer__copyright">
    <div class="social-link">
      <?php if (get_field('title_social', 'option')) : ?>
        <p><?php the_field('title_social', 'option'); ?></p>
      <?php endif; ?>
      <?php if (have_rows('list_social', 'option')) : ?>
        <ul>
          <?php while (have_rows('list_social', 'option')) : the_row(); ?>

            <li>
              <a href="<?php the_sub_field('link'); ?>">
                <img src="<?php echo wp_get_attachment_image_url(get_sub_field('img'), 'full'); ?>">
              </a>
            </li>

          <?php endwhile; ?>
        </ul>
      <?php endif; ?>
    </div>
    <?php if (get_field('coppy_right', 'option')) : ?>
      <p> <?php the_field('coppy_right', 'option'); ?></p>
    <?php endif; ?>
  </div>
</footer>

<?php wp_footer(); ?>

</body>

</html>