// dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    const dashboardSection = document.getElementById('dashboard');
    const widgetContainer = document.getElementById('widget-container');
    const addWidgetButton = document.getElementById('add-widget');

    // Load saved widgets from localStorage
    const savedWidgets = JSON.parse(localStorage.getItem('widgets')) || [];
    savedWidgets.forEach(widgetText => addWidget(widgetText));

    // Add new widget
    addWidgetButton.addEventListener('click', () => {
        const widgetName = prompt('Enter widget name:');
        if (widgetName) {
            addWidget(widgetName);
            saveWidgets();
        }
    });

    // Add draggable widget
    function addWidget(text) {
        const widget = document.createElement('div');
        widget.classList.add('widget');
        widget.textContent = text;
        widget.setAttribute('draggable', 'true');
        widgetContainer.appendChild(widget);
        enableDrag(widget);
        saveWidgets();
    }

    // Save widgets to localStorage
    function saveWidgets() {
        const widgetList = Array.from(document.querySelectorAll('.widget')).map(w => w.textContent);
        localStorage.setItem('widgets', JSON.stringify(widgetList));
    }

    // Enable drag-and-drop functionality
    function enableDrag(widget) {
        widget.addEventListener('dragstart', (e) => {
            widget.classList.add('dragging');
        });

        widget.addEventListener('dragend', (e) => {
            widget.classList.remove('dragging');
            saveWidgets();
        });
    }

    widgetContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggingWidget = document.querySelector('.dragging');
        const afterElement = getDragAfterElement(widgetContainer, e.clientY);
        if (afterElement == null) {
            widgetContainer.appendChild(draggingWidget);
        } else {
            widgetContainer.insertBefore(draggingWidget, afterElement);
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.widget:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
});

export function initDashboard() {
    console.log('Dashboard initialized');
}
