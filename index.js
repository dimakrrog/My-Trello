let boardNames = []
let boardColors = []
let boardCount = 0
let tasks = []
let users = []

let field = document.querySelector('.field-inner')

let btnBoardCreate = document.querySelector('#board-create')

let showModalBoardCreate = () => {
    let modal = document.querySelector("#modal-board-create")
    modal.style.visibility = 'visible'
}
btnBoardCreate.addEventListener('click', showModalBoardCreate)

let updateBoardColorFromModal = (element) => {
    let strs = element.id.split('*')
    let index = Number(strs[1])
    let boardId = '#board\\*'+index
    let colorId = '#color-update\\*'+index
    let newColor = document.querySelector(colorId).value
    document.querySelector(boardId).style.background = newColor
    hideModal(element)

    boardColors[index] = newColor
    localStorage.setItem('board-colors',JSON.stringify(boardColors))

}

document.addEventListener('DOMContentLoaded', async () => {
    boardNames = JSON.parse(localStorage.getItem('board-names'))
    if (!boardNames) {
        boardNames = ["ToDo", "In Progress", "Done"]
        localStorage.setItem('board-names',JSON.stringify(boardNames))
    }

    boardColors = JSON.parse(localStorage.getItem('board-colors'))
    if (!boardColors) {
        boardColors = []
    }

    tasks = JSON.parse(localStorage.getItem('tasks'))
    if (!tasks) {
        tasks = [[],[],[]]
    }

    // localStorage.removeItem('users')
    users = JSON.parse(localStorage.getItem('users'))
    if (!users) {
        users = []
        for (let index = 0; index < 5; index++) {
            await getRandomUser()
        }
    }

    for (let board of boardNames) {
        createBoard(board)
    }

    for (let index = 0; index < boardCount; index++) {
        createTasks(index)        
    }

    for (let index = 0; index < users.length; index++) {
        createUser(index)                        
        console.log(index)
    }
    document.querySelector('#modal-task-delete').style.visibility = 'hidden'
})

////////////// Board 
let createBoardFromModal = (element) => {
    let modal = document.querySelector("#modal-board-create")
    let newBoardName = document.querySelector('#modal-board-name')

    if (!validateBoardNameIsUnique(newBoardName.value)) {
        return
    }

    modal.style.visibility = 'hidden'

    boardNames.push(newBoardName.value)
    localStorage.setItem('board-names', JSON.stringify(boardNames))
    tasks[boardCount] = []

    createBoard(newBoardName.value)
}

let createBoard = (boardName) => {
    let newBoard = document.createElement('div')
        newBoard.className = "board"
        newBoard.id = 'board*' + boardCount
    if (!boardColors[boardCount]) {
        boardColors.push('rgb(80, 78, 78)')
        localStorage.setItem('board-colors',JSON.stringify(boardColors))
    }
    newBoard.style.background = boardColors[boardCount]
    
    field.append(newBoard)

    let btnCreateId = 'btn-create*' + boardCount
    let btnChangeId = 'btn-change*' + boardCount
    newBoard.insertAdjacentHTML('beforeend', `
        <div class="board-header">
            <div class="board-title">${boardName}</div>
            <div class="board-btns">
                <div class="btn btn--board--change" onclick="showModalBoardChange(this)" id=${btnChangeId}>...</div>
                <div class="btn btn-create" onclick="showModalTaskCreate(this)" id=${btnCreateId}>+</div>    
            </div>
        </div>
    `)
    
    boardCount++
    // tasks.length = boardCount
}

let showModalBoardChange = (element) => {
    let strs = element.id.split('*')
    let index = Number(strs[1])
    
    let modalId = document.querySelector('.btn--modal--delete')
        modalId.id = "modal-board-change*"+index
    let colorId = document.querySelector('.input--color')
        colorId.id = "color-update*"+index
    let bntColorId = document.querySelector('.btn--modal--color--update')
        bntColorId.id = "btn--modal--color--update*"+index
    document.querySelector('#modal-board-change').style.visibility = 'visible'
}

