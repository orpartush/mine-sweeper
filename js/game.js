'use strict';
/*
Change log:
1. Rearranged the code - forgot to delete 3 functions after reordering the code
  before final delivery =/
2. Rearranged getLvl(), half of the function is now in restartGame().
3. Fixed safe click btn bug: didn't reset after clicking a level btn in the 
  middle of a game.
4. Fixed win condition bug - if the user marked a saved bomb(used a life), 
  it was counted as 2 marks.
5. Fixed hint bug - when using hint on a saved bomb(used a life), the emoji 
  is changed to a bomb and the "saved" emoji didn't come back.
6. Best score is now shown after refresh.
7. Added manual mines counter.
*/

// Const Variables
const MINE = '💣';
const EXPLOSION = '💥';
const FLAG = '🚩';

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
var gLifes = 1;
var gIsHintOn = false;
var gUsedHintsCount = 0;
var gSafeClicks = 3;
var gIsManualModeOn = false;
var gManualMinesCount = 0;
var gTime = 0;
var gElTimer = document.querySelector('.timer');

///init///
function initGame() {
  gBoard = buildBoard();
  renderBoard()
  createLevelsBtns();
  setLifes();
  if (localStorage.getItem('bestScore')) {
    var elBestScore = document.querySelector('.best-score');
    elBestScore.innerText = localStorage.getItem('bestScore');
  } else localStorage.setItem('bestScore', 0);
}

function restartGame() {
  stopTimer();
  //timer
  gTime = 0;
  gElTimer.innerHTML = '00:00:00';
  //game status
  gGame.shownCount = 0;
  gGame.markedCount = 0;
  gIsFirstClick = true;
  //smiley btn
  var elSmileyBtn = document.querySelector('.smiley-btn');
  elSmileyBtn.innerText = '😀';
  //score
  var elScore = document.querySelector('.score');
  elScore.innerText = 0;
  //level btns
  var elLvlsContainer = document.querySelector('.lvls-container');
  elLvlsContainer.innerHTML = '';
  //lifes
  var elLifesContainer = document.querySelector('.lifes');
  elLifesContainer.innerHTML = '';
  //hints
  gIsHintOn = false;
  var elHint = document.querySelector('.hints-btn');
  elHint.innerText = '💡';
  gUsedHintsCount = 0;
  //safeclicks
  var elSafeClicks = document.querySelector('.safe-click-btn');
  elSafeClicks.classList.remove('unable-safeclick');
  gSafeClicks = 3;
  var elSafeTxt = document.querySelector('.clicks-left');
  elSafeTxt.innerText = `${gSafeClicks} left`;
  //manual mines
  gIsManualModeOn = false;
  gManualMinesCount = 0;
  initGame();
}

