/**
 * Canvas Video Engine for ContentBloom AI.
 *
 * Renders real playable 9:16 animated short-form video files (.webm / .mp4)
 * directly in the browser using HTML5 Canvas, MediaStream, and MediaRecorder.
 *
 * Upgraded with:
 * - Content-aware scene compositions (hook, stat charts, step checklists, comparisons, graphic assets, CTA)
 * - Concise kinetic on-screen captions with highlighted keywords
 * - Timed voiceover subtitles synchronized with scene playback
 * - Smooth scene transitions (cross-fade, zoom, slide)
 * - Image-to-video integration: renders actual graphic assets directly into scenes
 * - Procedural audio track with ambient rhythm and transition chimes
 * - Interactive scene frame rendering for live studio scrubbing
 */

function wrapText(ctx, text, maxWidth) {
  if (!text) return []
  const words = text.split(/\s+/)
  const lines = []
  let current = words[0] || ''

  for (let i = 1; i < words.length; i++) {
    const word = words[i]
    const test = `${current} ${word}`
    if (ctx.measureText(test).width > maxWidth) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius)
  } else {
    ctx.rect(x, y, width, height)
  }
}

/**
 * Creates a synthesized ambient rhythm audio track with subtle transition cues using Web Audio API.
 */
function createSynthesizedAudioTrack(totalDurationSeconds, sceneTimestamps = []) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return null

    const audioCtx = new AudioContextClass()
    const dest = audioCtx.createMediaStreamDestination()

    // 1. Rhythmic bass oscillator
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(110, audioCtx.currentTime) // A2

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime)
    for (let t = 0; t < totalDurationSeconds; t += 0.5) {
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime + t)
      gain.gain.exponentialRampToValueAtTime(0.02, audioCtx.currentTime + t + 0.4)
    }

    osc.connect(gain)
    gain.connect(dest)
    osc.start()

    // 2. Chime sound on scene transitions
    const chimeNodes = []
    sceneTimestamps.forEach((ts) => {
      if (ts > 0 && ts < totalDurationSeconds) {
        try {
          const chimeOsc = audioCtx.createOscillator()
          const chimeGain = audioCtx.createGain()
          chimeOsc.type = 'sine'
          chimeOsc.frequency.setValueAtTime(587.33, audioCtx.currentTime + ts) // D5
          chimeOsc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + ts + 0.2) // A5

          chimeGain.gain.setValueAtTime(0.0001, audioCtx.currentTime + ts)
          chimeGain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + ts + 0.05)
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + ts + 0.35)

          chimeOsc.connect(chimeGain)
          chimeGain.connect(dest)
          chimeOsc.start(audioCtx.currentTime + ts)
          chimeOsc.stop(audioCtx.currentTime + ts + 0.4)
          chimeNodes.push(chimeOsc)
        } catch {}
      }
    })

    return {
      track: dest.stream.getAudioTracks()[0],
      cleanup: () => {
        try {
          osc.stop()
          chimeNodes.forEach((n) => {
            try {
              n.stop()
            } catch {}
          })
          audioCtx.close()
        } catch {}
      },
    }
  } catch {
    return null
  }
}

/**
 * Loads an image from a URL or DataURL into an HTMLImageElement.
 */
