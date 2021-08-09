---
layout: page
title: 돌파고 / 로파고
description: 로스트아크 어빌리티 스톤 세공을 위한 시뮬레이터입니다.
exclude_nav: true
favicon: /images/Ability_22.png
---

<h5>로스트아크 어빌리티 스톤 세공 시뮬레이터 (<a href="dolpago_old">구버젼</a>)</h5>

<h6 id="info">확률 계산 중...</h6>

<div>
<span id="cur_prob"></span>
<select id="num_attempts" onchange="init();">
<option value="6">6칸</option>
<option value="7">7칸</option>
<option value="8">8칸</option>
<option value="9">9칸</option>
<option value="10" selected="selected">10칸</option>
</select>
<button onclick="undo();">취소</button>
<button onclick="reset();">리셋</button>
</div>

<div>
<span>증가능력1</span>
<font color="blue"><span id="ability1_sym"></span></font>
<button onclick="do_attempt(1, 1);">성공</button>
<button onclick="do_attempt(1, 0);">실패</button>
<span id="ability1_prob"></span>
<span id="ability1_text"></span>
</div>

<div>
<span>증가능력2</span>
<font color="blue"><span id="ability2_sym"></span></font>
<button onclick="do_attempt(2, 1);">성공</button>
<button onclick="do_attempt(2, 0);">실패</button>
<span id="ability2_prob"></span>
<span id="ability2_text"></span>
</div>

<div>
<span>감소능력1</span>
<font color="red"><span id="ability3_sym"></span></font>
<button onclick="do_attempt(3, 1);">성공</button>
<button onclick="do_attempt(3, 0);">실패</button>
<span id="ability3_prob"></span>
<span id="ability3_text"></span>
</div>

<div>
<span>목표 : </span>
<span id="goal"></span>
<span> (아래 표의 칸을 클릭하여 수정 가능)</span>
</div>

<table id="grid">
</table>

<div>
<div>프리셋 목표</div>
<div><button onclick="preset(0);">16돌</button> : 9/7, 10/6 (8/8 제외)</div>
<div><button onclick="preset(1);">14돌</button> : 7/7, 9/5, 10/4 (8/6 제외)</div>
</div>

<div>단순 목표</div>
<div class="row">
<div class="column">
<div style="text-align: center;">증가1</div>
<button class="block" onclick="change_goal(1, 10);">10</button>
<button class="block" onclick="change_goal(1, 9);">9</button>
<button class="block" onclick="change_goal(1, 8);">8</button>
<button class="block" onclick="change_goal(1, 7);">7</button>
<button class="block" onclick="change_goal(1, 6);">6</button>
<button class="block" onclick="change_goal(1, 5);">5</button>
<button class="block" onclick="change_goal(1, 4);">4</button>
<button class="block" onclick="change_goal(1, 3);">3</button>
<button class="block" onclick="change_goal(1, 2);">2</button>
<button class="block" onclick="change_goal(1, 1);">1</button>
<button class="block" onclick="change_goal(1, 0);">0</button>
</div>
<div class="column">
<div style="text-align: center;">증가2</div>
<button class="block" onclick="change_goal(2, 10);">10</button>
<button class="block" onclick="change_goal(2, 9);">9</button>
<button class="block" onclick="change_goal(2, 8);">8</button>
<button class="block" onclick="change_goal(2, 7);">7</button>
<button class="block" onclick="change_goal(2, 6);">6</button>
<button class="block" onclick="change_goal(2, 5);">5</button>
<button class="block" onclick="change_goal(2, 4);">4</button>
<button class="block" onclick="change_goal(2, 3);">3</button>
<button class="block" onclick="change_goal(2, 2);">2</button>
<button class="block" onclick="change_goal(2, 1);">1</button>
<button class="block" onclick="change_goal(2, 0);">0</button>
</div>
<div class="column">
<div style="text-align: center;">감소1</div>
<button class="block" onclick="change_goal(3, 10);">10</button>
<button class="block" onclick="change_goal(3, 9);">9</button>
<button class="block" onclick="change_goal(3, 8);">8</button>
<button class="block" onclick="change_goal(3, 7);">7</button>
<button class="block" onclick="change_goal(3, 6);">6</button>
<button class="block" onclick="change_goal(3, 5);">5</button>
<button class="block" onclick="change_goal(3, 4);">4</button>
<button class="block" onclick="change_goal(3, 3);">3</button>
<button class="block" onclick="change_goal(3, 2);">2</button>
<button class="block" onclick="change_goal(3, 1);">1</button>
<button class="block" onclick="change_goal(3, 0);">0</button>
</div>
<div class="column">
<div style="text-align: center;">증가합</div>
<button class="block" onclick="change_goal(4, 20);">20</button>
<button class="block" onclick="change_goal(4, 19);">19</button>
<button class="block" onclick="change_goal(4, 18);">18</button>
<button class="block" onclick="change_goal(4, 17);">17</button>
<button class="block" onclick="change_goal(4, 16);">16</button>
<button class="block" onclick="change_goal(4, 15);">15</button>
<button class="block" onclick="change_goal(4, 14);">14</button>
<button class="block" onclick="change_goal(4, 13);">13</button>
<button class="block" onclick="change_goal(4, 12);">12</button>
<button class="block" onclick="change_goal(4, 11);">11</button>
<button class="block" onclick="change_goal(4, 10);">10</button>
</div>
</div>

