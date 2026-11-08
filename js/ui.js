'use strict';

const UI = {
  init(onStart) {
    const titleScreen = document.getElementById('title-screen');
    const gameScreen = document.getElementById('game-screen');
    const levelList = document.getElementById('level-list');
    
    // 点击开始按钮
    document.getElementById('btn-start').addEventListener('click', () => {
      titleScreen.classList.remove('active');
      gameScreen.classList.add('active');
      if(onStart) onStart();
    });

    // 点击左侧关卡列表
    levelList.addEventListener('click', (e) => {
      if (e.target.tagName === 'LI') {
        const levelIdx = parseInt(e.target.dataset.level, 10);
        titleScreen.classList.remove('active');
        gameScreen.classList.add('active');
        if(onStart) onStart(levelIdx);
      }
    });
  },

  // 同步关卡完成状态到 DOM
  updateLevelStatus(stars) {
    const lis = document.querySelectorAll('#level-list li');
    lis.forEach((li, i) => {
      if (stars[i] === 'good') li.classList.add('completed');
      else li.classList.remove('completed');
    });
  },

  // 返回主页
  showTitle() {
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('title-screen').classList.add('active');
  }
};