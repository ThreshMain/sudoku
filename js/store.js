var Redux = require("redux");
var Boards = require("./boards");
var Sudoku = require("./sudoku");
var cloneDeep = require("lodash.clonedeep");

var Store = Redux.createStore(function (state, action) {
  var history, board;
  function f(e) {
    return e < 10 ? "0" + e : "" + e;
  }
  if (!state) {
    state = {};
  } else {
    state = cloneDeep(state);
  }
  switch (action.type) {
    case "CHANGE_CELL_OPTIONS":
      var cell;
      for (var i = 0; i < state.game.cells.length; i++) {
        var line = state.game.cells[i];
        for (var j = 0; j < line.length; j++) {
          var currentCell = line[j];
          if (
            currentCell.i == state.game.selectedCell.i &&
            currentCell.j == state.game.selectedCell.j
          ) {
            cell = currentCell;
          }
        }
      }
      cell.options[action.index].selected = action.value;
      break;
    case "CHANGE_ACTIVE_COLOR":
      state.game.selectedColor = action.color;
      break;
    case "THRASH":
      for (i = 0; i < state.game.cells.length; i++) {
        line = state.game.cells[i];
        for (j = 0; j < line.length; j++) {
          currentCell = line[j];
          if (
            currentCell.color == state.game.selectedColor &&
            currentCell.editable
          ) {
            currentCell.color = 0;
            currentCell.value = null;
          }
        }
      }
      break;
    case "SELECT_CELL":
      if (state.game.selectedCell) {
        for (i = 0; i < state.game.cells.length; i++) {
          line = state.game.cells[i];
          for (j = 0; j < line.length; j++) {
            currentCell = line[j];
            if (
              currentCell.i == state.game.selectedCell.i &&
              currentCell.j == state.game.selectedCell.j
            ) {
              cell = currentCell;
            }
          }
        }
        cell.selected = false;
      }
      state.game.selectedCell = action.cell;
      for (i = 0; i < state.game.cells.length; i++) {
        line = state.game.cells[i];
        for (j = 0; j < line.length; j++) {
          currentCell = line[j];
          if (
            currentCell.i == state.game.selectedCell.i &&
            currentCell.j == state.game.selectedCell.j
          ) {
            cell = currentCell;
          }
        }
      }
      cell.selected = true;
      break;
    case "RESUME_GAME":
      state.game = JSON.parse(localStorage.currentGame);
      state.game.time = new Date(state.game.time);
      break;
    case "NEW_GAME_RANDOM":
      if (localStorage.history) {
        history = JSON.parse(localStorage.history);
      } else {
        history = { played: [] };
      }
      board = Boards.randomBoard(action.difficulty, history);
      state.game = Sudoku.boardToGame(board.cells);
      state.game.id = {
        difficulty: action.difficulty,
        id: board.id,
        attempt: board.attempt,
      };
      state.game.won = false;
      break;
    case "NEW_GAME_INDEX":
      if (localStorage.history) {
        history = JSON.parse(localStorage.history);
      } else {
        history = { played: [] };
      }
      board = Boards.boardFromIndex(action.difficulty, action.index, history);
      state.game = Sudoku.boardToGame(board.cells);
      state.game.id = {
        difficulty: action.difficulty,
        id: board.id,
        attempt: board.attempt,
      };
      state.game.won = false;
      break;
    case "CHANGE_VALUE":
      state.game.cells[action.i][action.j].value = action.value;
      if (state.game.selectedColor) {
        state.game.cells[action.i][action.j].color = state.game.selectedColor;
      } else {
        state.game.cells[action.i][action.j].color = 0;
      }
      state.game.won = Sudoku.isComplete(state.game.cells);
      if (state.game.won) {
        state.game.id.time =
          f(state.game.time.getHours()) +
          ":" +
          f(state.game.time.getMinutes()) +
          ":" +
          f(state.game.time.getSeconds());
        if (localStorage.history) {
          history = JSON.parse(localStorage.history);
        } else {
          history = { played: [] };
        }
        if (!history.played.includes(state.game.id)) {
          history.played.push(state.game.id);
        }
        localStorage.history = JSON.stringify(history);
      }
      break;
    case "ADD_SECOND":
      if (state.game && !state.game.won) {
        state.game.time.setSeconds(state.game.time.getSeconds() + 1);
      }
      break;
    case "CHECK_INDEX":
      Boards.checkIndex(action.index, action.difficulty);
      break;
  }
  if (state.game) {
    Sudoku.checkConflicts(state.game.cells);
    localStorage.currentGame = JSON.stringify(state.game);
  }
  return state;
});

module.exports = Store;
