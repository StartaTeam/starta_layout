import $ from 'jquery'; // Jquery
import './utils.js'; // Дополнительная логика (Модалки, якорные ссылки)
import { displayRootVariable } from './uikit.js'; // вспомогательный функционал для UIkit

window.jQuery = $;
window.$ = $;

// Проверка инпутов на пустоту или если номер не до конца заполнен
$("input[required],textarea[required]").on("blur", function () {
  if ($(this).val().length == 0) {
    $(this).closest(".input_container").addClass("error");
  } else {
    $(this).closest(".input_container").removeClass("error");
  }
});
$("input[name*=phone]").on("blur", function () {
  if ($(this).val().length != $(this).attr("maxlength")) {
    $(this).closest(".input_container").addClass("error");
  } else {
    $(this).closest(".input_container").removeClass("error");
  }
});


window.onload = () => {
  displayRootVariable();
};