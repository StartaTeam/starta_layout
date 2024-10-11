module.exports = function(value, options) {
    if (value && value.trim() !== '') {
        // Возвращает содержимое блока, если условие истинно
        return options.fn(this);
    } else {
        // В противном случае возвращает альтернативное содержимое
        return options.inverse(this);
    }
};