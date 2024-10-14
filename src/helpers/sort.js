module.exports = function(array, field, order) {
    if (!Array.isArray(array)) {
        return [];
    }

    const sortedArray = array.slice().sort((a, b) => {
        if (order === 'asc') {
            return (a[field] > b[field]) ? 1 : ((a[field] < b[field]) ? -1 : 0);
        } else if (order === 'desc') {
            return (a[field] < b[field]) ? 1 : ((a[field] > b[field]) ? -1 : 0);
        } else {
            return 0;
        }
    });

    return sortedArray; // Возвращаем отсортированный массив
};
