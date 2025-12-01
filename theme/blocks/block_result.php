<?php
$anchor = '';
$class_name = '';
if (!empty($block['anchor'])) {
    $anchor = 'id="' . esc_attr($block['anchor']) . '" ';
}

if (!empty($block['className'])) {
    $class_name .= ' ' . $block['className'];
}
?>
<?php
if (!empty($block['data']['preview_image_help']) && !empty($is_preview)): ?>
    <img src="<?php echo esc_url($block['data']['preview_image_help']); ?>" style="width:100%;height:auto;" />
    <?php return; ?>
<?php endif; ?>

<?php
$hideBlock = get_field('hide_block');
if (!$hideBlock):
?>
    <div <?php echo esc_attr($anchor); ?> class="<?php echo esc_attr($class_name); ?>">
        <section class="section-text">
            <div class="section-text__card">
                <?php if (get_field('img')) : ?>
                    <picture>
                        <source type="image/webp" srcset="<?php echo wp_get_attachment_image_url(get_field('img'), 'full'); ?>"><img src="<?php echo wp_get_attachment_image_url(get_field('img'), 'full'); ?>" alt="Download Instagram Carousels" width="328" height="250">
                    </picture>
                <?php endif; ?>
                <div class="section-text__content">
                    <?php if (get_field('title')) : ?>
                        <h2><?php the_field('title'); ?></h2>
                    <?php endif; ?>
                    <?php if (get_field('content')) : ?>
                        <p><?php the_field('content'); ?></p>
                    <?php endif; ?>
                </div>
            </div>
        </section>
    </div>
<?php endif; ?>