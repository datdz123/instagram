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
<section class="section-faq-custom" itemscope="" itemtype="https://schema.org/FAQPage">
    <?php if(get_field('title')) : ?>
    <h2 class="section-faq__title"><?php the_field('title'); ?></h2>
    <?php endif; ?>
    <?php if(get_field('description')) : ?>
    <p class="section-faq__text"><?php the_field('description'); ?></p>
    <?php endif; ?>
    <ul>
        <?php if(have_rows('list_faq')):?>
            <?php while(have_rows('list_faq')): the_row();?>
                <li itemscope="" itemprop="mainEntity" itemtype="https://schema.org/Question">
                    <?php if(get_sub_field('title')) : ?>
                    <h3 itemprop="name"><?php the_sub_field('title'); ?></h3>
                    <?php endif; ?>
                    <?php if(get_sub_field('content')) : ?>
                        <div itemscope="" itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
                            <div itemprop="text"><?php the_sub_field('content'); ?></div>
                        </div>
                    <?php endif; ?>
                </li>
            <?php endwhile;?>
        <?php endif;?>
        
       
    </ul>
</section>
</div>
<?php endif; ?>
<style>
    .section-faq-custom {
        margin: 64px auto;
        max-width: 1024px;
        padding: 0 20px;
    }
    .section-faq-custom ul{
    display: flex;
    flex-direction: column;
    gap: 24px;
    list-style: none;
    margin: 0;
    padding: 10px 0 0;
    }
    
.section-faq-custom ul h3 {
    color: var(--color-primary);
    font-size: 18px;
    font-weight: 400;
    font-weight: 700;
    line-height: 28px;
    margin: 0 auto 10px;}
    
</style>