{% extends '_layout.swig' %}
{% import '_macro/post.swig' as post_template %}
{% import '_macro/sidebar.swig' as sidebar_template %}


{% block title %} {{ page.title }} | {{ config.title }} {% endblock %}

{% block page_class %}page-post-detail{% endblock %}
<link type="text/css" href="/fancybox/jquery.fancybox.css" rel="stylesheet">
<div class="instagram">
    <section class="archives album">
        <ul class="img-box-ul">
        </ul>
    </section>
</div>
{% block script_extra %}
<script src="<%- config.root %>js/src/photo.js"></script>
<script src="/fancybox/jquery.fancybox.js"></script>

<script src="/js/src/jquery.lazyload.js"></script>

<script>

</script>

<script type="text/javascript">

    console.log(photo().init())
</script>
{% endblock %}


{% block sidebar %}
  {{ sidebar_template.render(false) }}
{% endblock %}


{% block script_extra %}
  {% if theme.use_motion %}
    <script type="text/javascript" id="motion.page.archive">
      $('.archive-year').velocity('transition.slideLeftIn');
    </script>
  {% endif %}
{% endblock %}
