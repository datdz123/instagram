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

<?php if (!empty($block['data']['preview_image_help']) && !empty($is_preview)): ?>
    <img src="<?php echo esc_url($block['data']['preview_image_help']); ?>" style="width:100%;height:auto;" />
    <?php return; ?>
<?php endif; ?>

<?php
$hideBlock = get_field('hide_block');
if (!$hideBlock):
?>
<div <?php echo esc_attr($anchor); ?> class="<?php echo esc_attr($class_name); ?>">
<section class="section-instruction">
    <?php if(get_field('title')) : ?>
    <h2 class="section-instruction__title"><?php the_field('title'); ?></h2>
    <?php endif; ?>
    <?php if(get_field('description')) : ?>
    <p class="section-instruction__text"><?php the_field('description'); ?></p>
    <?php endif; ?>
    <ul class="section-instruction__list">
        <?php if(have_rows('list_content')):?>
            <?php while(have_rows('list_content')): the_row();?>
                <li>
                    <picture>
                        <source type="image/webp" srcset="<?php echo wp_get_attachment_image_url(get_sub_field('img'), 'full'); ?>"><img src="<?php echo wp_get_attachment_image_url(get_sub_field('img'), 'full'); ?>" loading="lazy" alt="<?php the_sub_field('title'); ?>" width="312" height="198">
                    </picture>
                    <div>
                        <?php if(get_sub_field('title')) : ?>
                            <h3><?php the_sub_field('title'); ?></h3>
                        <?php endif; ?>
                        <?php if(get_sub_field('description')) : ?>
                            <p><?php the_sub_field('description'); ?></p>
                        <?php endif; ?>
                    </div>
                </li>
            <?php endwhile;?>
        <?php endif;?>
        
    </ul>
</section>
</div>
<?php endif; ?>