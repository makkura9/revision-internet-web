/* Requête Express — effets visuels : fond « réseau », étincelles, confettis */
(function () {
  'use strict';
  var RX = (window.RX = window.RX || {});
  var fx = (RX.fx = {});

  var COLORS = ['#FF5A36', '#FFD23F', '#2ED3A6', '#6C9BFF', '#B197FF', '#FF85B0', '#45D4F5'];

  /* ---------- Fond animé : des nœuds reliés, parcourus par des paquets ---------- */
  fx.background = function (canvas) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var w = 0, h = 0, dpr = 1, nodes = [], packets = [], raf = 0, last = 0, spawn = 0;
    var LINK = 150;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.max(16, Math.min(46, Math.round((w * h) / 26000)));
      nodes = [];
      for (var i = 0; i < n; i++) {
        nodes.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.16, vy: (Math.random() - 0.5) * 0.16,
          r: 1.4 + Math.random() * 1.8
        });
      }
      packets = [];
      draw(0);
    }

    function draw(dt) {
      ctx.clearRect(0, 0, w, h);
      var i, j, a, b, dx, dy, d;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        a.x += a.vx * dt; a.y += a.vy * dt;
        if (a.x < -20) a.x = w + 20; else if (a.x > w + 20) a.x = -20;
        if (a.y < -20) a.y = h + 20; else if (a.y > h + 20) a.y = -20;
      }
      ctx.lineWidth = 1;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j]; dx = a.x - b.x; dy = a.y - b.y; d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            ctx.strokeStyle = 'rgba(160,170,255,' + (0.16 * (1 - d / LINK)).toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      ctx.fillStyle = 'rgba(190,196,255,0.42)';
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
      }
      for (i = packets.length - 1; i >= 0; i--) {
        var p = packets[i];
        p.t += dt / p.dur;
        if (p.t >= 1) { packets.splice(i, 1); continue; }
        var x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t;
        ctx.globalAlpha = Math.sin(p.t * Math.PI);
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 6.283); ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    function spawnPacket() {
      for (var tries = 0; tries < 12; tries++) {
        var a = RX.pick(nodes), b = RX.pick(nodes);
        if (a === b) continue;
        var dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK && d > 40) { packets.push({ a: a, b: b, t: 0, dur: 700 + d * 6, c: RX.pick(COLORS) }); return; }
      }
    }

    function tick(now) {
      var dt = Math.min(now - last, 50); last = now;
      spawn += dt;
      if (spawn > 520) { spawn = 0; spawnPacket(); }
      draw(dt);
      raf = requestAnimationFrame(tick);
    }

    function start() { if (!raf && !RX.reduced) { last = performance.now(); raf = requestAnimationFrame(tick); } }
    function stop() { cancelAnimationFrame(raf); raf = 0; }

    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 150); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    resize();
    start();
  };

  /* ---------- Étincelles autour d'une bonne réponse ---------- */
  fx.burst = function (el, n) {
    if (RX.reduced || !el) return;
    var r = el.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var layer = RX.h('<div class="burst" aria-hidden="true"></div>');
    layer.style.left = cx + 'px'; layer.style.top = cy + 'px';
    n = n || 10;
    for (var i = 0; i < n; i++) {
      var ang = (i / n) * 6.283 + Math.random() * 0.5;
      var dist = Math.max(r.width, r.height) * 0.35 + 26 + Math.random() * 34;
      var s = document.createElement('i');
      s.style.setProperty('--dx', (Math.cos(ang) * dist).toFixed(1) + 'px');
      s.style.setProperty('--dy', (Math.sin(ang) * dist * 0.7).toFixed(1) + 'px');
      s.style.background = COLORS[i % COLORS.length];
      if (i % 3 === 0) s.style.borderRadius = '2px';
      layer.appendChild(s);
    }
    document.body.appendChild(layer);
    setTimeout(function () { layer.remove(); }, 800);
  };

  /* ---------- Confettis (mission parfaite, bilan complet) ---------- */
  fx.confetti = function (amount) {
    if (RX.reduced) return;
    var c = document.createElement('canvas');
    c.className = 'confetti';
    c.setAttribute('aria-hidden', 'true');
    document.body.appendChild(c);
    var ctx = c.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth, h = window.innerHeight;
    c.width = w * dpr; c.height = h * dpr;
    ctx.scale(dpr, dpr);
    var parts = [], n = amount || 110;
    for (var i = 0; i < n; i++) {
      var side = i % 2 ? 1 : -1;
      parts.push({
        x: w / 2 + side * (w * 0.5 + 10), y: h * 0.72,
        vx: -side * (4 + Math.random() * (w / 90 + 6)), vy: -(9 + Math.random() * 12),
        s: 5 + Math.random() * 6, rot: Math.random() * 6.283, vr: (Math.random() - 0.5) * 0.4,
        c: COLORS[i % COLORS.length], life: 0
      });
    }
    var last = performance.now();
    (function frame(now) {
      var dt = Math.min((now - last) / 16.7, 3); last = now;
      ctx.clearRect(0, 0, w, h);
      var alive = false;
      for (var k = 0; k < parts.length; k++) {
        var p = parts[k];
        p.life += dt;
        p.vy += 0.34 * dt; p.vx *= Math.pow(0.985, dt);
        p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        if (p.y < h + 30) alive = true;
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, 1 - p.life / 190);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.66);
        ctx.restore();
      }
      if (alive && parts[0].life < 200) requestAnimationFrame(frame); else c.remove();
    })(last);
  };
})();
