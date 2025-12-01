<?php
$anchor = '';
$class_name = '';
if (!empty($block['anchor'])) {
  $anchor = 'id="' . esc_attr($block['anchor']) . '" ';
}

if (!empty($block['className'])) {
  $class_name .= ' ' . $block['className'];
}

/**
 * Helper: ưu tiên field trong option page, fallback về field của block hiện tại.
 * Cần bọc trong function_exists vì file block có thể được include nhiều lần.
 */
if (!function_exists('gnws_block_option_field')) {
  function gnws_block_option_field($field, $is_sub = false) {
    $option_value = $is_sub ? get_sub_field($field, 'option') : get_field($field, 'option');
    if ($option_value !== null && $option_value !== '' && $option_value !== false) {
      return $option_value;
    }

    return $is_sub ? get_sub_field($field) : get_field($field);
  }
}
?>

<?php if (!empty($block['data']['preview_image_help']) && !empty($is_preview)): ?>
  <img src="<?php echo esc_url($block['data']['preview_image_help']); ?>" style="width:100%;height:auto;" />
  <?php return; ?>
<?php endif; ?>

<?php
$hideBlock = gnws_block_option_field('hide_block');
if (!$hideBlock):
  $option_has_title = have_rows('list_title', 'option');
  $option_has_content = have_rows('list_content', 'option');
  $btn_title = gnws_block_option_field('title_btn');
  $btn_link = gnws_block_option_field('link');
  $img = gnws_block_option_field('img');
?>
  <div <?php echo esc_attr($anchor); ?> class="<?php echo esc_attr($class_name); ?>">
    <section class="browser-extension">
      <div class="browser-extension__wrapper">
        <div class="browser-extension__content">
          <h2 class="browser-extension__title">

            <?php if ($option_has_title || have_rows('list_title')) : ?>
              <?php
              if ($option_has_title) :
                while (have_rows('list_title', 'option')) : the_row();
                  $title = get_sub_field('title');
                  $color = get_sub_field('color');
                  ?>
                  <?php if ($title) : ?>
                    <?php if ($color) : ?>
                      <span style="color: <?php echo esc_attr($color); ?>;">
                        <?php echo esc_html($title); ?>
                      </span>
                    <?php else : ?>
                      <?php echo esc_html($title); ?>
                    <?php endif; ?>
                  <?php endif; ?>
                <?php endwhile; wp_reset_postdata(); ?>
              <?php else : ?>
                <?php while (have_rows('list_title')) : the_row();
                  $title = get_sub_field('title');
                  $color = get_sub_field('color');
                  ?>
                  <?php if ($title) : ?>
                    <?php if ($color) : ?>
                      <span style="color: <?php echo esc_attr($color); ?>;">
                        <?php echo esc_html($title); ?>
                      </span>
                    <?php else : ?>
                      <?php echo esc_html($title); ?>
                    <?php endif; ?>
                  <?php endif; ?>
                <?php endwhile; ?>
              <?php endif; ?>
            <?php endif; ?>
          </h2>


          <ul class="browser-extension__list">
            <?php if ($option_has_content || have_rows('list_content')): ?>
              <?php if ($option_has_content) : ?>
                <?php while (have_rows('list_content', 'option')): the_row(); ?>
                  <li>
                    <?php if (get_sub_field('icon')) : ?>
                        <img src="<?php echo wp_get_attachment_image_url(get_sub_field('icon'), 'full'); ?>" loading="lazy" alt="<?php the_sub_field('title'); ?>" >
                    <?php endif; ?>
                    <?php if (get_sub_field('content')) : ?>
                      <p><?php the_sub_field('content'); ?></p>
                    <?php endif; ?>
                  </li>
                <?php endwhile; wp_reset_postdata(); ?>
              <?php else : ?>
                <?php while (have_rows('list_content')): the_row(); ?>
                  <li>
                    <?php if (get_sub_field('icon')) : ?>
                        <img src="<?php echo wp_get_attachment_image_url(get_sub_field('icon'), 'full'); ?>" loading="lazy" alt="<?php the_sub_field('title'); ?>" >
                    <?php endif; ?>
                    <?php if (get_sub_field('content')) : ?>
                      <p><?php the_sub_field('content'); ?></p>
                    <?php endif; ?>
                  </li>
                <?php endwhile; ?>
              <?php endif; ?>
            <?php endif; ?>

          </ul>
          <?php if ($btn_title && $btn_link) : ?>
            <a class="browser-extension__link" href="<?php echo esc_url($btn_link); ?>" target="_blank" rel="noreferrer nofollow">
              <?php echo esc_html($btn_title); ?>
            </a>
          <?php endif; ?>

        </div>
        <div class="browser-extension__func">
          <button class="browser-extension__close">
            <?php echo svg('close', 24, 24); ?>
          </button>
          <?php if ($img) : ?>
            <picture class="browser-extension__img-bg">
              <source type="image/webp" srcset="<?php echo wp_get_attachment_image_url($img, 'full'); ?>"><img src="<?php echo wp_get_attachment_image_url($img, 'full'); ?>" loading="lazy" alt="<?php echo esc_attr(get_field('title')); ?>" width="494" height="426">
            </picture>
          <?php endif; ?>
        </div>
      </div>
    </section>
  </div>
<?php endif; ?>