let deleteBoardFromModal = (element) => {
    let strs = element.id.split('*')
    let index = Number(strs[1])

    if (!validateBoardIsEmpty(index)) {
        return 
    }
    if (!validateBoardIsNonRemovable(index)) {
        return
    }

    let deleteBoardId = '#board\\*'+index
    document.querySelector('#modal-board-change').style.visibility = 'hidden'
    document.querySelector(deleteBoardId).remove()
    boardNames.splice(index, 1)
    boardCount--
    if (boardCount == 0)
        localStorage.removeItem('board-names')
    else
        localStorage.setItem('board-names', JSON.stringify(boardNames))
}

/////////// Task
let userChange = () => {
    let userSelector = document.querySelector('#modal-task-user')
    document.querySelector('#modal-task-user-pic').src = users[+userSelector.value].picture.medium
}
let userSelestorChange = document.querySelector('#modal-task-user')
userSelestorChange.addEventListener('change', userChange)

let showModalTaskCreate = (element) => {
    let strs = element.id.split('*')
    let index = Number(strs[1])

    if (!validateTaskCount(index))
        return
    
    let modalId = document.querySelector('.btn--task--create')
        modalId.id = "modal-task-create*"+index
        modalId.innerHTML = 'Create' 
    document.querySelector('#modal-task-title').value = 'title'
    document.querySelector('#modal-task-expired-date').value = 'expDate'
    document.querySelector('#modal-task-description').value = 'description'
    document.querySelector('#modal-task-tag').value = 'tag'
    document.querySelector('#modal-task-create').style.visibility = 'visible'
    let userSelector = document.querySelector('#modal-task-user')
    userSelector.value = 0
    userSelector.innerHTML = ""
    for (let i = 0; i < users.length; i++) {
        userSelector.insertAdjacentHTML('beforeend',`
            <option value="${i}">${users[i].name.first} ${users[i].name.last}</option>
        `)
    }
    document.querySelector('#modal-task-user-pic').src = users[+userSelector.value].picture.thumbnail
}

let createTaskFromModal = (element) => {
    let strs = element.id.split('*')
    let boardNumber = Number(strs[1])
    let taskNumber = Number(strs[2])

    let taskTitle = document.querySelector('#modal-task-title').value
    let taskDate = document.querySelector('#modal-task-expired-date').value
    let taskDescription = document.querySelector('#modal-task-description').value
    let taskTag = document.querySelector('#modal-task-tag').value
    let taskUser = document.querySelector('#modal-task-user').value

    if (!validateTaskExpired(taskDate)) {
        return
    }

    let newTask = {
        title: taskTitle,
        expDate: taskDate,
        description: taskDescription,
        tag: taskTag,
        user: taskUser,
    }

    if (!validateTaskEmptyField(newTask)) {
        return
    }

    document.querySelector('#modal-task-create').style.visibility = 'hidden'

    if (isNaN(taskNumber)) {
        tasks[boardNumber].push(newTask)
        createTask(boardNumber, tasks[boardNumber].length-1)
    } else {
        tasks[boardNumber][taskNumber] = newTask
        let titleId = '#task\\*' + boardNumber + '\\*' + taskNumber + ' .task--header .task-title'
        document.querySelector(titleId).innerHTML = taskTitle

        let tagId = '#task\\*' + boardNumber + '\\*' + taskNumber + ' .task-tag'
        document.querySelector(tagId).innerHTML = taskTag
    }
    localStorage.setItem('tasks', JSON.stringify(tasks))
}

let deleteTaskFromModal = (element) => {
    let strs = element.id.split('*')
    let boardNumber = Number(strs[1])
    let index = Number(strs[2])

    let deleteTaskdId = '#task\\*'+boardNumber+'\\*'+index
    document.querySelector('#modal-task-delete').style.visibility = 'hidden'
    document.querySelector(deleteTaskdId).remove()
    tasks[boardNumber].splice(index, 1)
    localStorage.setItem('tasks', JSON.stringify(tasks))
}

let showModalTaskDelete = (element) => {
    let strs = element.id.split('*')
    let boardNumber = Number(strs[1])
    let index = Number(strs[2])

    let modalId = document.querySelector('.btn--modal--task--delete')
        modalId.id = "modal-task-delete*"+boardNumber+'*'+index
    document.querySelector('#modal-task-delete').style.visibility = 'visible'
}

