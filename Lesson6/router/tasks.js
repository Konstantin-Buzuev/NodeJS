const express = require('express')
const router = express.Router()
const log = console.log
const Task = require('../models/task')

//Создание контекста для Handlebars, начиная с версии 4.7.0
function createContext(data) {
  return {
    tasks: data.map(task => {
      return {
        _id: task._id,
        title: task.title,
        completed: task.completed
      }
    })
  }
}
// Получение полного списка задач
router.get('/', async (req, res) => {
  res.render('tasks', {
    name: req.user.username,
    tasks: createContext(await Task.find()).tasks
  });
});
// Получение конкретной задачи
router.get('/:id', async (req, res) => {
  res.render('tasks', {
    name: "Vasya",
    tasks: createContext(await Task.findById(req.params.id)).tasks
  });
});
// Добавление задачи
router.post('/', async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  res.redirect('./');
})
// Выполнение задачи
router.post('/complete', async (req, res) => {
  await Task.updateOne({
    _id: req.body.id
  }, {
    $set: {
      completed: true
    }
  });
  res.redirect('./');
});
// Удаление задачи
router.post('/delete', async (req, res) => {
  await Task.deleteOne({
    _id: req.body.id
  });
  res.redirect('./');
});
module.exports = router;