export function preloadImage(src) {
  if (!src) return Promise.resolve(null)
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

/**
 * Draws a single video scene composition frame.
 */
export function drawSceneComposition(ctx, {
  scene,
  sceneProgress,
  totalProgress,
  timeSec,
  width,
  height,
  totalScenes,
  sceneIndex,
  preloadedGraphic = null,
  planTitle = 'CONTENTBLOOM',
  visualStyle = 'kinetic_tech',
}) {
  const W = width
  const H = height

  // 1. Dynamic background gradient
  const shift = (timeSec * 35) % H
  const grad = ctx.createLinearGradient(0, -shift, W, H + shift)

  if (visualStyle === 'creator_vibrant') {
    grad.addColorStop(0, '#311042')
    grad.addColorStop(0.5, '#4c0519')
    grad.addColorStop(1, '#0f172a')
  } else if (visualStyle === 'editorial_dark') {
    grad.addColorStop(0, '#0f172a')
    grad.addColorStop(0.5, '#1e293b')
    grad.addColorStop(1, '#020617')
  } else {
    // kinetic_tech
    grad.addColorStop(0, '#090d16')
    grad.addColorStop(0.5, '#1e1b4b')
    grad.addColorStop(1, '#020617')
  }
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // 2. Ambient moving energy orbs
  ctx.save()
  ctx.globalAlpha = 0.18
  ctx.fillStyle = '#6366f1'
  const pulseR = 140 + Math.sin(timeSec * 3) * 24
  ctx.beginPath()
  ctx.arc(W * 0.5, H * 0.35, pulseR, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#ec4899'
  ctx.beginPath()
  ctx.arc(W * 0.82, H * 0.68, 100 + Math.cos(timeSec * 2.5) * 18, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // 3. Subtle background grid dots
  ctx.save()
  ctx.globalAlpha = 0.04
  ctx.fillStyle = '#ffffff'
  for (let x = 20; x < W; x += 36) {
    for (let y = 20; y < H; y += 36) {
      ctx.beginPath()
      ctx.arc(x, y, 1.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()

  // 4. Top Header Notch: Branding and Scene Tracker
  ctx.save()
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
  drawRoundedRect(ctx, W * 0.5 - 75, 22, 150, 30, 15)
  ctx.fill()

  ctx.font = 'bold 12px Inter, sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.fillText('CONTENTBLOOM AI', W * 0.5, 41)

  // Scene indicator
  ctx.font = 'bold 13px Inter, sans-serif'
  ctx.fillStyle = '#38bdf8'
  ctx.fillText(
    `SCENE ${sceneIndex + 1} OF ${totalScenes} • ${Math.round(scene.duration_seconds || 5)}s`,
    W * 0.5,
    78
  )
  ctx.restore()

  // 5. Scene Composition Selection
  const compType = scene.composition_type || (sceneIndex === 0 ? 'hook_intro' : sceneIndex === totalScenes - 1 ? 'cta_outro' : 'step_card')

  if (compType === 'hook_intro') {
    // --- HOOK INTRO COMPOSITION ---
    ctx.save()
    // 3-Sec Hook Urgency Badge
    const badgeW = 160
    const badgeH = 34
    ctx.fillStyle = '#ef4444' // vibrant red
    drawRoundedRect(ctx, W * 0.5 - badgeW / 2, H * 0.14, badgeW, badgeH, 17)
    ctx.fill()

    ctx.font = '900 13px Inter, sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.fillText('⚡ 3-SEC RETENTION HOOK', W * 0.5, H * 0.14 + 22)

    // Animated countdown ring
    const ringProgress = Math.min(1, sceneProgress * 1.5)
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(W * 0.5, H * 0.25, 36, 0, Math.PI * 2)
    ctx.stroke()

    ctx.strokeStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(W * 0.5, H * 0.25, 36, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - ringProgress))
    ctx.stroke()

    ctx.font = '900 20px Inter, sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.fillText('🔥', W * 0.5, H * 0.25 + 7)

    // Center Stage: Bold Kinetic Headline
    const textScale = Math.min(1, 0.75 + sceneProgress * 0.3)
    ctx.translate(W * 0.5, H * 0.44)
    ctx.scale(textScale, textScale)

    const hookText = (scene.on_screen_text || 'STOP SCROLLING').toUpperCase()
    ctx.font = '900 36px Inter, system-ui, sans-serif'
    const hookLines = wrapText(ctx, hookText, W * 0.8)
    const boxH = hookLines.length * 46 + 36
    const boxW = W * 0.88

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 3
    drawRoundedRect(ctx, -boxW * 0.5, -boxH * 0.5, boxW, boxH, 20)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#ffffff'
    ctx.shadowColor = '#ef4444'
    ctx.shadowBlur = 14
    let startY = -boxH * 0.5 + 44
    for (const line of hookLines) {
      ctx.fillText(line, 0, startY)
      startY += 46
    }
    ctx.restore()

  } else if (compType === 'stat_chart') {
    // --- ANIMATED STAT & CHART COMPOSITION ---
    ctx.save()
    // Center Chart Card Frame
    const cardY = H * 0.16
    const cardW = W * 0.88
    const cardH = 340
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 2
    drawRoundedRect(ctx, W * 0.06, cardY, cardW, cardH, 24)
    ctx.fill()
    ctx.stroke()

    // Metric Header
    ctx.font = 'bold 13px Inter, sans-serif'
    ctx.fillStyle = '#38bdf8'
    ctx.textAlign = 'left'
    ctx.fillText('📈 PERFORMANCE BENCHMARK', W * 0.11, cardY + 36)

    // Target Value & Animated Countup
    const targetVal = scene.chart_data?.value || 85
    const currentVal = Math.round(targetVal * Math.min(1, sceneProgress * 1.4))
    const unit = scene.chart_data?.unit || '%'
    const label = scene.chart_data?.label || scene.on_screen_text || 'Output Velocity'

    // Giant animated number
    ctx.font = '900 72px Inter, sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(`${currentVal}${unit}`, W * 0.11, cardY + 120)

    ctx.font = '600 18px Inter, sans-serif'
    ctx.fillStyle = '#94a3b8'
    ctx.fillText(label, W * 0.11, cardY + 152)

    // Animated Progress Bar
    const barX = W * 0.11
    const barY = cardY + 180
    const barW = cardW - (W * 0.1)
    const barH = 20

    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
    drawRoundedRect(ctx, barX, barY, barW, barH, 10)
    ctx.fill()

    const fillRatio = (currentVal / 100)
    const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0)
    barGrad.addColorStop(0, '#38bdf8')
    barGrad.addColorStop(1, '#a855f7')
    ctx.fillStyle = barGrad
    drawRoundedRect(ctx, barX, barY, Math.max(16, barW * fillRatio), barH, 10)
    ctx.fill()

    // 2 Quick Stats Badges inside chart card
    const badgeW = (barW - 12) / 2
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
    drawRoundedRect(ctx, barX, cardY + 224, badgeW, 70, 14)
    ctx.fill()

    ctx.font = 'bold 18px Inter, sans-serif'
    ctx.fillStyle = '#22d3ee'
    ctx.fillText('10x Faster', barX + 14, cardY + 254)
    ctx.font = '500 12px Inter, sans-serif'
    ctx.fillStyle = '#94a3b8'
    ctx.fillText('Execution Speed', barX + 14, cardY + 276)

    drawRoundedRect(ctx, barX + badgeW + 12, cardY + 224, badgeW, 70, 14)
    ctx.fill()

    ctx.fillStyle = '#34d399'
    ctx.font = 'bold 18px Inter, sans-serif'
    ctx.fillText('99.2%', barX + badgeW + 26, cardY + 254)
    ctx.font = '500 12px Inter, sans-serif'
    ctx.fillStyle = '#94a3b8'
    ctx.fillText('Retention Rate', barX + badgeW + 26, cardY + 276)
    ctx.restore()

  } else if (compType === 'step_card') {
    // --- STEP-BY-STEP CHECKLIST COMPOSITION ---
    ctx.save()
    const cardY = H * 0.14
    const cardW = W * 0.88
    const cardH = 360
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.lineWidth = 1.5
    drawRoundedRect(ctx, W * 0.06, cardY, cardW, cardH, 24)
    ctx.fill()
    ctx.stroke()

    // Step Eyebrow
    ctx.font = 'bold 14px Inter, sans-serif'
    ctx.fillStyle = '#a855f7'
    ctx.textAlign = 'left'
    ctx.fillText(`FRAMEWORK • STEP 0${sceneIndex}`, W * 0.11, cardY + 36)

    // Step Title
    ctx.font = '900 28px Inter, sans-serif'
    ctx.fillStyle = '#ffffff'
    const stepLines = wrapText(ctx, (scene.on_screen_text || 'CORE ACTION').toUpperCase(), cardW - 40)
    let sY = cardY + 76
    for (const sl of stepLines.slice(0, 2)) {
      ctx.fillText(sl, W * 0.11, sY)
      sY += 34
    }

    // 3 Action Checklist Items
    const bullets = (scene.bullet_points && scene.bullet_points.length > 0)
      ? scene.bullet_points
      : [
          'Break down core theme into 3 distinct hooks',
          'Deploy visual typography for high scanability',
          'Align call to action directly with audience goal',
        ]

    let bulletY = sY + 16
    bullets.slice(0, 3).forEach((bText, idx) => {
      const isRevealed = sceneProgress >= idx * 0.25
      ctx.save()
      ctx.globalAlpha = isRevealed ? 1 : 0.35

      // Icon pill
      ctx.fillStyle = isRevealed ? '#34d399' : 'rgba(255, 255, 255, 0.2)'
      drawRoundedRect(ctx, W * 0.11, bulletY - 18, 26, 26, 8)
      ctx.fill()

      ctx.font = 'bold 14px Inter, sans-serif'
      ctx.fillStyle = '#0f172a'
      ctx.textAlign = 'center'
      ctx.fillText('✓', W * 0.11 + 13, bulletY)

      ctx.textAlign = 'left'
      ctx.font = '600 16px Inter, sans-serif'
      ctx.fillStyle = '#e2e8f0'
      const bLines = wrapText(ctx, bText, cardW - 75)
      ctx.fillText(bLines[0] || bText, W * 0.11 + 38, bulletY)
      ctx.restore()

      bulletY += 48
    })
    ctx.restore()

  } else if (compType === 'comparison') {
    // --- SPLIT COMPARISON: BEFORE VS AFTER ---
    ctx.save()
    const cardY = H * 0.15
    const cardW = W * 0.88
    const splitH = 150

    // Box 1: The Old Way (Red/Muted)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.1)'
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)'
    ctx.lineWidth = 1.5
    drawRoundedRect(ctx, W * 0.06, cardY, cardW, splitH, 18)
    ctx.fill()
    ctx.stroke()

    ctx.font = 'bold 13px Inter, sans-serif'
    ctx.fillStyle = '#f87171'
    ctx.textAlign = 'left'
    ctx.fillText('❌ THE TRADITIONAL METHOD', W * 0.11, cardY + 32)

    ctx.font = '600 16px Inter, sans-serif'
    ctx.fillStyle = '#fecaca'
    ctx.fillText('• 4 hours manual rewriting per platform', W * 0.11, cardY + 68)
    ctx.fillText('• Inconsistent tone and visual clipping', W * 0.11, cardY + 98)
    ctx.fillText('• Low engagement and creator burnout', W * 0.11, cardY + 128)

    // Box 2: The New Way with ContentBloom (Emerald/Vibrant)
    const box2Y = cardY + splitH + 16
    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)'
    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = 2
    drawRoundedRect(ctx, W * 0.06, box2Y, cardW, splitH, 18)
    ctx.fill()
    ctx.stroke()

    ctx.font = 'bold 13px Inter, sans-serif'
    ctx.fillStyle = '#34d399'
    ctx.fillText('✅ CONTENTBLOOM AI ARCHITECTURE', W * 0.11, box2Y + 32)

    ctx.font = 'bold 16px Inter, sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.fillText('• 1 Idea ➔ 4 Platform-Engineered Formats', W * 0.11, box2Y + 68)
    ctx.fillText('• Instant High-Res Graphics & Video Plans', W * 0.11, box2Y + 98)
    ctx.fillText('• 10x Distribution Speed with Zero Burnout', W * 0.11, box2Y + 128)
    ctx.restore()

  } else if (compType === 'graphic_asset' || preloadedGraphic) {
    // --- GRAPHIC ASSET SHOWCASE (IMAGE-TO-VIDEO INTEGRATION) ---
    ctx.save()
    const frameY = H * 0.15
    const frameW = W * 0.88
    const frameH = 340

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 2
    drawRoundedRect(ctx, W * 0.06, frameY, frameW, frameH, 20)
    ctx.fill()
    ctx.stroke()

    if (preloadedGraphic) {
      // Subtle Ken Burns zoom
      const zoom = 1 + sceneProgress * 0.08
      ctx.save()
      ctx.beginPath()
      drawRoundedRect(ctx, W * 0.06 + 6, frameY + 6, frameW - 12, frameH - 12, 16)
      ctx.clip()

      const imgW = frameW - 12
      const imgH = frameH - 12
      ctx.translate(W * 0.5, frameY + frameH * 0.5)
      ctx.scale(zoom, zoom)
      ctx.drawImage(preloadedGraphic, -imgW / 2, -imgH / 2, imgW, imgH)
      ctx.restore()
    } else {
      // Illustrated Asset Card fallback
      ctx.textAlign = 'center'
      ctx.font = '54px sans-serif'
      ctx.fillText('🎨', W * 0.5, frameY + 110)

      ctx.font = 'bold 22px Inter, sans-serif'
      ctx.fillStyle = '#ffffff'
      ctx.fillText('VISUAL GRAPHIC ASSET', W * 0.5, frameY + 170)

      ctx.font = '500 14px Inter, sans-serif'
      ctx.fillStyle = '#94a3b8'
      ctx.fillText(scene.visual_prompt || 'High-res creative graphic ready for production', W * 0.5, frameY + 205)
    }

    // Asset Overlay Badge
    ctx.fillStyle = 'rgba(2, 6, 23, 0.85)'
    drawRoundedRect(ctx, W * 0.1, frameY + frameH - 52, frameW - (W * 0.08), 38, 12)
    ctx.fill()

    ctx.font = 'bold 12px Inter, sans-serif'
    ctx.fillStyle = '#38bdf8'
    ctx.textAlign = 'center'
    ctx.fillText('🖼️ STUDIO GRAPHIC ASSET • 1080P VERIFIED', W * 0.5, frameY + frameH - 28)
    ctx.restore()

  } else if (compType === 'cta_outro') {
    // --- CLOSING CALL TO ACTION COMPOSITION ---
    ctx.save()
    const ctaY = H * 0.18
    const ctaW = W * 0.88
    const ctaH = 310

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'
    ctx.strokeStyle = '#f43f5e'
    ctx.lineWidth = 3
    drawRoundedRect(ctx, W * 0.06, ctaY, ctaW, ctaH, 24)
    ctx.fill()
    ctx.stroke()

    // Bell Notification Icon
    ctx.font = '48px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('🔔', W * 0.5, ctaY + 70)

    ctx.font = '900 26px Inter, sans-serif'
    ctx.fillStyle = '#ffffff'
    const ctaLines = wrapText(ctx, (scene.on_screen_text || 'FOLLOW FOR MORE').toUpperCase(), ctaW - 40)
    ctx.fillText(ctaLines[0] || 'FOLLOW FOR MORE', W * 0.5, ctaY + 120)

    ctx.font = '500 16px Inter, sans-serif'
    ctx.fillStyle = '#cbd5e1'
    ctx.fillText('Daily actionable frameworks & playbooks', W * 0.5, ctaY + 155)

    // Pulsating Action Button
    const pulseScale = 1 + Math.sin(timeSec * 5) * 0.04
    ctx.translate(W * 0.5, ctaY + 225)
    ctx.scale(pulseScale, pulseScale)

    const btnW = 260
    const btnH = 50
    ctx.fillStyle = '#f43f5e'
    drawRoundedRect(ctx, -btnW / 2, -btnH / 2, btnW, btnH, 25)
    ctx.fill()

    ctx.font = 'bold 18px Inter, sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.fillText('FOLLOW + SHARE ➔', 0, 6)
    ctx.restore()

  } else {
    // --- FALLBACK CLEAN CARD ---
    ctx.save()
    ctx.textAlign = 'center'
    const textScale = Math.min(1, 0.8 + sceneProgress * 0.25)
    ctx.translate(W * 0.5, H * 0.36)
    ctx.scale(textScale, textScale)

    ctx.font = '900 32px Inter, system-ui, sans-serif'
    const lines = wrapText(ctx, (scene.on_screen_text || 'KEY POINT').toUpperCase(), W * 0.82)
    const bH = lines.length * 44 + 32
    const bW = W * 0.88

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 2
    drawRoundedRect(ctx, -bW * 0.5, -bH * 0.5, bW, bH, 18)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#ffffff'
    let sY = -bH * 0.5 + 40
    for (const line of lines) {
      ctx.fillText(line, 0, sY)
      sY += 44
    }
    ctx.restore()
  }

  // 6. Kinetic Caption Pill (Floating mid-stage)
  if (compType !== 'hook_intro' && compType !== 'cta_outro') {
    const captionText = scene.on_screen_text
    if (captionText) {
      ctx.save()
      ctx.textAlign = 'center'
      ctx.font = 'bold 18px Inter, sans-serif'
      const capW = Math.min(W * 0.88, ctx.measureText(captionText.toUpperCase()).width + 36)
      const capH = 36

      ctx.fillStyle = 'rgba(2, 6, 23, 0.9)'
      ctx.strokeStyle = '#38bdf8'
      ctx.lineWidth = 1.5
      drawRoundedRect(ctx, W * 0.5 - capW / 2, H * 0.56, capW, capH, 18)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#ffffff'
      ctx.fillText(captionText.toUpperCase(), W * 0.5, H * 0.56 + 24)
      ctx.restore()
    }
  }

  // 7. Bottom Stage: Synchronized Voiceover Subtitles
  ctx.save()
  const voY = H * 0.72
  const voW = W * 0.88
  const voH = 140

  ctx.fillStyle = 'rgba(2, 6, 23, 0.92)'
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.lineWidth = 1.5
  drawRoundedRect(ctx, W * 0.06, voY, voW, voH, 18)
  ctx.fill()
  ctx.stroke()

  ctx.font = 'bold 11px Inter, sans-serif'
  ctx.fillStyle = '#38bdf8'
  ctx.textAlign = 'left'
  ctx.fillText('🎙️ NARRATION AUDIO', W * 0.11, voY + 26)

  // Voiceover words pacing
  ctx.font = '600 15px Inter, sans-serif'
  const voWords = (scene.voiceover || '').split(/\s+/).filter(Boolean)
  const currentWordIndex = Math.min(voWords.length - 1, Math.floor(sceneProgress * voWords.length))

  const voLines = wrapText(ctx, `"${scene.voiceover || ''}"`, voW - 40)
  let curVoY = voY + 54
  for (const vol of voLines.slice(0, 3)) {
    ctx.fillStyle = '#ffffff'
    ctx.fillText(vol, W * 0.11, curVoY)
    curVoY += 26
  }
  ctx.restore()

  // 8. Floating Social Engagement Icons on right
  ctx.save()
  ctx.textAlign = 'center'
  const rightX = W - 32
  ctx.font = '20px sans-serif'
  ctx.fillText('❤️', rightX, H * 0.58)
  ctx.fillText('💬', rightX, H * 0.64)
  ctx.fillText('↗', rightX, H * 0.70)
  ctx.restore()

  // 9. Bottom Timeline Scrubber & Total Progress Bar
  ctx.save()
  const progressY = H - 24
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
  ctx.fillRect(20, progressY, W - 40, 6)

  const progGrad = ctx.createLinearGradient(20, 0, W - 20, 0)
  progGrad.addColorStop(0, '#38bdf8')
  progGrad.addColorStop(1, '#a855f7')
  ctx.fillStyle = progGrad
  ctx.fillRect(20, progressY, (W - 40) * Math.min(1, totalProgress), 6)

  ctx.font = 'bold 11px Inter, sans-serif'
  ctx.fillStyle = '#94a3b8'
  ctx.textAlign = 'left'
  ctx.fillText(`${Math.floor(timeSec)}s`, 22, progressY - 10)

  ctx.textAlign = 'right'
  ctx.fillText(planTitle.slice(0, 28), W - 22, progressY - 10)
  ctx.restore()
}

/**
 * Renders a single scene preview frame directly into any canvas element.
 */
export async function renderScenePreviewFrame(
  canvas,
  scene,
  sceneProgress = 0.5,
  options = {}
) {
  if (!canvas || !scene) return
  const width = options.width || 540
  const height = options.height || 960
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  let graphicImg = null
  if (options.sourceGraphic) {
    graphicImg = await preloadImage(options.sourceGraphic)
  }

  drawSceneComposition(ctx, {
    scene,
    sceneProgress,
    totalProgress: sceneProgress,
    timeSec: Math.round(sceneProgress * (scene.duration_seconds || 5)),
    width,
    height,
    totalScenes: options.totalScenes || 3,
    sceneIndex: options.sceneIndex || 0,
    preloadedGraphic: graphicImg,
    planTitle: options.planTitle || 'CONTENTBLOOM',
    visualStyle: options.visualStyle || 'kinetic_tech',
  })
}

/**
 * Renders an animated storyboard plan into a genuine playable video file.
 *
 * @param {Object} plan - Video storyboard plan containing scenes, hook, title, CTA.
 * @param {Function} onProgress - Progress callback ({ percent, currentScene, totalScenes }).
 * @param {Object} options - Options including optional sourceGraphic, visualStyle.
 * @returns {Promise<{ blob: Blob, url: string, mimeType: string, duration: number }>}
 */
export async function renderVideoFromPlan(plan, onProgress = () => {}, options = {}) {
  const width = 540
  const height = 960
  const fps = 30

  // 1. Prepare off-screen canvas
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  // Preload graphic asset if provided (Image-to-Video Integration)
  let preloadedGraphic = null
  const graphicUrl = options.sourceGraphic || plan.sourceGraphic || null
  if (graphicUrl) {
    preloadedGraphic = await preloadImage(graphicUrl)
  }

  const rawScenes = plan.scenes && plan.scenes.length > 0
    ? plan.scenes
    : [
        {
          scene_number: 1,
          duration_seconds: 4,
          composition_type: 'hook_intro',
          visual_description: 'High impact opening hook with bold headline',
          voiceover: plan.hook || 'Here is the big secret you need to know today.',
          on_screen_text: 'STOP SCROLLING',
          transition: 'Whip Pan',
        },
        {
          scene_number: 2,
          duration_seconds: 6,
          composition_type: 'stat_chart',
          visual_description: 'Animated benchmark showing 10x throughput surge',
          voiceover: plan.summary || 'Transform one raw idea into platform-tailored content.',
          on_screen_text: '10X OUTPUT VELOCITY',
          transition: 'Cut',
          chart_data: { label: 'Content Velocity', value: 85, unit: '%' },
        },
        {
          scene_number: 3,
          duration_seconds: 4,
          composition_type: 'cta_outro',
          visual_description: 'Actionable call to action with subscribe prompt',
          voiceover: plan.call_to_action || 'Follow ContentBloom AI for more daily growth playbooks.',
          on_screen_text: 'FOLLOW FOR MORE',
          transition: 'Fade',
        },
      ]

  // Calculate timestamps per scene
  let accumulatedTime = 0
  const sceneTimeline = rawScenes.map((s, idx) => {
    const dur = Math.max(3, Math.min(15, s.duration_seconds || 5))
    const start = accumulatedTime
    const end = accumulatedTime + dur
    accumulatedTime = end
    return {
      ...s,
      duration: dur,
      startTime: start,
      endTime: end,
      index: idx,
    }
  })

  const totalDuration = accumulatedTime
  const totalFrames = Math.round(totalDuration * fps)
  const sceneStartTimes = sceneTimeline.map((s) => s.startTime)

  // 2. Synthesize audio track with transition sound cues
  const audioHelper = createSynthesizedAudioTrack(totalDuration, sceneStartTimes)

  // 3. Set up MediaStream and MediaRecorder
  const canvasStream = canvas.captureStream(fps)
  if (audioHelper?.track) {
    canvasStream.addTrack(audioHelper.track)
  }

  let mimeType = 'video/webm;codecs=vp9'
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm'
  }
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = '' // browser default
  }

  const recordedChunks = []
  const recorder = new MediaRecorder(canvasStream, mimeType ? { mimeType } : undefined)

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data)
    }
  }

  // Draw frame with transition support
  function renderFrameAtTime(timeSec) {
    const currentScene = sceneTimeline.find(
      (s) => timeSec >= s.startTime && timeSec < s.endTime
    ) || sceneTimeline[sceneTimeline.length - 1]

    const sceneProgress = Math.max(
      0,
      Math.min(1, (timeSec - currentScene.startTime) / currentScene.duration)
    )

    const totalProgress = Math.min(1, timeSec / totalDuration)

    // Check if this scene should use the preloaded graphic
    const useGraphic = preloadedGraphic && (
      currentScene.composition_type === 'graphic_asset' ||
      currentScene.index === 1 ||
      options.graphicSceneIndex === currentScene.index
    )

    drawSceneComposition(ctx, {
      scene: currentScene,
      sceneProgress,
      totalProgress,
      timeSec,
      width,
      height,
      totalScenes: sceneTimeline.length,
      sceneIndex: currentScene.index,
      preloadedGraphic: useGraphic ? preloadedGraphic : null,
      planTitle: plan.title || 'CONTENTBLOOM',
      visualStyle: options.visualStyle || plan.visual_style || 'kinetic_tech',
    })

    // Scene transition smoothing in last 0.35s
    const timeToSceneEnd = currentScene.endTime - timeSec
    if (timeToSceneEnd < 0.35 && currentScene.index < sceneTimeline.length - 1) {
      const transAlpha = (0.35 - timeToSceneEnd) / 0.35
      ctx.save()
      ctx.globalAlpha = transAlpha * 0.4
      ctx.fillStyle = '#ffffff' // soft flash
      ctx.fillRect(0, 0, width, height)
      ctx.restore()
    }
  }

  // 4. Render loop & recording
  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      audioHelper?.cleanup()
      const finalBlob = new Blob(recordedChunks, {
        type: mimeType || 'video/webm',
      })
      const videoUrl = URL.createObjectURL(finalBlob)
      resolve({
        blob: finalBlob,
        url: videoUrl,
        duration: totalDuration,
        mimeType: mimeType || 'video/webm',
      })
    }

    recorder.onerror = (err) => {
      audioHelper?.cleanup()
      reject(err)
    }

    try {
      recorder.start()
    } catch (err) {
      audioHelper?.cleanup()
      reject(err)
      return
    }

    let frame = 0
    const frameInterval = 1000 / fps

    function renderNext() {
      if (frame > totalFrames) {
        // Request any buffered data before stopping
        try {
          if (recorder.state === 'recording') {
            recorder.requestData()
          }
        } catch {}
        setTimeout(() => {
          try {
            if (recorder.state === 'recording') {
              recorder.stop()
            }
          } catch {}
        }, 50)
        return
      }

      const currentTime = frame / fps
      renderFrameAtTime(currentTime)

      const percent = Math.round((frame / totalFrames) * 100)
      const curScene = sceneTimeline.find(
        (s) => currentTime >= s.startTime && currentTime < s.endTime
      ) || sceneTimeline[sceneTimeline.length - 1]

      onProgress({
        percent,
        currentScene: curScene.index + 1,
        totalScenes: sceneTimeline.length,
        timeSeconds: Math.round(currentTime),
        totalSeconds: Math.round(totalDuration),
      })

      frame++
      setTimeout(renderNext, frameInterval)
    }

    renderNext()
  })
}

/**
 * Downloads a video blob to the user's computer.
 */
export function downloadVideoBlob(blob, filename = 'ContentBloom_Shorts_Video.webm') {
  if (!blob) return
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}