let createTask = (boardNumber, taskNumber) => {
    let task = tasks[boardNumber][taskNumber]
    let board = document.querySelector('#board\\*'+boardNumber)
    let taskId = 'task*'+boardNumber+'*'+taskNumber
    let btnDeleteId = 'btn-task-del*'+boardNumber+'*'+taskNumber
    board.insertAdjacentHTML('beforeend', `
        <div class="task" id="${taskId}" onclick="showTask(this)">
            <div class="task--header">
                <div class="task-title">${task.title}</div>
                <div class="btn btn--task--delete" onclick="showModalTaskDelete(this)" id="${btnDeleteId}">X</div>
            </div>
            <div class="task-tag">${task.tag}</div>
        </div>
    `)
}

let createTasks = (boardNumber) => {
    for (let index = 0; index < tasks[boardNumber].length; index++) {
        createTask(boardNumber, index)        
    }
}

let showTask = (element) => {
    let strs = element.id.split('*')
    let boardNumber = Number(strs[1])
    let index = Number(strs[2])
    let task = tasks[boardNumber][index]

    document.querySelector('#modal-task-title').value = task.title
    document.querySelector('#modal-task-expired-date').value = task.expDate
    document.querySelector('#modal-task-description').value = task.description
    document.querySelector('#modal-task-tag').value = task.tag
    let userSelector = document.querySelector('#modal-task-user')
        userSelector.innerHTML = ""
        for (let i = 0; i < users.length; i++) {
            userSelector.insertAdjacentHTML('beforeend',`
                <option value="${i}">${users[i].name.first} ${users[i].name.last}</option>
            `)
        }
        userSelector.value = task.user
    document.querySelector('#modal-task-user-pic').src = users[task.user].picture.thumbnail

    let modalId = document.querySelector('.btn--task--create')
        modalId.id = "modal-task-delete*"+boardNumber+'*'+index
        modalId.innerHTML = 'Update' 

    if (document.querySelector('#modal-task-delete').style.visibility == 'hidden')
        document.querySelector('#modal-task-create').style.visibility = 'visible'
}

let hideModal = (element) => {
    let modals = document.querySelectorAll('.modal')
    for (const modal of modals) {
        modal.style.visibility = 'hidden'
    }
}

let hideErrorModal = () => {
    document.querySelector('#modal-error').style.visibility = 'hidden'
    document.querySelector('#modal-error .modal-inner').innerHTML = '<div class="btn btn--modal--ok" onclick="hideErrorModal(this)">OK</div>'
}

////////////    Validation
let validateBoardNameIsUnique = (newBoardName) => {
    for (const boardName of boardNames) {
        if (newBoardName === boardName) {
            document.querySelector('#modal-error').style.visibility = 'visible'
            document.querySelector('#modal-error .modal-inner').insertAdjacentHTML('afterbegin', `
                <div style="color: red;">
                    Board with the name "${newBoardName.value}" already exists
                    Enter a different name and click "Create" button
                </div>
            `)
            return false
        }
    }
    return true
}

let validateBoardIsEmpty = (boardId) => {
    if (tasks[boardId].length > 0) {
        document.querySelector('#modal-error').style.visibility = 'visible'
        document.querySelector('#modal-error .modal-inner').insertAdjacentHTML('afterbegin', `
            <div style="color: red;">
                You can't delete not empty board!
            </div>
        `)
    
        return false
    }

    return  true
}

let validateBoardIsNonRemovable = (boardId) => {
    if ( boardId < 3) {
        document.querySelector('#modal-error').style.visibility = 'visible'
        document.querySelector('#modal-error .modal-inner').insertAdjacentHTML('afterbegin', `
            <div style="color: red;">
                You can't delete non-removable board
            </div>
        `)
    
        return false
    }

    return  true
}

let validateTaskCount = (boardId) => {
    if (tasks[boardId].length >= 3) {
        document.querySelector('#modal-error').style.visibility = 'visible'
        document.querySelector('#modal-error .modal-inner').insertAdjacentHTML('afterbegin', `
            <div style="color: red;">
                You have reached the maximum number of tasks for the board "${boardNames[boardId]}"
            </div>
        `)
    
        return false
    }

    return  true
}