<style>
.block {
  display: block;
}

.column {
  float: left;
  padding: 10px;
}

.row:after {
  content: "";
  display: table;
  clear: both;
}

button {
  margin: 1px;
  height: 2em;
  width: 4em;
}

#grid td {
  width: 30px;
  height: 30px;
}

#grid .nocolor {
  border: 1px solid black;
  text-align: center;
}

#grid .color {
  border: 1px solid black;
  text-align: center;
  background-color: yellow;
}
</style>

<script>
  /*
   * Global variables
   */

  let na; // number of attempts
  const PMAX = 6; // number of probs (25, 35, 45, 55, 65, 75)
  // double dp[na + 1][na + 1][na + 1][PMAX][na + 1][na + 1][na + 1];
  let dp; // initialized to 0

  // History of attempts
  // first value means ability number (1~3)
  // second value means success or fail (0: fail, 1: success)
  // abil1 success, abil2 fail => [[1, 1], [2, 0]]
  let seq;

  let goal1, goal2, goal3, goals;

  let goal_cells;

  /*
   * Global functions
   */

  function idx(a, b, c, p, d, e, f) {
    let na1 = na + 1;
    return (((((a * na1 + b) * na1 + c) * PMAX + p) * na1 + d) * na1 + e) * na1 + f;
  }

  function decode_p(p) {
    return 0.25 + p * 0.1;
  }

  function cal_prob1(a, b, c, p, d, e, f) {
    if (a == 0) return 0;
    const succ = d < na ? decode_p(p) * dp[idx(a - 1, b, c, Math.max(p - 1, 0), d + 1, e, f)] : 0;
    const fail = (1 - decode_p(p)) * dp[idx(a - 1, b, c, Math.min(p + 1, PMAX - 1), d, e, f)];
    return succ + fail;
  }

  function cal_prob1_safe(a, b, c, p, d, e, f) {
    if (f < 0) return 0;
    return cal_prob1(a, b, c, p, d, e, f);
  }

  function cal_prob2(a, b, c, p, d, e, f) {
    if (b == 0) return 0;
    const succ = e < na ? decode_p(p) * dp[idx(a, b - 1, c, Math.max(p - 1, 0), d, e + 1, f)] : 0;
    const fail = (1 - decode_p(p)) * dp[idx(a, b - 1, c, Math.min(p + 1, PMAX - 1), d, e, f)];
    return succ + fail;
  }

  function cal_prob2_safe(a, b, c, p, d, e, f) {
    if (f < 0) return 0;
    return cal_prob2(a, b, c, p, d, e, f);
  }

  function cal_prob3(a, b, c, p, d, e, f) {
    return c > 0 ? (f == 0 ? 0 : decode_p(p) * dp[idx(a, b, c - 1, Math.max(p - 1, 0), d, e, f - 1)]) + (1 - decode_p(p)) * dp[idx(a, b, c - 1, Math.min(p + 1, PMAX - 1), d, e, f)] : 0;
  }

  function cal_prob3_safe(a, b, c, p, d, e, f) {
    if (f < 0) return 0;
    return cal_prob3(a, b, c, p, d, e, f);
  }

  function cal_dp() {
    const st = performance.now();
    dp = new Float64Array((na + 1) ** 6 * PMAX); // initialized to 0
    for (let d = na; d >= 0; --d) {
    for (let a = 0; a <= na - d; ++a) {
    for (let e = na; e >= 0; --e) {
    for (let b = 0; b <= na - e; ++b) {
    for (let c = 0; c <= na; ++c) {
    for (let f = 0; f <= na; ++f) {
    for (let p = 0; p < PMAX; ++p) {
      let t;
      if (goal_cells[d][e] == 1 && a == 0 && b == 0 && c <= f) {
        t = 1;
      } else if (c < f) {
        t = dp[idx(a, b, c, p, d, e, c)];
      } else {
        t = 0;
        t = Math.max(t, cal_prob1(a, b, c, p, d, e, f));
        t = Math.max(t, cal_prob2(a, b, c, p, d, e, f));
        t = Math.max(t, cal_prob3(a, b, c, p, d, e, f));
      }
      dp[idx(a, b, c, p, d, e, f)] = t;
    }}}}}}}
    let et = performance.now();
    document.getElementById("info").innerHTML = "확률 계산 완료! (" + ((et - st) / 1000).toFixed(3) + "초)";
  }

  function cal_p_from_seq() {
    let p = PMAX - 1;
    for (const attempt of seq) {
      if (attempt[1] == 0) {
        p = Math.min(p + 1, PMAX - 1);
      } else {
        p = Math.max(p - 1, 0);
      }
    }
    return p;
  }

  function build_sym_from_seq(num_attempts, idx) {
    let sym = "", cnt = 0;
    for (const attempt of seq) {
      if (attempt[0] == idx) {
        sym += attempt[1] == 0 ? "<font color=\"lightgray\">◆</font>" : "◆";
        ++cnt;
      }
    }
    sym += "◇".repeat(num_attempts - cnt);
    return sym;
  }

  function cal_idx_from_seq(num_attempts, goal, idx) {
    let a = num_attempts, d = goal, success = 0;
    for (const attempt of seq) {
      if (attempt[0] == idx) {
        --a;
        if (attempt[1] == 1) {
          --d;
          ++success;
        }
      }
    }
    return [a, d, success];
  }

  function toPercent(x) {
    x *= 100;
    return x == 0 ? "0%" : x.toFixed(Math.max(2 - Math.floor(Math.log(x) / Math.log(10)), 0)) + "%";
  }

  function do_attempt(idx, result) {
    let num_attempts = na, cnt = 0;
    for (const attempt of seq) {
      if (attempt[0] == idx) {
        ++cnt;
      }
    }
    if (cnt < num_attempts) {
      seq.push([idx, result]);
    }
    set_ui();
  }

  function undo() {
    seq.pop();
    set_ui();
  }

  function set_goal_cells_from_goal() {
    let num_attempts = na;
    goal_cells = [];
    for (let i = 0; i <= num_attempts; ++i) {
      let t = [];
      for (let j = 0; j <= num_attempts; ++j) {
        t.push(i >= goal1 && j >= goal2 && i + j >= goals? 1 : 0);
      }
      goal_cells.push(t);
    }
  }

  function init() {
    na = parseInt(document.getElementById("num_attempts").value, 10);
    seq = [];
    preset(1);
  }

  function reset() {
    seq = [];
    set_ui();
  }

  function change_goal(idx, val) {
    if (idx == 1) goal1 = val;
    if (idx == 2) goal2 = val;
    if (idx == 3) goal3 = val;
    if (idx == 4) goals = val;
    set_goal_cells_from_goal();
    cal_dp();
    set_ui();
  }

  function set_ui() {
    let p = cal_p_from_seq();
    document.getElementById("cur_prob").innerHTML = toPercent(decode_p(p));

    document.getElementById("ability1_sym").innerHTML = build_sym_from_seq(na, 1);
    document.getElementById("ability2_sym").innerHTML = build_sym_from_seq(na, 2);
    document.getElementById("ability3_sym").innerHTML = build_sym_from_seq(na, 3);

    let idx1 = cal_idx_from_seq(na, goal1, 1);
    let idx2 = cal_idx_from_seq(na, goal2, 2);
    let idx3 = cal_idx_from_seq(na, goal3, 3);
    let prob1 = cal_prob1_safe(idx1[0], idx2[0], idx3[0], p, idx1[2], idx2[2], idx3[1]);
    let prob2 = cal_prob2_safe(idx1[0], idx2[0], idx3[0], p, idx1[2], idx2[2], idx3[1]);
    let prob3 = cal_prob3_safe(idx1[0], idx2[0], idx3[0], p, idx1[2], idx2[2], idx3[1]);
    document.getElementById("ability1_prob").innerHTML = toPercent(prob1);
    document.getElementById("ability2_prob").innerHTML = toPercent(prob2);
    document.getElementById("ability3_prob").innerHTML = toPercent(prob3);

    let max_prob = Math.max(prob1, prob2, prob3);
    document.getElementById("ability1_text").innerHTML = prob1 == max_prob && prob1 != 0 ? "추천!" : "";
    document.getElementById("ability2_text").innerHTML = prob2 == max_prob && prob2 != 0 ? "추천!" : "";
    document.getElementById("ability3_text").innerHTML = prob3 == max_prob && prob3 != 0 ? "추천!" : "";

    document.getElementById("goal").innerHTML = `${goal1}/${goal2}/${goal3}/합${goals}`

    const grid = document.getElementById("grid");
    grid.innerHTML = "";
    for (let i = -1; i <= na; ++i) {
      const tr = document.createElement("tr");
      for (let j = -1; j <= na; ++j) {
        const td = document.createElement("td");
        if (i >= 0 && j >= 0) {
          if (i == idx1[2] && j == idx2[2]) {
            td.innerHTML = "★";
          }
          td.setAttribute("id", `cell-${i}-${j}`);
          td.setAttribute("onclick", `toggle_cell(${i}, ${j});`);
          td.setAttribute("class", goal_cells[i][j] ? "color" : "nocolor");
        } else if (i >= 0) {
          td.innerHTML = `${i == 0 ? "A" : i}`;
          td.setAttribute("class", "nocolor");
        } else if (j >= 0) {
          td.innerHTML = `${j == 0 ? "B" : j}`;
          td.setAttribute("class", "nocolor");
        } else {
          td.innerHTML = "증";
          td.setAttribute("class", "nocolor");
        }
        tr.appendChild(td);
      }
      grid.appendChild(tr);
    }
  }

  function toggle_cell(i, j) {
    goal_cells[i][j] ^= 1;
    cal_dp();
    set_ui();
  }

  function preset(id) {
    if (id == 0) {
      goal1 = 0;
      goal2 = 0;
      goal3 = 4;
      goals = 16;
      set_goal_cells_from_goal();
      if (na >= 8) {
        goal_cells[8][8] = 0;
      }
    } else if (id == 1) {
      goal1 = 0;
      goal2 = 0;
      goal3 = 4;
      goals = 14;
      set_goal_cells_from_goal();
      if (na >= 8) {
        goal_cells[8][6] = 0;
        goal_cells[6][8] = 0;
      }
    }
    cal_dp();
    set_ui();
  }

  /*
   * Initial scripts
   */

  init();

