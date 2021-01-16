var Redux = require("redux");
var Boards = require("./boards");
var Sudoku = require("./sudoku");
var cloneDeep = require("lodash.clonedeep");

var Store = Redux.createStore(function (state, action) {
  var history;
  function f(e) {
    return e < 10 ? "0" + e : "" + e;
  }
  if (!state) {
    state = {};
  } else {
    state = cloneDeep(state);
  }
  switch (action.type) {
    case "RESUME_GAME":
      state.game = JSON.parse(localStorage.currentGame);
      state.game.time = new Date(state.game.time);
      break;
    case "NEW_GAME":
      if (localStorage.history) {
        history = JSON.parse(localStorage.history);
      } else {
        history = { played: [] };
      }
      var board = Boards.randomBoard(action.difficulty, history);
      if (board == null) {
        alert(
          "You have already funnished all sudoku from this difficulty. Starting from beginning"
        );
        history.played = history.played.filter(function (x) {
          return x.difficulty != action.difficulty;
        });
        localStorage.history = JSON.stringify(history);
        board = Boards.randomBoard(action.difficulty, history);
      }
      state.game = Sudoku.boardToGame(board.cells);
      state.game.id = { difficulty: action.difficulty, id: board.id };
      state.game.won = false;
      break;
    case "CHANGE_VALUE":
      state.game.cells[action.i][action.j].value = action.value;
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
  }
  if (state.game) {
    Sudoku.checkConflicts(state.game.cells);
    localStorage.currentGame = JSON.stringify(state.game);
  }
  return state;
});

module.exports = Store;
