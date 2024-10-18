// Variables
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Load tasks from Local Storage
window.onload = function () {
    renderTasks();
};

// Add task
function addTask() {
    const newTaskInput = document.getElementById('newTask');
    const deadlineInput = document.getElementById('taskDeadline');
    const newTaskText = newTaskInput.value.trim();
    const deadline = deadlineInput.value;

    // Validate task
    if (newTaskText.length < 3 || newTaskText.length > 255) {
        alert('Task must be between 3 and 255 characters.');
        return;
    }

    const currentDate = new Date();
    if (deadline && new Date(deadline) <= currentDate) {
        alert('Deadline must be in the future or empty.');
        return;
    }

    const task = { text: newTaskText, deadline: deadline, id: Date.now(), completed: false };
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));

    newTaskInput.value = '';
    deadlineInput.value = '';
    renderTasks();
}

// Render task list
function renderTasks(filteredTasks = tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    filteredTasks.forEach((task) => {
        const li = document.createElement('li');

        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', function () {
            toggleTaskCompletion(task.id);
        });

        // Create task name element
        const taskName = document.createElement('span');
        taskName.innerHTML = highlightSearch(task.text);
        taskName.addEventListener('click', function (event) {
            editTaskText(task.id, taskName);
        });

        // Create deadline element
        const taskDeadline = document.createElement('span');
        taskDeadline.innerHTML = task.deadline ? ` ${new Date(task.deadline).toLocaleString()}` : ' -';
        taskDeadline.addEventListener('click', function (event) {
            editTaskDeadline(task.id, taskDeadline);
        });

        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.onclick = function () {
            deleteTask(task.id);
        };

        li.appendChild(checkbox);
        li.appendChild(taskName);
        li.appendChild(taskDeadline);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });
}

// Toggle task completion
function toggleTaskCompletion(id) {
    const task = tasks.find(t => t.id === id);
    task.completed = !task.completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

// Highlight search text
function highlightSearch(text) {
    const searchQuery = document.getElementById('search').value.trim();
    if (searchQuery.length >= 2) {
        const regex = new RegExp(`(${searchQuery})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    return text;
}

// Search tasks
function searchTasks() {
    const searchQuery = document.getElementById('search').value.toLowerCase();
    const filteredTasks = tasks.filter(task => task.text.toLowerCase().includes(searchQuery));
    renderTasks(filteredTasks);
}

// Delete task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

// Edit task text
function editTaskText(id, taskNameElement) {
    const task = tasks.find(t => t.id === id);
    const input = document.createElement('input');
    input.type = 'text';
    input.value = task.text;
    input.addEventListener('blur', function () {
        const updatedText = input.value.trim();
        if (updatedText.length >= 3 && updatedText.length <= 255) {
            task.text = updatedText;
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
        } else {
            alert('Task name must be between 3 and 255 characters.');
            renderTasks(); // Reset the list if validation fails
        }
    });
    taskNameElement.innerHTML = '';
    taskNameElement.appendChild(input);
    input.focus();
}

// Edit task deadline
function editTaskDeadline(id, taskDeadlineElement) {
    const task = tasks.find(t => t.id === id);
    const input = document.createElement('input');
    input.type = 'datetime-local';
    input.value = task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '';
    input.addEventListener('blur', function () {
        const updatedDeadline = input.value;
        const currentDate = new Date();

        if (updatedDeadline && new Date(updatedDeadline) <= currentDate) {
            alert('Deadline must be in the future.');
            renderTasks(); // Reset the list if validation fails
            return;
        }

        task.deadline = updatedDeadline || null; // Allow null if no deadline
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    });
    taskDeadlineElement.innerHTML = '';
    taskDeadlineElement.appendChild(input);
    input.focus();
}
