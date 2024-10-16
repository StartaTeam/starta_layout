import $ from "jquery";

$("[data-open]").on("click", function () {
  if ($(this).hasClass("self-active")) {
    $(this).toggleClass("is-active");
  }
  if ($(this).hasClass("btn__burger")) {
    $(this).toggleClass("is-active");
  }
  
  if ('show_backdrop' in $(this).data()){
    $("#modalBackdrop").toggleClass("is-active");
  }

  $("#" + $(this).data("open")).toggleClass("is-active");
  if ($(this).data("fill")) {
    $(`#${$(this).data("open")} #${$(this).data("fill")}`).val($(this).data("value"));
  }
});

// Закрытие модалок
$("[data-close]").on("click", function () {
  if ($(this).data("close")) {
    $(`#${$(this).data("close")}`).removeClass("is-active");
  } else {
    $(this).closest(".modal").removeClass("is-active");
    $("#modalBackdrop").removeClass("is-active");
  }
});

$('[data-close-closest]').on('click', function() {
  $(this).closest('.is-active').removeClass('is-active');
});

$("#modalBackdrop").on("click", function () {
  $(this).removeClass("is-active");
  $(".modal.is-active").removeClass("is-active");
});