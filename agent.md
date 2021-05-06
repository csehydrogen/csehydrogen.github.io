---
layout: page
title: 전문연
---

<h2 id="demo"></h2>

<script>
var countDownDate = new Date("Feb 28, 2023 23:59:59").getTime();
f = function() {
  var now = new Date().getTime();
  var distance = countDownDate - now;
  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);
  document.getElementById("demo").innerHTML = "D-" + days + "일 " + hours + "시간 "
  + minutes + "분 " + seconds + "초";
  if (distance < 0) {
    clearInterval(x);
    document.getElementById("demo").innerHTML = "전문연 끝!";
  }
};
f();
var x = setInterval(f, 1000);
</script>