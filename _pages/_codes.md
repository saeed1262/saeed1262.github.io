---
layout: page
permalink: /codes/
title: Codes
nav: codes
description: A quick look at the codes and programs that I have shared on GitHub. You can also see my statistics.
---

<!-- STYLE -->
{% assign themes = "light_theme" %}
{% assign title_color = site.data.github_style.theme[themes].title_color %}
{% assign text_color = site.data.github_style.theme[themes].text_color %}
{% assign icon_color = site.data.github_style.theme[themes].icon_color %}
{% assign bg_color = site.data.github_style.theme[themes].bg_color %}
{% assign border_color = site.data.github_style.theme[themes].border_color %}
{% assign style = '&title_color=' | append: title_color | append: '&text_color=' | append: text_color | append: '&icon_color=' | append: icon_color | append: '&bg_color=' | append: bg_color | append: '&border_color=' | append: border_color %}

{% for user in site.data.github %}

<h2>GitHub: {{ user.username }}</h2>

<div class="repocards">

<div class="repocard-single">
<a href="https://github.com/{{ user.username }}"><img class="repocard-img" alt="{{ user.username }} GitHub Stats" src="https://github-readme-stats.vercel.app/api?username={{ user.username }}{{style}}"></a>
</div>
<div class="repocard-single">
<a href="https://github.com/{{ user.username }}"><img class="repocard-img" alt="{{ user.username }} Most Used Languages" src="https://github-readme-stats.vercel.app/api/top-langs/?username={{ user.username }}{{style}}&layout=compact"></a>
</div>

</div>

## Repositories

<div class="repocards">

{% for repository in user.repositories %}

<div class="repocard-single">

<a href="https://github.com/{{ user.username }}/{{ repository}}">
  <img class="repocard-img" alt="{{ user.username }} repository - {{ repository}}" src="https://github-readme-stats.vercel.app/api/pin/?username={{ user.username }}&repo={{ repository}}{{style}}">
</a>
  
</div>

{% endfor %}

</div>

{% endfor %}
