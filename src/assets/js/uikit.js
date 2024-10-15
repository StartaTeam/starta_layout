export function displayRootVariable() {
    const elements = document.querySelectorAll('[ui_root]');

    elements.forEach(element => {
        const variableName = element.getAttribute('ui_root');

        const root = document.documentElement;
        const variableValue = getComputedStyle(root).getPropertyValue(variableName).trim();

        if (variableValue) {
            element.textContent += variableValue;
        } else {
            element.textContent += '[ Значение не найдено ]';
        }
        
    })
}