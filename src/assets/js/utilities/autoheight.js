import $ from "jquery";

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

$(document).ready(function () {
    let heightsArray = [];
    $('[similar-height]').each(function () {
        heightsArray.push($(this).attr('similar-height'));
    });

    heightsArray = unique(heightsArray);

    for (let heightName in heightsArray) {
        let maxHeight = 0;
        $('[similar-height=' + heightsArray[heightName] + ']').each(function () {
            if ($(this).height() > maxHeight) {
                maxHeight = $(this).height();
            }
        });
        $('[similar-height=' + heightsArray[heightName] + ']').each(function () {
            $(this).height(maxHeight);
        });
    }

    $(window).on('resize', function () {
        for (let heightName in heightsArray) {
            let maxHeight = 0;
            $('[similar-height=' + heightsArray[heightName] + ']').each(function () {
                $(this).height('auto');
                if ($(this).height() > maxHeight) {
                    maxHeight = $(this).height();
                }
            });
            $('[similar-height=' + heightsArray[heightName] + ']').each(function () {
                $(this).height(maxHeight);
            });
        }
    });
})