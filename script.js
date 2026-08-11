(function(){
  let tasks = [];
  let pendingDeleteId = null;

  const taskList = document.getElementById('taskList');
  const taskInput = document.getElementById('taskInput');
  const addBtn = document.getElementById('addBtn');
  const emptyState = document.getElementById('emptyState');
  const taskCount = document.getElementById('taskCount');
  const meterFill = document.getElementById('meterFill');
  const confirmOverlay = document.getElementById('confirmOverlay');
  const cancelDelete = document.getElementById('cancelDelete');
  const confirmDelete = document.getElementById('confirmDelete');
  const themeToggle = document.getElementById('themeToggle');
  const iconSun = document.getElementById('iconSun');
  const iconMoon = document.getElementById('iconMoon');
  const todayDate = document.getElementById('todayDate');

  function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

  function render(){
    taskList.innerHTML = '';
    if(tasks.length === 0){
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
    }

    tasks.forEach(task => {
      const item = document.createElement('div');
      item.className = 'task-item' + (task.done ? ' done' : '');

      const check = document.createElement('button');
      check.className = 'task-check' + (task.done ? ' checked' : '');
      check.setAttribute('aria-label', 'Marcar como completada');
      check.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      check.addEventListener('click', () => toggleDone(task.id));

      const text = document.createElement('div');
      text.className = 'task-text' + (task.done ? ' done' : '');
      text.textContent = task.text;
      text.setAttribute('contenteditable', 'false');
      text.addEventListener('dblclick', () => {
        text.setAttribute('contenteditable', 'true');
        text.focus();
      });
      text.addEventListener('blur', () => {
        text.setAttribute('contenteditable', 'false');
        saveEdit(task.id, text.textContent);
      });
      text.addEventListener('keydown', (e) => {
        if(e.key === 'Enter'){
          e.preventDefault();
          text.blur();
        }
      });

      const actions = document.createElement('div');
      actions.className = 'task-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'icon-btn';
      editBtn.setAttribute('aria-label', 'Editar tarea');
      editBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>';
      editBtn.addEventListener('click', () => {
        text.setAttribute('contenteditable', 'true');
        text.focus();
        document.execCommand('selectAll', false, null);
      });

      const delBtn = document.createElement('button');
      delBtn.className = 'icon-btn delete';
      delBtn.setAttribute('aria-label', 'Eliminar tarea');
      delBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6M14 11v6"></path></svg>';
      delBtn.addEventListener('click', () => askDelete(task.id));

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      item.appendChild(check);
      item.appendChild(text);
      item.appendChild(actions);
      taskList.appendChild(item);
    });

    updateCount();
  }

  function updateCount(){
    const total = tasks.length;
    const done = tasks.filter(t => t.done).length;
    const pending = total - done;

    if(total === 0){
      taskCount.textContent = 'Sin tareas pendientes';
      meterFill.style.width = '0%';
    } else if(pending === 0){
      taskCount.textContent = 'Todas completadas';
      meterFill.style.width = '100%';
    } else {
      taskCount.textContent = pending + (pending === 1 ? ' pendiente' : ' pendientes') + ' de ' + total;
      meterFill.style.width = Math.round((done / total) * 100) + '%';
    }
  }

  function addTask(){
    const value = taskInput.value.trim();
    if(!value) return;
    tasks.unshift({ id: uid(), text: value, done: false });
    taskInput.value = '';
    render();
    taskInput.focus();
  }

  function toggleDone(id){
    const t = tasks.find(t => t.id === id);
    if(t) t.done = !t.done;
    render();
  }

  function saveEdit(id, newText){
    const value = newText.trim();
    const t = tasks.find(t => t.id === id);
    if(!t) return;
    if(value === ''){
      tasks = tasks.filter(t => t.id !== id);
    } else {
      t.text = value;
    }
    render();
  }

  function askDelete(id){
    pendingDeleteId = id;
    confirmOverlay.classList.add('show');
  }

  function closeConfirm(){
    pendingDeleteId = null;
    confirmOverlay.classList.remove('show');
  }

  confirmDelete.addEventListener('click', () => {
    if(pendingDeleteId){
      tasks = tasks.filter(t => t.id !== pendingDeleteId);
      render();
    }
    closeConfirm();
  });
  cancelDelete.addEventListener('click', closeConfirm);
  confirmOverlay.addEventListener('click', (e) => {
    if(e.target === confirmOverlay) closeConfirm();
  });

  addBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') addTask();
  });

  // Tema
  function setTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    iconSun.style.display = theme === 'light' ? 'block' : 'none';
    iconMoon.style.display = theme === 'dark' ? 'block' : 'none';
  }
  let currentTheme = 'light';
  themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(currentTheme);
  });
  setTheme(currentTheme);

  // Fecha de hoy
  const dateFormatter = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  todayDate.textContent = dateFormatter.format(new Date());

  render();
})();
