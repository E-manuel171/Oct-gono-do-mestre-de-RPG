// Radar de Atributos - Mestre de RPG Interactive Engine

document.addEventListener('DOMContentLoaded', () => {
  const sliders = document.querySelectorAll('.slider');
  const valueInputs = document.querySelectorAll('.val-num');
  const webPolygon = document.getElementById('web-polygon');
  const nodesGroup = document.getElementById('nodes-group');
  const btnExportJpg = document.getElementById('btn-export-jpg');
  // Radar attribute logic and export helpers
  const paramColors = [
    '#FF0055', // Gerência de Ritmo
    '#FF9900', // Improvisação
    '#FFEE00', // Narração
    '#00FF66', // Descrição
    '#00E5FF', // Atuação
    '#3377FF', // Recursos Externos
    '#B033FF', // Dedicação e Preparação
    '#FF00CC'  // Construção de Mundo e NPCs
  ];
  // 8 Direction vectors (SVG coordinates: Y points down)
  const directions = [
    [0, -1],
    [Math.SQRT1_2, -Math.SQRT1_2],
    [1, 0],
    [Math.SQRT1_2, Math.SQRT1_2],
    [0, 1],
    [-Math.SQRT1_2, Math.SQRT1_2],
    [-1, 0],
    [-Math.SQRT1_2, -Math.SQRT1_2]
  ];
  // Calculate JoJo Stand Rank (E to A)
  function getRank(val) {
    if (val <= 0.875) return { rank: 'E', class: 'rank-e' };
    if (val <= 1.875) return { rank: 'D', class: 'rank-d' };
    if (val <= 3.125) return { rank: 'C', class: 'rank-c' };
    if (val <= 4.375) return { rank: 'B', class: 'rank-b' };
    return { rank: 'A', class: 'rank-a' };
  }

  // Update Octagon points & web polygon
  function updateOctagon() {
    nodesGroup.innerHTML = '';
    const pointsArray = [];

    sliders.forEach((slider, idx) => {
      const val = parseFloat(slider.value);
      const normalized = val / 5; // Scale 0 to 1
      const [dx, dy] = directions[idx];
      const cx = dx * normalized;
      const cy = dy * normalized;

      pointsArray.push(`${cx.toFixed(3)},${cy.toFixed(3)}`);

      // Draw glowing node point at vertex position
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', cx);
      circle.setAttribute('cy', cy);
      circle.setAttribute('r', '0.035');
      circle.setAttribute('fill', paramColors[idx]);
      circle.setAttribute('stroke', '#FFFFFF');
      circle.setAttribute('stroke-width', '0.008');
      circle.style.filter = `drop-shadow(0 0 6px ${paramColors[idx]})`;
      circle.classList.add('node-circle');
      nodesGroup.appendChild(circle);

      // Update value text display
      const valDisplay = document.getElementById(`val-${idx}`);
      if (valDisplay) valDisplay.value = val.toFixed(1);

      // Update JoJo Rank badge
      const rankBadge = document.getElementById(`rank-${idx}`);
      if (rankBadge) {
        const { rank, class: rankClass } = getRank(val);
        rankBadge.textContent = rank;
        rankBadge.className = `rank-badge ${rankClass}`;
      }
    });

    // Set points attribute on SVG web polygon
    webPolygon.setAttribute('points', pointsArray.join(' '));
  }

  // Bind slider events
  sliders.forEach(slider => {
    slider.addEventListener('input', updateOctagon);
  });

  valueInputs.forEach((input, idx) => {
    input.addEventListener('input', () => {
      if (input.value === '' || !Number.isFinite(input.valueAsNumber)) return;
      const slider = sliders[idx];
      slider.value = Math.min(Number(slider.max), Math.max(Number(slider.min), input.valueAsNumber));
      updateOctagon();
    });

    input.addEventListener('blur', () => {
      input.value = parseFloat(sliders[idx].value).toFixed(1);
    });
  });

  // Initial render
  updateOctagon();

  // ---------- JPG Export Logic via Canvas nativo + Data URL base64 ----------
  if (btnExportJpg) {
    btnExportJpg.addEventListener('click', () => {

      // 1. Pedir nome do Mestre apenas na hora de exportar
      const masterNameInput = prompt('Digite o nome do Mestre para a imagem JPG:', 'MESTRE DE RPG');
      if (masterNameInput === null) return;
      const masterName = masterNameInput.trim() || 'MESTRE DE RPG';
      const cleanFileName = `Radar_Mestre_${masterName.replace(/[^a-zA-Z0-9_-]/g, '_')}.jpg`;
  // Radar attribute logic and export helpers
      const CANVAS_W = 1200;
      const CANVAS_H = 1100;
      const SVG_DRAW_W = 920;
      const SVG_DRAW_H = 840;

      // 3. Ler valores atuais dos sliders
      const sliderVals = Array.from(sliders).map(s => parseFloat(s.value));
      const webPoints = sliderVals.map((val, idx) => {
        const norm = val / 5;
        const [dx, dy] = directions[idx];
        return `${(dx * norm).toFixed(4)},${(dy * norm).toFixed(4)}`;
      }).join(' ');
  // Radar attribute logic and export helpers
      const paramLabels = [
        '1. GERENCIA DE RITMO', '2. IMPROVISACAO', '3. NARRACAO', '4. DESCRICAO',
        '5. ATUACAO', '6. RECURSOS EXTERNOS', '7. DEDICACAO E PREPARACAO',
        '8. CONSTRUCAO DE MUNDO E NPCS'
      ];
      const labelPositions = [
        { x: 0,     y: -1.14, anchor: 'middle' },
        { x: 0.82,  y: -0.78, anchor: 'start' },
        { x: 1.08,  y: 0.04,  anchor: 'start' },
        { x: 0.82,  y: 0.84,  anchor: 'start' },
        { x: 0,     y: 1.20,  anchor: 'middle' },
        { x: -0.82, y: 0.84,  anchor: 'end' },
        { x: -1.08, y: 0.04,  anchor: 'end' },
        { x: -0.82, y: -0.78, anchor: 'end' }
      ];
  // Radar attribute logic and export helpers
      const nodeCirclesSvg = sliderVals.map((val, idx) => {
        const norm = val / 5;
        const [dx, dy] = directions[idx];
        return `<circle cx="${(dx * norm).toFixed(4)}" cy="${(dy * norm).toFixed(4)}" r="0.04" fill="${paramColors[idx]}" stroke="#FFF" stroke-width="0.01"/>`;
      }).join('');

      // Gerar text labels inline
      const svgLabelsSvg = paramLabels.map((label, idx) => {
        const pos = labelPositions[idx];
        return `<text x="${pos.x}" y="${pos.y}" text-anchor="${pos.anchor}" dominant-baseline="middle" fill="${paramColors[idx]}" font-family="Georgia,serif" font-size="0.09" font-weight="bold">${label}</text>`;
      }).join('');
  // Radar attribute logic and export helpers
      const svgMarkup = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="880" viewBox="-2.2 -1.6 4.4 3.2">',
        '<rect x="-2.2" y="-1.6" width="4.4" height="3.2" fill="#0a0814"/>',
        // Grade
        '<polygon points="0,-0.25 0.177,-0.177 0.25,0 0.177,0.177 0,0.25 -0.177,0.177 -0.25,0 -0.177,-0.177" fill="none" stroke="rgba(212,175,55,0.2)" stroke-width="0.007" stroke-dasharray="0.02 0.01"/>',
        '<polygon points="0,-0.50 0.354,-0.354 0.50,0 0.354,0.354 0,0.50 -0.354,0.354 -0.50,0 -0.354,-0.354" fill="none" stroke="rgba(212,175,55,0.2)" stroke-width="0.007" stroke-dasharray="0.02 0.01"/>',
        '<polygon points="0,-0.75 0.530,-0.530 0.75,0 0.530,0.530 0,0.75 -0.530,0.530 -0.75,0 -0.530,-0.530" fill="none" stroke="rgba(212,175,55,0.2)" stroke-width="0.007" stroke-dasharray="0.02 0.01"/>',
        '<polygon points="0,-1.00 0.707,-0.707 1.00,0 0.707,0.707 0,1.00 -0.707,0.707 -1.00,0 -0.707,-0.707" fill="none" stroke="rgba(212,175,55,0.75)" stroke-width="0.014"/>',
        // Eixos
        `<line x1="0" y1="0" x2="0" y2="-1" stroke="${paramColors[0]}" stroke-width="0.009" opacity="0.6"/>`,
        `<line x1="0" y1="0" x2="0.707" y2="-0.707" stroke="${paramColors[1]}" stroke-width="0.009" opacity="0.6"/>`,
        `<line x1="0" y1="0" x2="1" y2="0" stroke="${paramColors[2]}" stroke-width="0.009" opacity="0.6"/>`,
        `<line x1="0" y1="0" x2="0.707" y2="0.707" stroke="${paramColors[3]}" stroke-width="0.009" opacity="0.6"/>`,
        `<line x1="0" y1="0" x2="0" y2="1" stroke="${paramColors[4]}" stroke-width="0.009" opacity="0.6"/>`,
        `<line x1="0" y1="0" x2="-0.707" y2="0.707" stroke="${paramColors[5]}" stroke-width="0.009" opacity="0.6"/>`,
        `<line x1="0" y1="0" x2="-1" y2="0" stroke="${paramColors[6]}" stroke-width="0.009" opacity="0.6"/>`,
        `<line x1="0" y1="0" x2="-0.707" y2="-0.707" stroke="${paramColors[7]}" stroke-width="0.009" opacity="0.6"/>`,
        // Teia
        `<polygon points="${webPoints}" fill="rgba(0,229,255,0.22)" stroke="#00E5FF" stroke-width="0.022" stroke-linejoin="round"/>`,
        // Centro
        '<circle cx="0" cy="0" r="0.05" fill="#FFF" stroke="#d4af37" stroke-width="0.016"/>',
  // Radar attribute logic and export helpers
        nodeCirclesSvg,
        // Labels
        svgLabelsSvg,
        '</svg>'
      ].join('');
  // Radar attribute logic and export helpers
      const canvas = document.createElement('canvas');
      canvas.width = CANVAS_W;
      canvas.height = CANVAS_H;
      const ctx = canvas.getContext('2d');

      // Fundo
      ctx.fillStyle = '#0a0814';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Badge
      ctx.textAlign = 'center';
      ctx.fillStyle = '#d4af37';
      ctx.font = 'bold 14px Georgia, serif';
      ctx.fillText('PARAMETROS DE MESTRE', CANVAS_W / 2, 40);

      // Borda do badge
      const bW = 300, bH = 30, bX = CANVAS_W / 2 - bW / 2, bY = 22;
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bX, bY, bW, bH, 14);
      ctx.stroke();

      // Nome do mestre
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 32px Georgia, serif';
      ctx.fillText('MESTRE: ' + masterName.toUpperCase(), CANVAS_W / 2, 100);
  // Radar attribute logic and export helpers
      ctx.fillStyle = 'rgba(240,240,248,0.7)';
      ctx.font = 'bold 15px Georgia, serif';
      ctx.fillText('- RADAR DE ATRIBUTOS -', CANVAS_W / 2, 130);

      // 5. Converter SVG para Data URL base64 (evita taint do canvas)
      const svgBase64 = btoa(unescape(encodeURIComponent(svgMarkup)));
      const dataUrl = 'data:image/svg+xml;base64,' + svgBase64;

      const img = new Image();
      img.onload = () => {
        const svgX = (CANVAS_W - SVG_DRAW_W) / 2;
        const svgY = 150;
        ctx.drawImage(img, svgX, svgY, SVG_DRAW_W, SVG_DRAW_H);
  // Radar attribute logic and export helpers
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(240,240,248,0.85)';
        ctx.font = 'bold 15px Georgia, serif';
        ctx.fillText('@Nuel.mov', CANVAS_W / 2, svgY + SVG_DRAW_H + 35);

        // 6. Baixar JPG
        const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        const link = document.createElement('a');
        link.download = cleanFileName;
        link.href = jpgDataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      img.onerror = () => {
        alert('Erro ao gerar a imagem. Tente novamente.');
      };

      img.src = dataUrl;
    });
  }

});
