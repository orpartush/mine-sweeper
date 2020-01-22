'use strict';

// Const Variables
const MINE = '💣';
const EXPLOSION = '💥';
const FLAG = '🚩'

// Global Variables
var gSize = {
  SIZE: 4,
  MINES: 2
};
var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
};
var gBoard;
var gIsFirstClick = true;
var gTime = 0;
var gElTimer = document.querySelector('.timer');

function initGame() {
  // gGame.isOn = false;
  gBoard = buildBoard();
  console.log(gBoard)
  renderBoard()
  getLevelsBtns();
}

function buildBoard() {
  var board = [];
  for (var i = 0; i < gSize.SIZE; i++) {
    board[i] = [];
    for (var j = 0; j < gSize.SIZE; j++) {
      var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
      };
      board[i][j] = cell;
    }
  }
  return board;
}

function renderBoard() {
  var elBoard = document.querySelector('.board');
  var strHtml = '';
  for (var i = 0; i < gSize.SIZE; i++) {
    strHtml += '<tr>';
    for (var j = 0; j < gSize.SIZE; j++) {
      strHtml += `
      <td class="cell cell-${i}-${j}" 
          onclick="cellClicked(this, ${i}, ${j})
          " oncontextmenu="cellMarked(this, ${i}, ${j}, event)">
          </td>
          `;
    }
    strHtml += '</tr>';
  }
  elBoard.innerHTML = strHtml;
}

function getLvl(elBtn, lvl) {
  
  if (elBtn.classList.contains('easy')) {
    gSize.SIZE = 4;
    gSize.MINES = 2;
  } else if (elBtn.classList.contains('medium')) {
      gSize.SIZE = 8;
      gSize.MINES = 12;
  } else if (elBtn.classList.contains('extreme')) {
      gSize.SIZE = 12;
      gSize.MINES = 30;
  }
  restartGame();
}

function getLevelsBtns() {
  var lvls = ['EASY', 'MEDIUM', 'EXTREME'];
  var elLvlContainer = document.querySelector('.levels-container');
  for (var lvl of lvls) {
    var strHtml = `
      <button 
      class="${lvl.toLowerCase()} lvl-btn" 
      onclick="getLvl(this)">
      ${lvl}
      </button>
      `;
    elLvlContainer.innerHTML += strHtml;
  }
}

function expandShown(posI, posJ) {
  for (var i = posI - 1; i <= posI + 1; i++) {
    for (var j = posJ - 1; j <= posJ + 1; j++) {
      if (i < 0 || i > gSize.SIZE - 1) continue;
      if (j < 0 || j > gSize.SIZE - 1) continue;
      if (i === posI && j === posJ) continue;
      var neg = gBoard[i][j];
      var elNegCell = document.querySelector(`.cell-${i}-${j}`);
      if (neg.isMine) continue;
      if (neg.minesAroundCount > 0) {
        elNegCell.innerText = neg.minesAroundCount;
      }
      if (neg.isShown) continue;
      else {
        elNegCell.classList.add('open-cell');
        updateScore();
        neg.isShown = true;
        gGame.shownCount++;
      }
    }
  }
  checkGameOver();
}

function updateScore() {
  var elScore = document.querySelector('.score');
  var currScore = +elScore.innerText;
  elScore.innerText = currScore + 100;
}

function setRndMines(posI, posJ) {
  for (var i = 0; i < gSize.MINES; i++) {
    var rndI = getRandomIntInclusive(0, gSize.SIZE - 1);
    var rndJ = getRandomIntInclusive(0, gSize.SIZE - 1);
    if (rndI === posI && rndJ === posJ) {
      i--;
      continue;
    }
    var currCell = gBoard[rndI][rndJ];
    (!currCell.isMine) ? currCell.isMine = true: i--;
  }
  return gBoard;
}

