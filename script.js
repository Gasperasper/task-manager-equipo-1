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
    span.title = 'Doble clic para editar';
    span.addEventListener('dblclick', function () {
      startEdit(li, task, span);
    });

    var editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.type = 'button';
    editBtn.setAttribute('aria-label', 'Editar tarea');
    editBtn.innerHTML = '<svg viewBox="0 0 20 20" fill="none"><path d="M13.5 3.5L16.5 6.5L7 16H4V13L13.5 3.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
    editBtn.addEventListener('click', function () {
      startEdit(li, task, span);
    });

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
    li.appendChild(editBtn);
    li.appendChild(delBtn);
    return li;
  }

  function startEdit(li, task, span) {
    if (li.querySelector('.edit-input')) return;

    var editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'edit-input';
    editInput.value = task.text;
    editInput.maxLength = 200;

    span.replaceWith(editInput);
    editInput.focus();
    editInput.setSelectionRange(editInput.value.length, editInput.value.length);

    var finished = false;

    function commit() {
      if (finished) return;
      finished = true;
      var newText = editInput.value.trim();
      if (newText) {
        task.text = newText;
      }
      saveTasks();
      render();
    }

    function cancel() {
      if (finished) return;
      finished = true;
      render();
    }

    editInput.addEventListener('blur', commit);
    editInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        editInput.blur();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancel();
      }
    });
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