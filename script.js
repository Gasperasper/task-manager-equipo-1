(function () {
  var STORAGE_KEY = 'task-manager-tasks';
  var tasks = [];

  function loadTasks() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      tasks = raw ? JSON.parse(raw) : [];
    } catch (e) {
      tasks = [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      // almacenamiento no disponible; la app sigue funcionando en memoria
    }
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  var form = document.getElementById('task-form');
  var input = document.getElementById('task-input');
  var list = document.getElementById('task-list');
  var emptyState = document.getElementById('empty-state');
  var tally = document.getElementById('tally');

  function render() {
    list.innerHTML = '';

    if (tasks.length === 0) {
      emptyState.style.display = 'block';
      list.style.display = 'none';
    } else {
      emptyState.style.display = 'none';
      list.style.display = 'flex';
      tasks.forEach(function (task) {
        list.appendChild(buildTaskItem(task));
      });
    }

    var doneCount = tasks.filter(function (t) { return t.done; }).length;
    if (tasks.length === 0) {
      tally.textContent = 'Sin tareas todavía';
    } else {
      tally.textContent = doneCount + ' de ' + tasks.length + ' completadas';
    }
  }

  function buildTaskItem(task) {
    var li = document.createElement('li');
    li.className = 'task' + (task.done ? ' done' : '');

    var checkBtn = document.createElement('button');
    checkBtn.className = 'check';
    checkBtn.type = 'button';
    checkBtn.setAttribute('aria-label', task.done ? 'Marcar como pendiente' : 'Marcar como completada');
    checkBtn.innerHTML = '<svg viewBox="0 0 12 12" fill="none"><path d="M2 6L4.5 8.5L10 3" stroke="' + (task.done ? 'var(--accent-ink)' : 'white') + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    checkBtn.addEventListener('click', function () {
      task.done = !task.done;
      saveTasks();
      render();
    });

    var span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.text;

    var delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.type = 'button';
    delBtn.setAttribute('aria-label', 'Eliminar tarea');
    delBtn.innerHTML = '<svg viewBox="0 0 20 20" fill="none"><path d="M5 5L15 15M15 5L5 15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
    delBtn.addEventListener('click', function () {
      tasks = tasks.filter(function (t) { return t.id !== task.id; });
      saveTasks();
      render();
    });

    li.appendChild(checkBtn);
    li.appendChild(span);
    li.appendChild(delBtn);
    return li;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    tasks.push({ id: uid(), text: text, done: false });
    saveTasks();
    input.value = '';
    render();
    input.focus();
  });

  loadTasks();
  render();
})();