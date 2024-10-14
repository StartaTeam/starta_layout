module.exports = function(arg1, operator1, arg2, logicOp, arg3, operator2, arg4, options) {
    let condition1, condition2, result;

    // Первая часть условия
    switch (operator1) {
        case '==':
            condition1 = (arg1 == arg2);
            break;
        case '===':
            condition1 = (arg1 === arg2);
            break;
        case '!=':
            condition1 = (arg1 != arg2);
            break;
        case '!==':
            condition1 = (arg1 !== arg2);
            break;
        case '<':
            condition1 = (arg1 < arg2);
            break;
        case '>':
            condition1 = (arg1 > arg2);
            break;
        case '<=':
            condition1 = (arg1 <= arg2);
            break;
        case '>=':
            condition1 = (arg1 >= arg2);
            break;
        default:
            throw new Error("Некорректный оператор: " + operator1);
    }

    // Вторая часть условия
    switch (operator2) {
        case '==':
            condition2 = (arg3 == arg4);
            break;
        case '===':
            condition2 = (arg3 === arg4);
            break;
        case '!=':
            condition2 = (arg3 != arg4);
            break;
        case '!==':
            condition2 = (arg3 !== arg4);
            break;
        case '<':
            condition2 = (arg3 < arg4);
            break;
        case '>':
            condition2 = (arg3 > arg4);
            break;
        case '<=':
            condition2 = (arg3 <= arg4);
            break;
        case '>=':
            condition2 = (arg3 >= arg4);
            break;
        default:
            throw new Error("Некорректный оператор: " + operator2);
    }

    // Применение логического оператора
    switch (logicOp) {
        case '&&':
            result = condition1 && condition2;
            break;
        case '||':
            result = condition1 || condition2;
            break;
        default:
            throw new Error("Некорректный логический оператор: " + logicOp);
    }

    // Возврат результата
    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
};
