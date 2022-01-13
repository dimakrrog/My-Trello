let boardNames = []
let boardColors = []
let boardCount = 0
let tasks = []

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
    console.log('document.updateBoardColor', boardColors)
    localStorage.setItem('board-colors',JSON.stringify(boardColors))

}

document.addEventListener('DOMContentLoaded', () => {
    boardNames = JSON.parse(localStorage.getItem('board-names'))
    boardColors = JSON.parse(localStorage.getItem('board-colors'))
    if (!boardNames) {
        boardNames = ["ToDo", "In Progress", "Done"]
    }
    if (!boardColors) {
        boardColors = []
    }

    for (let board of boardNames) {
        createBoard(board)
    }

    tasks = JSON.parse(localStorage.getItem('tasks'))
    if (!tasks) {
        tasks = []
    }
    for (let index = 0; index < boardCount; index++) {
        showTasks(index)        
    }

})


let createBoardFromModal = (element) => {
    let modal = document.querySelector("#modal-board-create")
    modal.style.visibility = 'hidden'

    let newBoardName = document.querySelector('#modal-board-name')

    boardNames.push(newBoardName.value)
    localStorage.setItem('board-names', JSON.stringify(boardNames))

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
    tasks[boardCount] = []
    
    boardCount++
    tasks.length = boardCount
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

let showModalCancelDeleteBoard = () => {
    document.querySelector('#modal-board-cancel-delete').style.visibility = 'visible'
}

let deleteBoardFromModal = (element) => {
    let strs = element.id.split('*')
    let index = Number(strs[1])

    if (tasks[index].length) {
        
        showModalCancelDeleteBoard()
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

let showModalTaskCreate = (element) => {
    let strs = element.id.split('*')
    let index = Number(strs[1])

    let modalId = document.querySelector('.btn--task--create')
        modalId.id = "modal-task-create*"+index
    document.querySelector('#modal-task-create').style.visibility = 'visible'
}

let createTaskFromModal = (element) => {
    let strs = element.id.split('*')
    let index = Number(strs[1])

    let taskTitle = document.querySelector('#modal-task-title').value
    let taskText = document.querySelector('#modal-task-text').value

    if (taskTitle == "" || taskText == "") {
        alert("Input task's title!!!")
        return
    }

    document.querySelector('#modal-task-create').style.visibility = 'hidden'

    let newTask = {
        title: taskTitle,
        text: taskText
    }

    tasks[index].push(newTask)
    localStorage.setItem('tasks', JSON.stringify(tasks))
    showTask(index, tasks[index].length-1)
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
    console.log('showModalTaskDelete',strs)
    let boardNumber = Number(strs[1])
    let index = Number(strs[2])

    let modalId = document.querySelector('.btn--modal--task--delete')
        modalId.id = "modal-task-delete*"+boardNumber+'*'+index
    document.querySelector('#modal-task-delete').style.visibility = 'visible'
}

let showTask = (boardNumber, taskNumber) => {
    let task = tasks[boardNumber][taskNumber]
    console.log(boardNumber, taskNumber, task)
    let board = document.querySelector('#board\\*'+boardNumber)
    let taskId = 'task*'+boardNumber+'*'+taskNumber
    let btnDeleteId = 'btn-task-del*'+boardNumber+'*'+taskNumber
    board.insertAdjacentHTML('beforeend', `
        <div class="task" id="${taskId}">
            <div class="task--header">
                <div class="task-title">${task.title}</div>
                <div class="btn btn--task--delete" onclick="showModalTaskDelete(this)" id="${btnDeleteId}">X</div>
            </div>
            <div class="task-content">${task.text}</div>
        </div>
    `)
}

let showTasks = (boardNumber) => {
    console.log(boardNumber, tasks[boardNumber])
    for (let index = 0; index < tasks[boardNumber].length; index++) {
        showTask(boardNumber, index)        
    }
}

let hideModal = (element) => {
    let modals = document.querySelectorAll('.modal')
    for (const modal of modals) {
        modal.style.visibility = 'hidden'
    }
}