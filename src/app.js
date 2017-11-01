'use strict';

(function() {
  // ======================================================
  // 変数宣言

  // スライド全体のサイズ
  var slideSize = 420;

  // ステージデータ
  var stageSize = [
    4, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 6
  ];

  // スコアレート
  var timeBonus = 270;
  var movePenalty = 90;

  // オブジェクトのキャッシュ
  var $container, $page, $title, $board, $text, $img = {};

  // 画像リスト
  var images = [
    'start.png',
    'stage-next.png',
    'stage-unknown.png',
    'ready.png',
    'go.png',
    'clear-c.png',
    'clear-l.png',
    'clear-e.png',
    'clear-a.png',
    'clear-r.png',
    'gameover.png'
  ];
  for (var i = 0; i <= 16; i++) {
    images.push('cat-' + i + '.jpg');
  }
  images.loadCount = 0;
  images.loaded = function() {
    return this.loadCount === this.length;
  };

  // クリックイベント
  var CLICK_EVENT = 'mousedown touchstart'

  // ======================================================
  // 各種状態
  //
  var state = (function() {
    var currentPage = 'title';
    var userData = {lastStage: 0};

    return {
      // ゲーム情報
      game: {
        // 盤面に関するデータ
        board: {
          // パネル配列
          panels: [],

          // ------------------------------------------
          // 盤面をシャッフル
          shuffle: function() {
            do {
              // 最後のパネルは固定
              for (var i = this.count - 1; --i >= 0;) {
                var r = Math.floor(Math.random() * (i + 1));
                this.swapPanel(i, r);
              }
            } while (!isSolvable());
          },

          // ------------------------------------------
          // パネルを交換
          swapPanel: function(idx1, idx2) {
            var tmp = this.panels[idx1];
            this.panels[idx1] = this.panels[idx2];
            this.panels[idx2] = tmp;
          },

          // ------------------------------------------
          // パネルを移動
          movePanel: function(idx) {
            var pos = util.idx2pos(idx);
            this.panels[idx].$elem.css('left', pos.x).css('top', pos.y);
          },

          // ------------------------------------------
          // パズルが完成したか調べる
          sorted: function() {
            for (var i = 0; i < this.count; i++) {
              if (this.panels[i].picId !== i) {
                return false;
              }
            }
            return true;
          },

          // ------------------------------------------
          // パネルをスライドさせる
          // 動かせなかったら 0、完成しなかったら 1、完成したら 2 を返す
          slidePanel: function(targetIdx) {
            var targetPos = util.idx2pos(targetIdx);
            var blankPos = util.idx2pos(this.blankIndex);

            // 動かせるかチェック
            if (targetPos.x !== blankPos.x && targetPos.y !== blankPos.y) {
              return 0;
            }

            // 動かす
            var step;
            if (targetPos.y === blankPos.y)
              step =  blankPos.x < targetPos.x ? 1 : -1;
            else
              step = (blankPos.y < targetPos.y ? 1 : -1) * state.game.size;

            for (var i = this.blankIndex; i != targetIdx; i += step) {
              this.swapPanel(i, i + step);
              this.movePanel(i);
            }
            this.movePanel(this.blankIndex = targetIdx);

            // クリアチェック
            return this.sorted() ? 2 : 1;
          }
        }
      },

      // ------------------------------------------
      // 現在のページ
      getCurrentPageId: function() {
        return currentPage;
      },
      getCurrentPage: function() {
        return $('#page-' + currentPage);
      },
      setCurrentPage: function(page) {
        currentPage = page;
        return this.getCurrentPage();
      },

      // ------------------------------------------
      // ユーザーデータ
      getLastStage: function() {
        return userData.lastStage;
      },
      loadUserData: function(cb) {
        var data = localStorage.getItem('userData');
        if (data) {
          userData = JSON.parse(data);
        }
        cb();
      },
      saveUserData: function(stage, score, cb) {
        userData.lastStage = stage;
        userData.highScore = score;
        localStorage.setItem('userData', JSON.stringify(userData));
        cb();
      },

      // ------------------------------------------
      // ゲームデータ
      initGame: function(stage) {
        this.game.stage = stage;
        this.game.size = stageSize[stage];
        this.game.board.count = this.game.size * this.game.size;
        this.game.board.blankIndex = this.game.board.count - 1;
        this.game.board.size = slideSize / this.game.size;
        this.game.board.panels = [];
        this.game.score = {
          score: 0,
          time: this.game.board.count * 30 + stage * 10,
          move: 0
        };
        this.game.timerId = null;
      }
    };
  })();

  // ======================================================
  // ユーティリティ
  var util = {
    // ------------------------------------------
    // インデックスから位置データを返す
    idx2pos: function(idx) {
      return {
        x: parseInt(idx % state.game.size) * state.game.board.size,
        y: parseInt(idx / state.game.size) * state.game.board.size
      };
    },
    // ------------------------------------------
    // 数値に px をつける
    px: function(size) {
      return size === 0 ? 0 : size + 'px';
    },
    // ------------------------------------------
    // 画面保護のON/OFF
    shield: {
      on: function() { $page.shield.show(); },
      off: function() { $page.shield.hide(); }
    },
    // ------------------------------------------
    // 複数処理の直列実行（処理ごとに遅延時間を指定可能）
    serial: function(tasks) {
      var n = -1;
      var next = function() {
        if (++n < tasks.length) {
          setTimeout(function() { tasks[n][1](next) }, tasks[n][0]);
        }
      };
      next();
    },
    // ------------------------------------------
    // 画面切り替え
    changePage: function(newPage, cb) {
      var speed = 400;

      util.shield.on();
      state.getCurrentPage().fadeOut(speed / 2, function() {
        state.setCurrentPage(newPage).fadeIn(speed / 2, function() {
          util.shield.off();
          cb && cb();
        });
      });
    },
    // ------------------------------------------
    // ログ出力
    log: function() {
      console.info.apply(console, arguments);
    }
  }

  // ======================================================
  // パズルが解けるか評価する
  //
  function isSolvable() {
    var permutation = [], count = 0;

    for (var i = 0; i < state.game.board.count - 1; i++)
      permutation[i] = state.game.board.panels[i].picId;

    for (var i = 0; i < state.game.board.count - 1; i++) {
      if (permutation[i] === -1)
        continue;
      count += getPermutationLength(permutation, i) - 1;
    }

    // insufficient or not even permutation
    return count >= state.game.board.count - state.game.size && count % 2 === 0;
  }

  // 巡回置換の長さを得る
  function getPermutationLength(permutation, startIdx) {
    var length = 1, picId = permutation[startIdx], tmp;
    while (permutation[startIdx] >= 0 && picId !== startIdx) {
      length++;
      tmp = picId, picId = permutation[picId], permutation[tmp] = -1;
    }
    return length;
  }

  // ======================================================
  // タイトル画面表示
  //
  function showTitle() {
    // 盤面の初期化
    state.initGame(0);
    initBoard($title);

    // 初期配置を作る
    var slideIdxs = [12, 0, 2, 14, 12, 8, 11, 3, 2, 14];
    var fnSlide = state.game.board.slidePanel.bind(state.game.board);
    slideIdxs.concat(15).forEach(fnSlide);

    // 戻していく関数
    var fnReverse = function(cb) {
      if (state.getCurrentPageId() !== 'title') {
        return;
      }
      if (slideIdxs.length === 0) {
        return cb();
      }
      fnSlide(slideIdxs.pop());
      setTimeout(fnReverse.bind(null, cb), 100);
    };

    // スタイルの初期化
    $title.attr('data-state', '');
    $img['start.png'].removeClass('playing');

    // 画面を表示
    util.changePage('title', function() {
      slideIdxs.unshift(15);
      setTimeout(function() {
        fnReverse(function() {
          animFlush($title, function() {
            $img['start.png'].addClass('playing');
          });
        });
      }, 1500);
    });
  }

  // ======================================================
  // ステージセレクト画面表示
  //
  function showStageSelect() {
    // ステージセレクト画面を表示するたびにユーザーデータをロードする
    state.loadUserData(function() {
      // ステージパネルを初期化
      $('.stage-panel').each(function(idx) {
        var $elem = $(this);
        var lastStage = state.getLastStage();
        var stage = idx + 1;

        if (idx <= lastStage) {
          $elem.addClass('selectable');
          if (idx < lastStage) {
            $elem.css('backgroundImage', 'url("image/cat-' + stage + '.jpg")');
          } else {
            $elem.css('backgroundImage', 'url("image/stage-next.png")');
          }
        } else {
          $elem.removeClass('selectable');
          $elem.css('backgroundImage', 'url("image/stage-unknown.png")');
        }
      });

      // 画面を表示
      util.changePage('select');
    });
  }

  // ======================================================
  // ゲーム画面表示
  //
  function showGame(stage) {
    // 盤面の初期化
    state.initGame(stage);
    initBoard($board);
    shuffleBoard();

    // テキストを初期化
    updateScore();

    // スタイルの初期化
    $board.attr('data-state', '');
    $img['gameover.png'].removeClass('playing').hide();

    // 画面を表示
    util.changePage('game', function() {
      util.shield.on();
      util.serial([
        [1200, animReady],
        [2000, animShuffle],
        [800, animStart],
        [500, function() {
          util.shield.off();
          gameMain();
        }]
      ]);
    });
  }

  // ------------------------------------------
  // ゲームメイン
  function gameMain() {
    // タイムを減らす
    state.game.timerId = setInterval(function() {
      if (--state.game.score.time === 0) {
        gameOver();
      }
      updateScore();
    }, 1000);
  }

  // ------------------------------------------
  // ゲーム終了の共通処理
  function gameEnd() {
    clearInterval(state.game.timerId);
    util.shield.on();
  }

  // ------------------------------------------
  // ゲームクリアー
  function gameClear() {
    gameEnd();

    // スコア算出
    var score = state.game.score.time * timeBonus - state.game.score.move * movePenalty;
    if (score < 0) {
      score = 0;
    }

    // 最終ステージ更新
    var lastStage = state.getLastStage();
    if (lastStage < state.game.stage) {
      lastStage = state.game.stage;
    }

    state.saveUserData(lastStage, score, function() {
      animFlush($board, function() {
        animClear(function() {
          animScore(function() {
            $page.shield.one(CLICK_EVENT, showStageSelect);
          });
        });
      });
    });
  }

  // ------------------------------------------
  // ゲームオーバー
  function gameOver() {
    gameEnd();

    animGameOver($board, function() {
      $page.shield.one(CLICK_EVENT, showStageSelect);
    });
  }

  // ------------------------------------------
  // 盤面の初期化
  function initBoard($b) {
    $b.empty();

    // パネルを生成
    state.game.board.panels = [];
    for (var i = 0; i < state.game.board.count; i++) {
      var pos = util.idx2pos(i);
      state.game.board.panels.push({
        picId: i,
        $elem: $('<div/>').addClass('panel').addClass('panel-size' + state.game.size)
          .css('background-image', 'url("image/cat-' + state.game.stage + '.jpg")')
          .css('background-position', util.px(-pos.x) + ' ' + util.px(-pos.y))
          .css('left', pos.x).css('top', pos.y)
          .data('picId', i)
          .appendTo($b)
      });
    }
  }

  function shuffleBoard() {
    // データだけシャッフルして、画面上のパネル移動は後で行う
    state.game.board.shuffle();
  }

  // ------------------------------------------
  // パネルをクリックしたときの処理
  function handleClickPanel() {
    var picId = $(this).data('picId');

    // クリックされたパネルのインデクスを探す
    var clickIndex = -1;
    for (var i = 0; i < state.game.board.count; i++) {
      if (state.game.board.panels[i].picId === picId) {
        clickIndex = i;
        break;
      }
    }

    // スライドさせる
    var ret = state.game.board.slidePanel(clickIndex);
    if (ret > 0) {
      state.game.score.move++;
      updateScore();

      if (ret === 2) {
        gameClear();
      }
    }
  }

  // ------------------------------------------
  // スコアを更新
  function updateScore() {
    $text.stage.text(state.game.stage);
    $text.score.text(state.game.score.score);
    $text.time.text(state.game.score.time);
    $text.move.text(state.game.score.move);
  }

  // ------------------------------------------
  // アニメーション：shuffle
  function animShuffle(next) {
    for (var i = 0; i < state.game.board.count; i++) {
      state.game.board.movePanel(i);
    }
    next();
  }

  // ------------------------------------------
  // アニメーション：READY
  function animReady(done) {
    done();
    util.log('ready:show');
    $img['ready.png'].show();
    util.serial([
      [10, function(next) {
        util.log('ready:playing');
        $img['ready.png'].addClass('playing');
        next();
      }],
      [2000, function() {
        util.log('ready:finish');
        $img['ready.png'].removeClass('playing').hide();
      }]
    ]);
}

  // ------------------------------------------
  // アニメーション：GO
  function animStart(done) {
    done();
    util.log('go:show');
    $img['go.png'].show();
    util.serial([
      [10, function(next) {
        util.log('go:playing');
        $img['go.png'].addClass('playing');
        next();
      }],
      [1000, function() {
        util.log('go:finish');
        $img['go.png'].removeClass('playing').hide();
      }]
    ]);
  }

  // ------------------------------------------
  // アニメーション：flush
  function animFlush($b, done) {
    util.serial([
      [10, function(next) {
        $b.attr('data-state', 'flush');
        next();
      }],
      [500, function(next) {
        $b.attr('data-state', 'clear');
        next();
      }],
      [500, done]
    ]);
  }

  // ------------------------------------------
  // アニメーション：clear
  function animClear(done) {
    var chars = ['c', 'l', 'e', 'a', 'r'];
    util.serial(
      chars.map(function(ch) {
        return [100, function(next) {
          $img['clear-' + ch + '.png'].addClass('playing');
          next();
        }];
      }).concat([
        [1500, function(next) {
          chars.forEach(function(ch) {
            $img['clear-' + ch + '.png'].addClass('end');
          });
          next();
        }],
        [1000, function() {
          chars.forEach(function(ch) {
            $img['clear-' + ch + '.png'].removeClass('playing').removeClass('end');
          });
          done();
        }]
      ])
    );
  }

  // ------------------------------------------
  // アニメーション：score
  function animScore(done) {
    var score = state.game.score;

    var animTime = function(next) {
      if (score.time === 0) {
        return next();
      }
      if (score.time >= 3) {
        score.time -= 3;
        score.score += timeBonus * 3;
      } else {
        score.score += timeBonus * score.time;
        score.time = 0;
      }
      updateScore();
      setTimeout(animTime.bind(null, next), 30);
    };

    var animMove = function(next) {
      if (score.move === 0) {
        return next();
      }
      score.move--;
      score.score -= movePenalty;
      if (score.score < 0) {
        score.score = 0;
      }
      updateScore();
      setTimeout(animMove.bind(null, next), 30);
    };

    util.serial([
      [300, animTime],
      [900, animMove],
      [10, done]
    ]);
  }

  // ------------------------------------------
  // アニメーション：gameover
  function animGameOver($b, done) {
    util.serial([
      [1000, function(next) {
        util.log('grayscale');
        $b.attr('data-state', 'gameover');
        next();
      }],
      [1200, function(next) {
        util.log('gameover:ready');
        $img['gameover.png'].show();
        next();
      }],
      [100, function() {
        util.log('gameover:playing');
        $img['gameover.png'].addClass('playing');
        done();
      }]
    ]);
  }

  // ======================================================
  // 初期化
  //
  function init() {
    if (!images.loaded()) {
      util.log('Wait to load images...');
      setTimeout(init, 100);
      return;
    }
    util.log('All images were loaded.');

    // jQueryオブジェクトをキャッシュする
    $container = $('#container')
      .append($img['ready.png'].addClass('anim-ready').hide())
      .append($img['go.png'].addClass('anim-go').hide());

    $page = {
      title: $('#page-title')
        .append($img['start.png'].addClass('anim-start')),
      select: $('#page-select'),
      game: $('#page-game')
        .append($img['gameover.png'].addClass('anim-gameover')),
      shield: $('#page-shield')
    };
    $title = $('#title-board');
    $board = $('#game-board').on(CLICK_EVENT, '.panel', handleClickPanel);
    $text = {
      stage: $('#game-stage'),
      score: $('#high-score'),
      time: $('#rest-time'),
      move: $('#move-count')
    };

    ['c', 'l', 'e', 'a', 'r'].forEach(function(ch, i) {
      $img['clear-' + ch + '.png'].addClass('anim-clear')
        .css('left', 18 + 115 * i).appendTo($page.game);
    });

    // タイトル画面クリックでステージセレクトへ
    $page.title.on(CLICK_EVENT, showStageSelect);

    // ステージパネルをセット
    for (var stage = 1; stage <= 16; stage++) {
      $('<div/>').addClass('stage-panel')
        .attr('data-stage', stage)
        .appendTo($page.select);
    }

    // ステージパネルクリックでゲーム画面へ
    $page.select.on(CLICK_EVENT, '.stage-panel.selectable', function() {
      showGame($(this).data('stage'));
    });

    // 初期画面表示
    showTitle();
    state.getCurrentPage().fadeIn(500);
  }

  // 画像のプリロード
  images.forEach(function(file) {
    $img[file] = $('<img src="image/' + file + '"/>')
      .on('load', function() {
        images.loadCount++;
      })
      .on('error', function() {
        images.loadCount++;
        console.warn("Can't load " + file);
      });
  });

  // Initialize
  $(init);
})();