///Board///
function buildBoard() {
  var board = [];
  for (var i = 0; i < gSize.SIZE; i++) {
    board[i] = [];
    for (var j = 0; j < gSize.SIZE; j++) {
      var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
        isSaved: false //if the user used a life, he cant mark the cell
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
  if (gManualMinesCount === 0) gBoard = setRndMines(posI, posJ);
  for (var i = 0; i < gSize.SIZE; i++) {
    for (var j = 0; j < gSize.SIZE; j++) {
      finalBoard = getNegsCount(i, j);
    }
  }
  gBoard = finalBoard;
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

///Score-board and buttons///
function getLvl(elBtn) {
  if (elBtn.classList.contains('easy')) {
    gLifes = 1;
    gSize.SIZE = 4;
    gSize.MINES = 2;
  } else if (elBtn.classList.contains('medium')) {
    gLifes = 2;
    gSize.SIZE = 8;
    gSize.MINES = 12;
  } else if (elBtn.classList.contains('extreme')) {
    gLifes = 3;
    gSize.SIZE = 12;
    gSize.MINES = 30;
  }
  restartGame();
}

function createLevelsBtns() {
  var lvls = ['EASY', 'MEDIUM', 'EXTREME'];
  var elLvlsContainer = document.querySelector('.lvls-container');
  for (var lvl of lvls) {
    var strHtml = `
      <button 
        class="${lvl.toLowerCase()} lvl-btn" 
        onclick="getLvl(this)">
        ${lvl}
      </button>
    `;
    elLvlsContainer.innerHTML += strHtml;
  }
}


function setLifes() {
  var elLifes = document.querySelector('.lifes');
  elLifes.innerHTML = '';
  if (gLifes < 3) {
    for (var i = 0; i < gLifes; i++) {
      elLifes.innerHTML += `<p class="life">❤️</p>`;
    }
    for (var i = gLifes; i < 3; i++) {
      elLifes.innerHTML += `<p class="life">💔</p>`;
    }
  } else {
    for (var i = 0; i < gLifes; i++) {
      elLifes.innerHTML += `<p class="life">❤️</p>`;
    }
  }
}

function showBestScore() {
  var elBestScore = document.querySelector('.best-score');
  elBestScore.innerText = localStorage.getItem('bestScore');
}

function getHint(elHint) {
  if (gIsHintOn) {
    elHint.innerText = '💡';
    gIsHintOn = false
  } else {
    elHint.innerText = '🔎';
    gIsHintOn = true;
  }
}

function updateScore() {
  var elScore = document.querySelector('.score');
  var currScore = +elScore.innerText;
  elScore.innerText = currScore + 100;
}

///Gameplay///
function cellClicked(elCell, posI, posJ) {
  if (gIsManualModeOn) {
    setMinesManually(elCell, posI, posJ);
    return;
  }
  if (gIsFirstClick) {
    gGame.isOn = true;
    startTimer();
    setMinesNegsCount(posI, posJ)
  }
  if (gGame.isOn === false) return;
  if (gIsHintOn) {
    if (gUsedHintsCount === 3) {
      var elHintBtn = document.querySelector('.hints-btn');
      elHintBtn.innerText = '🤐';
      gIsHintOn = false;
      return;
    }
    gUsedHintsCount++;
    showHint(posI, posJ);
    setTimeout(() => hideHint(posI, posJ), 1000);
    return;
  }
  if (gBoard[posI][posJ].isSaved) return;
  var clickedCell = gBoard[posI][posJ];
  clickedCell.isShown = true;
  gGame.shownCount++;
  elCell.classList.add('open-cell');
  if (clickedCell.minesAroundCount > 0) {
    elCell.innerText = clickedCell.minesAroundCount;
  }
  if (clickedCell.isMine) checkGameOver(elCell, clickedCell.isMine, posI, posJ);
  else {
    updateScore();
    expandShown(posI, posJ)
  };
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
      if (neg.minesAroundCount > 0 && !neg.isShown) {
        elNegCell.innerText = neg.minesAroundCount;
        elNegCell.classList.add('open-cell');
        updateScore();
        neg.isShown = true;
        gGame.shownCount++;
      }
      if (neg.isShown || neg.isMarked) continue;
      else {
        elNegCell.classList.add('open-cell');
        updateScore();
        neg.isShown = true;
        gGame.shownCount++;
      }
      expandShown(i, j);
    }
  }
  checkGameOver();
}

function checkGameOver(elCell, isMine, posI, posJ) {
  var elSmileyBtn = document.querySelector('.smiley-btn');
  var elScore = document.querySelector('.score');
  var bestScore = localStorage.getItem('bestScore');
  if ((gGame.shownCount + gGame.markedCount) === gSize.SIZE ** 2 &&
    gGame.markedCount === gSize.MINES) {
    if (+elScore.innerText > bestScore) {
      localStorage.setItem('bestScore', +elScore.innerText);
      showBestScore();
    }
    gGame.isOn = false;
    stopTimer();
    elSmileyBtn.innerText = '🥳';
  }
  if (isMine && gLifes > 0) {
    gLifes--;
    elCell.innerHTML = MINE;
    gGame.saveCount++;
    gBoard[posI][posJ].isSaved = true;
    gBoard[posI][posJ].isMarked = true;
    gGame.markedCount++;
    gGame.shownCount--;
    setTimeout(() => {
      elCell.innerText = '💘';
    }, 500);
    setLifes();
    checkGameOver();
    return;
  }
  if (isMine && gLifes === 0) {
    if (+elScore.innerText > bestScore) {
      localStorage.setItem('bestScore', +elScore.innerText);
      showBestScore();
    }
    gGame.isOn = false;
    stopTimer();
    elCell.classList.add('open-cell');
    elCell.innerText = EXPLOSION;
    setTimeout(() => {
      elCell.innerText = MINE;
      openAllMines();
      elSmileyBtn.innerText = '😭';
    }, 500)
    return;
  }
}

function cellMarked(elCell, i, j, e) {
  e.preventDefault();
  if (!gGame.isOn || gBoard[i][j].isSaved) return;
  if (gIsFirstClick) {
    gGame.isOn = true;
    startTimer();
  }
  if (elCell.innerText === FLAG && gBoard[i][j].isMine) {
    elCell.innerText = '';
    gBoard[i][j].isMarked = false;
    gGame.markedCount--;
  } else {
    elCell.innerText = FLAG;
    gBoard[i][j].isMarked = true;
    if (gBoard[i][j].isMine) {
      gGame.markedCount++;
      checkGameOver(elCell);
    }
  }
}

function openAllMines() {
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

///Safe click///
function showSafeCell(elSafeBtn) {
  if (!gGame.isOn) return;
  if (gSafeClicks === 0) return;
  for (let i = 0; i < gSize.SIZE ** 2; i++) {
    var rndI = getRandomIntInclusive(0, gSize.SIZE - 1);
    var rndJ = getRandomIntInclusive(0, gSize.SIZE - 1);
    var cell = gBoard[rndI][rndJ];
    if (!cell.isMine && !cell.isShown) {
      var elCell = document.querySelector(`.cell-${rndI}-${rndJ}`);
      var safeTxt = document.querySelector('.clicks-left');
      gSafeClicks--;
      safeTxt.innerText = `${gSafeClicks} left`;
      elCell.classList.add('safe-cell');
      elCell.innerText = '😇';
      setTimeout(() => {
        elCell.innerText = '';
        elCell.classList.remove('safe-cell');
      }, 1000)
      if (gSafeClicks === 0) elSafeBtn.classList.add('unable-safeclick');
      return;
    }
  }
}

///Hints///
function showHint(posI, posJ) {
  for (var i = posI - 1; i <= posI + 1; i++) {
    for (var j = posJ - 1; j <= posJ + 1; j++) {
      if (i < 0 || i > gSize.SIZE - 1) continue;
      if (j < 0 || j > gSize.SIZE - 1) continue;
      var cell = gBoard[i][j];
      var elCell = document.querySelector(`.cell-${i}-${j}`);
      if (cell.isMine && cell.isSaved === false) {
        elCell.innerText = MINE;
        elCell.classList.add('open-cell');
      } else elCell.classList.add('open-cell');
    }
  }
}

function hideHint(posI, posJ) {
  for (var i = posI - 1; i <= posI + 1; i++) {
    for (var j = posJ - 1; j <= posJ + 1; j++) {
      if (i < 0 || i > gSize.SIZE - 1) continue;
      if (j < 0 || j > gSize.SIZE - 1) continue;
      var cell = gBoard[i][j];
      var elCell = document.querySelector(`.cell-${i}-${j}`);
      if (cell.isShown) continue;
      if (cell.isMine) {
        elCell.classList.remove('open-cell');
        elCell.innerText = ''
      } else elCell.classList.remove('open-cell');
    }
  }
}

///Manual Mines///
function setManualModeOn() {
  if (gGame.isOn) return;
  gIsManualModeOn = true;
  var elMinesLeft = document.querySelector('.manual-mines-left');
  elMinesLeft.innerText = (gSize.MINES - gManualMinesCount) + MINE;
}

function setMinesManually(elCell, i, j) {
  if (gBoard[i][j].isMine) {
    alert('Already a ' + MINE);
    return;
  }
  gManualMinesCount++;
  var elMinesLeft = document.querySelector('.manual-mines-left');
  elMinesLeft.innerText = (gSize.MINES - gManualMinesCount) + MINE;
  gBoard[i][j].isMine = true;
  elCell.innerText = MINE;
  if (gManualMinesCount === gSize.MINES) gIsManualModeOn = false;
  setTimeout(() => {
    elCell.innerText = '';
    if (gManualMinesCount === gSize.MINES) {
      elMinesLeft.innerText = '✔️' + MINE;
      alert(`Mines are ready, let's play!`);
    }
  }, 300);
}

//Timer
function startTimer() {
  gGame.isOn = true;
  timer();
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

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}