import $ from 'jquery';

// Links
$('a[data-anchor]').on('click', function(e) {
  e.preventDefault();
  if($('#' + $(this).data('anchor')).length) {
    $([document.documentElement, document.body]).animate({
      scrollTop: $("#" + $(this).data('anchor')).offset().top - 150
    }, 1000);
    $('#sidebar').removeClass('is-active');
  } else {
    location.href = $(this).attr('href');
  }
});

// Go to top
$(window).on("scroll", function() {
  if(window.scrollY > 200) {
    $(".go_to_top").show();    
  } else {
    $(".go_to_top").hide();    
  }
});
$(".go_to_top").on("click", function() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

// Accordion
var accordions = document.querySelectorAll("[data-accordion]");
for(let accordion of accordions) {
  accordion.addEventListener('click', change);
}
function change(event) {
  var targ = event.target;
  if (!targ.dataset.tab_title) return;
  if (targ.classList.contains('is-active')) {
    hideAll();
  } else {
    hideAll();
    targ.classList.add('is-active');
    showText(document.querySelector(`[data-tab_container="${targ.dataset.tab_title}"]`));
  }
}
function hideAll() {
  var titleEl = document.querySelectorAll('[data-tab_title]');
  var containerEl = document.querySelectorAll('[data-tab_container]');
  for (var i = 0; i < titleEl.length; i++) {
    titleEl[i].classList.remove('is-active');
  }
  for (var i = 0; i < containerEl.length; i++) {
    containerEl[i].style.height = '0';
  }
}
function showText(textEl) {
  textEl.style.height = textEl.scrollHeight + 'px';
}