function getNegsCount(posI, posJ) {
  var currCell = gBoard[posI][posJ];
  for (var i = posI - 1; i <= posI + 1; i++) {
    for (var j = posJ - 1; j <= posJ + 1; j++) {
      if (i < 0 || i > gSize.SIZE - 1) continue;
      if (j < 0 || j > gSize.SIZE - 1) continue;
      if (i === posI && j === posJ) continue;
      var neg = gBoard[i][j];
      (neg.isMine) ? currCell.minesAroundCount++: currCell;
    }
  }
  return gBoard;
}

function setMinesNegsCount(posI, posJ) {
  var finalBoard;
  gIsFirstClick = false;
  gBoard = setRndMines(posI, posJ);
  for (var i = 0; i < gSize.SIZE; i++) {
    for (var j = 0; j < gSize.SIZE; j++) {
      finalBoard = getNegsCount(i, j);
    }
  }
  gBoard = finalBoard;
}

function cellClicked(elCell, posI, posJ) {
  if (gIsFirstClick) {
    startTimer();
    setMinesNegsCount(posI, posJ)
  }
  var clickedCell = gBoard[posI][posJ];
  clickedCell.isShown = true;
  gGame.shownCount++;
  elCell.classList.add('open-cell');
  updateScore();
  if (clickedCell.minesAroundCount > 0) {
    elCell.innerText = clickedCell.minesAroundCount;
  }
  if (clickedCell.isMine) checkGameOver(elCell, clickedCell.isMine);
  else expandShown(posI, posJ);
}

function cellMarked(elCell, i, j, e) {
  if (gIsFirstClick) {
    gGame.isOn = true;
    startTimer();
  }
  e.preventDefault();
  if (elCell.innerText === FLAG) {
    elCell.innerText = '';
    gBoard[i][j].isMarked = false;
    gGame.markedCount--;
  } else {
    elCell.innerText = FLAG;
    gBoard[i][j].isMarked = true;
    gGame.markedCount++;
    checkGameOver(elCell);
  }
}

function getAllMines() {
  for (var i = 0; i < gSize.SIZE; i++) {
    for (var j = 0; j < gSize.SIZE; j++) {
      var cell = gBoard[i][j];
      if (cell.isMine) {
        var elMineCell = document.querySelector(`.cell-${i}-${j}`);
        elMineCell.classList.add('open-cell');
        elMineCell.innerText = MINE;
      }
    }
  }
}

function checkGameOver(elCell, isMine) {
  var elSmileyBtn = document.querySelector('.smiley-btn');
  if ((gGame.shownCount + gGame.markedCount) === gSize.SIZE ** 2 &&
    gGame.markedCount === gSize.MINES) {
    gGame.isOn = false;
    stopTimer();
    elSmileyBtn.innerText = '😎';
  }
  if (isMine) {
    stopTimer();
    elCell.classList.add('open-cell');
    elCell.innerText = EXPLOSION;
    setTimeout(() => {
      elCell.innerText = MINE;
      getAllMines();
      elSmileyBtn.innerText = '😭';
    }, 500)
    return;
  }
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function startTimer() {
  gGame.isOn = true;
  timer();
}

function restartGame() {
  stopTimer();
  var elSmileyBtn = document.querySelector('.smiley-btn');
  var elScore = document.querySelector('.score');
  var elLvlContainer = document.querySelector('.levels-container');
  gGame.shownCount = 0;
  gGame.isMarked = 0;
  gIsFirstClick = true;
  elSmileyBtn.innerText = '😀';
  gTime = 0;
  gElTimer.innerHTML = '00:00:00';
  elScore.innerText = 0;
  elLvlContainer.innerHTML = '';
  initGame();
}

function stopTimer() {
  gGame.isOn = false;
}

function timer() {
  if (gGame.isOn) {
    setTimeout(function () {
      gTime++;
      var min = Math.floor(gTime / 100 / 60);
      var sec = Math.floor(gTime / 100);
      var mSec = gTime % 100;

      (min < 10) ? min = '0' + min: sec;
      (sec >= 60) ? sec = sec % 60: sec;
      (sec < 10) ? sec = '0' + sec: sec;
      gElTimer.innerHTML = `${min}:${sec}:${mSec}`;
      timer();
    }, 10)
  }
}