let validateTaskExpired = (date) => {
    dateNow = new Date()
    dateExpired = new Date(date)
    if (dateExpired < dateNow) {
        document.querySelector('#modal-error').style.visibility = 'visible'
        document.querySelector('#modal-error .modal-inner').insertAdjacentHTML('afterbegin', `
            <div style="color: red;">
                The expired date cannot be earlier than the current date
            </div>
        `)
    
        return false
    }

    return  true
}

let validateTaskEmptyField = (object) => {
    for (const key in object) {
        if (Object.hasOwnProperty.call(object, key)) {
            const element = object[key];
            if (element == "") {
                document.querySelector('#modal-error').style.visibility = 'visible'
                document.querySelector('#modal-error .modal-inner').insertAdjacentHTML('afterbegin', `
                    <div style="color: red;">
                    All fields are required
                    </div>
                `)
            
                return false        
            }
        }
    }
    return  true
}

let validateUserMinCount = () => {
    if (users.length == 1) {
        document.querySelector('#modal-error').style.visibility = 'visible'
        document.querySelector('#modal-error .modal-inner').insertAdjacentHTML('afterbegin', `
            <div style="color: red;">
                You cannot delete the last user
            </div>
        `)
    
        return false
    }

    return  true
}

let validateUserMaxCount = () => {
    if (users.length == 10) {
        document.querySelector('#modal-error').style.visibility = 'visible'
        document.querySelector('#modal-error .modal-inner').insertAdjacentHTML('afterbegin', `
            <div style="color: red;">
                You cannot create more than 10 users
            </div>
        `)
    
        return false
    }

    return  true
}
///////   Users
async function getRandomUser () {
    const USER_URL = 'https://randomuser.me/api/'
    let user = await fetch(USER_URL)        
    let userJson = await user.json()
    let newUser = {
        gender: userJson.results[0].gender,
        name: userJson.results[0].name,
        picture: {
            thumbnail: userJson.results[0].picture.thumbnail,
            medium: userJson.results[0].picture.medium,
        }
    }
    users.push(newUser)
    console.log(newUser)

    localStorage.setItem('users',JSON.stringify(users))
}

let createUser = (index) => {
    let userId = 'user*'+index
    let userBlock = document.querySelector('.users')
    userBlock.insertAdjacentHTML('beforeend',`
        <div class="user"  onclick="showModalUserShow(this)" id="${userId}">
            <img src="${users[index].picture.thumbnail}" alt="">
        </div>
    `)
}
let showModalUserShow = (element) => {
    let strs = element.id.split('*')
    let index = Number(strs[1])

    let modalId = document.querySelector('.btn--modal--user--delete')
        modalId.id = "modal-user-delete*"+index
    let userModal = document.querySelector('.user--show')
    userModal.innerHTML = ""
    userModal.insertAdjacentHTML('afterbegin',`
        <img style="width: 100%;" src="${users[index].picture.medium}" alt="">
        <div class="user--info">
            <div>${users[index].name.first}, ${users[index].name.last}</div>
            <div>${users[index].gender}</div>
        </div>
    `)
    document.querySelector('#modal-user-show').style.visibility = 'visible'
}

let deleteUserFromModal = (element) => {
    let strs = element.id.split('*')
    let index = Number(strs[1])
    console.log(strs)

    if (!validateUserMinCount()) {
        return
    }
    let deleteUserId = '#user\\*'+index
    document.querySelector('#modal-user-show').style.visibility = 'hidden'
    document.querySelector(deleteUserId).remove()
    for (let i = index+1; i < users.length; i++) {
        let oldId = '#user\\*' + i
        let newId = 'user*' + (i - 1)
        document.querySelector(oldId).id = newId
    }
    users.splice(index, 1)
    console.log(users.length)
    localStorage.setItem('users', JSON.stringify(users))
}

async function addUser () {
    if (!validateUserMaxCount()) {
        return
    }
    await getRandomUser()
    createUser(users.length-1)
}
let btnUserCreate = document.querySelector('#user-create')
btnUserCreate.addEventListener('click', addUser)
