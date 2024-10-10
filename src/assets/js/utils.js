import $ from 'jquery';

// Тоглим класс is-active для объектов указанных в дата параметре
// Если стоит класс self-active, то при клике будет накидываться класс на указанный элемент в теге и на сам элемент
// Если указан класс with-backdrop, то накидываем на backdrop класс is-active
// Бургер при открытии накидывает класс на всю шапку
$("[data-open]").on("click", function () {
  if ($(this).hasClass("self-active")) {
    $(this).toggleClass("is-active");
  }
  if ($(this).hasClass("header_burger")) {
    $(".header").toggleClass("is-active");
  }
  if ($(this).hasClass("with-backdrop")) {
    $("#backdrop").toggleClass("is-active");
  }
  $("#" + $(this).data("open")).toggleClass("is-active");
});

// Закрытие модалок
$('[data-close]').on('click', function() {
  $(this).closest('.modal').removeClass('is-active');
  $('#backdrop').removeClass('is-active');
});

$('#backdrop').on('click', function() {
  $(this).removeClass('is-active');
  $('.modal.is-active').removeClass('is-active');
});

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

// ReadMore
let maxReadMoreHeight = 280;
if (window.innerWidth < 900) {
  maxReadMoreHeight = 220;
}

$("[data-read-more]").each(function () {
  $(this).data("height", $(this).height());
  $(this).height(maxReadMoreHeight);
});

$(".birdy_read_more").on("click", function () {
  const block = $(this).parent().find("[data-read-more]");
  if ($(this).hasClass("is-active")) {
    block.height(maxReadMoreHeight);
    $(this).text("Читать полностью");
    window.scrollTo({
      top: block.offset().top,
      behavior: "smooth",
    });
  } else {
    block.height(block.data("height"));
    $(this).text("Скрыть");
  }
  $(this).toggleClass("is-active");
});

// Auto height
function unique(arr) {
  let result = [];

  for (let str of arr) {
    if (!result.includes(str)) {
      result.push(str);
    }
  }

  return result;
}

$(document).ready(function() {
  let heightsArray = [];
  $('[similar-height]').each(function() {
    heightsArray.push($(this).attr('similar-height'));
  });
  
  heightsArray = unique(heightsArray);
  
  for(let heightName in heightsArray) {
    let maxHeight = 0;
    $('[similar-height=' + heightsArray[heightName] + ']').each(function() {
      if($(this).height() > maxHeight) {
        maxHeight = $(this).height();
      }
    });
    $('[similar-height=' + heightsArray[heightName] + ']').each(function() {
      $(this).height(maxHeight);
    });
  }
  
  $(window).on('resize', function() {
    for(let heightName in heightsArray) {
      let maxHeight = 0;
      $('[similar-height=' + heightsArray[heightName] + ']').each(function() {
        $(this).height('auto');
        if($(this).height() > maxHeight) {
          maxHeight = $(this).height();
        }
      });
      $('[similar-height=' + heightsArray[heightName] + ']').each(function() {
        $(this).height(maxHeight);
      });
    }
  });
})

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