</script>

## 사용법

* 어빌리티 스톤 등급에 맞춰 칸수를 설정합니다.
* 아래에서 목표를 설정합니다. a/b/c는 증가능력1 a이상 / 증가능력2 b이상 / 감소능력1 c이하의 돌을 깎는 것을 목표로 함을 의미합니다.
* 증가능력1 오른쪽의 확률은 **지금 증가능력1 버튼을 눌렀을 때 목표를 달성할 확률** 을 의미합니다. (증가능력2, 감소능력1도 마찬가지.) 목표 달성 확률이 높은 능력에 **추천!** 메시지가 표시됩니다. 돌파고를 믿는다면 추천되는 능력을 로스트아크에서 1회 세공하시면 됩니다.
* 로스트아크에서 1회 세공 후 성공/실패 여부를 확인하고 해당 버튼을 눌러줍니다. 새롭게 계산된 확률이 표시됩니다.
* **취소** 버튼은 실수한 경우 최근 1회 세공을 되돌리는 버튼입니다. (Ctrl + Z)
* 버그 제보 및 기능 제안은 csehydrogen@gmail.com

## 참고

MYAR님의 [시뮬레이터](https://myar.tistory.com/26)와 jaentrouble님의 [LoFAGO](https://github.com/jaentrouble/LoFAGO)의 UI를 참고했습니다. 로직은 직접 새로 작성했습니다.

## 관련 링크

* [https://www.inven.co.kr/board/lostark/4821/77491](https://www.inven.co.kr/board/lostark/4821/77491)
* [https://www.inven.co.kr/board/lostark/4821/77432](https://www.inven.co.kr/board/lostark/4821/77432)

## 패치노트

* (21.08.09) 세부 목표 조정 기능 추가.
* (21.05.27) SEO 적용. 확률 유효숫자 3자리까지 표시. 초기값을 10칸에 774로 조정. Disqus 광고 때문에 제거. Favicon 추가. 관련 링크 추가.
* (21.05.09) 최초 공개.