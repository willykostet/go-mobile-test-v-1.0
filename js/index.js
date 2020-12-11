const taskInput = document.getElementById("addtaskinput");
const dateInput = document.getElementById("adddateinput")
const addTaskBtn = document.getElementById("addtaskbtn");
const taskList = document.getElementById("addedtasklist");
const searchInput = document.getElementById("searchtextbox")
const saveButtonTask = document.getElementById("savetaskbtn")
const deleteAllButton = document.getElementById("deleteallbtn")
const sortByDescFromBotButton = document.getElementById("sortFromBot")
const sortByDescFromTopButton = document.getElementById("sortFromTop")
const sortByDateFromBotButton = document.getElementById("sortDateFromBot")
const sortByDateFromTopButton = document.getElementById("sortDateFromTop")
const hidingClass = 'hiding'

const ADD_TASK = 'ADD_TASK'
const REMOVE_TASK = 'REMOVE_TASK'
const TOGGLE_TASK = 'TOGGLE_TASK'
const DELETE_ALL_TASKS = 'DELETE_ALL_TASKS'
const EDIT_TASK = 'EDIT_TASK'
const TURN_ON_EDIT_MODE = 'TURN_ON_EDIT_MODE'
const TURN_OFF_EDIT_MODE = 'TURN_OFF_EDIT_MODE'

const initialEditingTaskId = null

const initialState = {
	tasks: localStorage.getItem("tasks") ? JSON.parse(localStorage.getItem("tasks")) : [],
	editingTaskId: initialEditingTaskId
}
const store = createStore(tasksReducer, initialState)

render()

saveButtonTask.addEventListener("click", saveNewTaskData)
addTaskBtn.addEventListener("click", addTask)
deleteAllButton.addEventListener("click", deleteAllTasks)
searchInput.addEventListener("input", searchInTasks)
sortByDateFromTopButton.addEventListener("click", () => sortFromTop('date'))
sortByDateFromBotButton.addEventListener("click", () => sortFromBottom('date'))
sortByDescFromTopButton.addEventListener("click", () => sortFromTop('desc'))
sortByDescFromBotButton.addEventListener("click", () => sortFromBottom('desc'))

function getValues() {
	let errors = false
	const values = {
		desc: taskInput.value.trim(),
		date: dateInput.value
	};

	Object.values(values).forEach(value => {
		if(!value.length) errors = true
	})

	if(errors) {
		console.log('Empty values')
		return
	}

	return values
}

function addTask() {
	store.dispatch({
		type: ADD_TASK,
		payload: getValues()
	})

	saveToLocalStorage()
}

function searchInTasks(e) {
	const value = e.target.value.trim()
	if(!value) {
		render()
	}

	const searchedTasks = getTasksList().filter(task => {
		return task.desc.match(new RegExp(value, 'gi'))
	})

	render(searchedTasks)
}

function editTask(id) {
	store.dispatch({
		type: TURN_ON_EDIT_MODE,
		payload: {id}
	})

	const buttonText = `Save Task ${getEditingTaskId() + 1}`
	saveButtonTask.innerHTML = buttonText
	saveButtonTask.classList.remove(hidingClass)
}

function saveNewTaskData() {
	store.dispatch({
		type: EDIT_TASK,
		payload: {id: getEditingTaskId(), ...getValues()}
	})

	store.dispatch({
		type: TURN_OFF_EDIT_MODE,
	})

	hideSaveButton()

	saveToLocalStorage()
}

function hideSaveButton() {
	if (!saveButtonTask.classList.contains(hidingClass)) {
		saveButtonTask.classList.add(hidingClass)
	}
}

function sortFromTop(prop){
	let compareFunc = (a, b) => b[prop].toString().localeCompare(a[prop].toString())

	render([...getTasksList()].sort(compareFunc))
}

function sortFromBottom(prop){
	let compareFunc = (a, b) => a[prop].toString().localeCompare(b[prop].toString())

	render([...getTasksList()].sort(compareFunc))
}

function deleteAllTasks() {
	store.dispatch({type: DELETE_ALL_TASKS})
	hideSaveButton()

	saveToLocalStorage()
}

function toggleTask(id) {
	store.dispatch({
		type: TOGGLE_TASK,
		payload: {id}
	})
	saveToLocalStorage()
}

function deleteTask(id) {
	if (id === getEditingTaskId()) {
		hideSaveButton()
	}

	store.dispatch({
		type: REMOVE_TASK,
		payload: {id}
	})
	saveToLocalStorage()
}

function render(tasks = getTasksList()) {
	taskList.innerHTML = tasks.map(createTask).join('')
}

function createTask (task, id) {
	return `
		<tr>
			<th scope="row">${id + 1}</th>
			<td scope="row">${task.date}</td>
			<td class=${task.isCompleted? "completed" : ''}>${task.desc}</td>
			<td>
				<button type="button" class="text-primary" onclick="editTask(${id})">
					<i class="fa fa-edit"></i>
					Edit
				</button>
			</td>
			<td>
				<button type="button" class="text-success" onclick="toggleTask(${id})">
					<i class="fa fa-check-square-o"></i>
					Complete
				</button>
			</td>
			<td>
				<button type="button" class="text-danger" onclick="deleteTask(${id})">
					<i class="fa fa-trash"></i>
					Delete
				</button>
			</td>
		</tr>
	`
}

function saveToLocalStorage() {
	localStorage.setItem("tasks", JSON.stringify(getTasksList()))
	render()
}

function getTasksList() {
	return store.getState().tasks
}

function getEditingTaskId() {
	return store.getState().editingTaskId
}

function tasksReducer(state, action) {
	switch(action.type) {
		case ADD_TASK:
			return {
				...state,
				tasks: [
					...state.tasks,
					{
						desc: action.payload.desc,
						date: action.payload.date,
						isCompleted: false,
					}]
			}

		case REMOVE_TASK:
			return {
				...state,
				tasks: state.tasks.filter((task, id) => id !== action.payload.id)
			}

		case TOGGLE_TASK:
			return {
				...state,
				tasks: state.tasks.map((task, id) => {
					if (id === action.payload.id) {
						return {
							...task,
							isCompleted: !task.isCompleted
						}
					}

					return task
				})
			}

		case DELETE_ALL_TASKS:
			return {
				...state,
				tasks: []
			}

		case TURN_ON_EDIT_MODE:
			return {
				...state,
				editingTaskId: action.payload.id,
			}

		case TURN_OFF_EDIT_MODE:
			return {
				...state,
				editingTaskId: initialEditingTaskId
			}

		case EDIT_TASK:
			return {
				...state,
				tasks: state.tasks.map((task, id) => {
					if (id === action.payload.id) {
						return {
							...task,
							desc: action.payload.desc || task.desc,
							date: action.payload.date || task.date,
						}
					}

					return task
				})
			}

		default:
			return state
	}
}


function createStore(reducer, initialState) {
	let state = initialState

	return {
		dispatch: action => state = reducer(state, action),
		getState: () => state
	}
}

