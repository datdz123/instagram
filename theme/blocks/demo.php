<?php
/**
 * Testimonial Block template.
 *
 * @param array $block The block settings and attributes.
 */
$component_name = basename( __FILE__, '.php' );
$anchor = '';
$class_name = '';
if (!empty($block['anchor'])) {
    $anchor = 'id=' . esc_attr($block['anchor']) . '';
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

<section <?php echo esc_attr($anchor); ?> class="<?php echo esc_attr($class_name); ?>" data-component="<?php echo $component_name; ?>">
    
</section>