import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/**
 * The Sacred Garden — Wedding Invitation Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const bgAudio = document.getElementById('bgAudio');
  const envelopeOverlay = document.getElementById('envelopeOverlay');
  const videoTransitionWrap = document.getElementById('videoTransitionWrap');
  const envelopeVideo = document.getElementById('envelopeVideo');
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const iconPause = document.getElementById('iconPause');
  const iconPlay = document.getElementById('iconPlay');

  // Countdown Elements
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const timerGrid = document.getElementById('timerGrid');

  // Floral Interlude Elements
  const floralArtworkStage = document.getElementById('floralArtworkStage');

  // Vintage Audio Player Elements
  const audioPlayerWrap = document.getElementById('audioPlayerWrap');
  const turntableTonearm = document.getElementById('turntableTonearm');
  const vinylDisc = document.getElementById('vinylDisc');
  const vinylCenterLabel = document.getElementById('vinylCenterLabel');
  const labelSidePill = document.getElementById('labelSidePill');
  const labelTrackTitle = document.getElementById('labelTrackTitle');
  const trackSwitchBtn = document.getElementById('trackSwitchBtn');
  const trackNextBadge = document.getElementById('trackNextBadge');
  const songToastNotification = document.getElementById('songToastNotification');
  const toastSideTag = document.getElementById('toastSideTag');
  const toastTrackName = document.getElementById('toastTrackName');
  const trackPill0 = document.getElementById('trackPill0');
  const trackPill1 = document.getElementById('trackPill1');
  const tooltipState = document.getElementById('tooltipState');

  // 15-Second Celebratory Dance Callout Elements
  const danceNudgeBubble = document.getElementById('danceNudgeBubble');
  const nudgeActionBtn = document.getElementById('nudgeActionBtn');
  const nudgeCloseBtn = document.getElementById('nudgeCloseBtn');

  // Celebratory Dancing Avatar & Extra Bass Elements
  const dancingAvatarWrap = document.getElementById('dancingAvatarWrap');
  const dancingAvatarImg = document.getElementById('dancingAvatarImg');
  const avatarCloseBtn = document.getElementById('avatarCloseBtn');
  const avatarDancerStage = document.getElementById('avatarDancerStage');
  const avatarSparklesStage = document.getElementById('avatarSparklesStage');

  // Smooth Scrolling & Progress Elements
  const scrollProgressFill = document.getElementById('scrollProgressFill');
  const heroScrollCue = document.getElementById('heroScrollCue');

  // Initialize Lenis for buttery-smooth, lag-free momentum scrolling
  const lenis = new Lenis({
    duration: 1.25,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.6,
    infinite: false,
  });

  // Lock scrolling until envelope is opened
  lenis.stop();

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Hook Lenis scroll events
  lenis.on('scroll', ({ progress }) => {
    // 1. Update luxury golden reading progress bar at top of screen
    if (scrollProgressFill) {
      scrollProgressFill.style.width = `${Math.min(100, Math.max(0, progress * 100))}%`;
    }

    // 2. Update timeline flower target
    calculateTargetPosition();
  });

  // Interactive Hero "Scroll down" prompt click
  if (heroScrollCue) {
    heroScrollCue.addEventListener('click', () => {
      const blessingSection = document.getElementById('blessing');
      if (blessingSection) {
        lenis.scrollTo(blessingSection, { offset: -25, duration: 1.35 });
      } else {
        lenis.scrollTo(window.innerHeight * 0.9, { duration: 1.35 });
      }
    });

    heroScrollCue.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const blessingSection = document.getElementById('blessing');
        if (blessingSection) {
          lenis.scrollTo(blessingSection, { offset: -25, duration: 1.35 });
        }
      }
    });
  }

  let audioUnlocked = false;
  let envelopeOpened = false;
  let notesInterval = null;
  let toastTimeout = null;
  let isSwitchingTrack = false;
  let autoSwitchTimer = null;
  const AUTO_SWITCH_MS = 90000; // Auto-transition to next track after 1.5 minutes

  // Web Audio Extra Bass & Live Audio Reactivity Architecture
  let audioCtx = null;
  let bassFilter = null;
  let audioAnalyser = null;
  let audioFreqData = null;
  let liveBassAnimFrame = null;
  let danceNudgeTimer = null;
  let danceNudgeAutoDismissTimer = null;

  function setupWebAudioBass() {
    if (audioCtx) {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return;
    }
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) return;
      audioCtx = new AudioCtxClass();
      const source = audioCtx.createMediaElementSource(bgAudio);

      // Real-time Audio Frequency Analyser for Speaker Bass Pumping
      audioAnalyser = audioCtx.createAnalyser();
      audioAnalyser.fftSize = 128;
      audioAnalyser.smoothingTimeConstant = 0.75;
      audioFreqData = new Uint8Array(audioAnalyser.frequencyBinCount);

      // Low-shelf bass boost filter for punchy acoustic feel
      bassFilter = audioCtx.createBiquadFilter();
      bassFilter.type = 'lowshelf';
      bassFilter.frequency.value = 115;
      bassFilter.gain.value = 0;

      source.connect(audioAnalyser);
      audioAnalyser.connect(bassFilter);
      bassFilter.connect(audioCtx.destination);

      startLiveBassLoop();
    } catch (e) {
      // Audio element might already be connected
    }
  }

  // Live Subwoofer Bass Reactivity Loop: scales avatar dynamically when bass gets louder
  function startLiveBassLoop() {
    if (liveBassAnimFrame) return;

    function renderBassFrame() {
      if (
        audioAnalyser &&
        audioFreqData &&
        currentTrackIndex === 1 &&
        !bgAudio.paused &&
        dancingAvatarWrap &&
        !dancingAvatarWrap.classList.contains('hidden')
      ) {
        audioAnalyser.getByteFrequencyData(audioFreqData);
        // Average low-frequency sub-bass bins (20Hz - 160Hz)
        const subBass = (audioFreqData[0] + audioFreqData[1] + audioFreqData[2] + audioFreqData[3]) / 4;
        
        // Dynamically scale bass zoom intensity: louder bass = bigger zoom in/out!
        const bassMultiplier = 1 + (subBass / 255) * 0.35;
        dancingAvatarWrap.style.setProperty('--live-bass-scale', bassMultiplier.toFixed(3));
      }
      liveBassAnimFrame = requestAnimationFrame(renderBassFrame);
    }
    liveBassAnimFrame = requestAnimationFrame(renderBassFrame);
  }

  // 15-Second Nudge: Prompts the user to change track and dance!
  function scheduleDanceNudge() {
    cancelDanceNudge();
    danceNudgeTimer = setTimeout(() => {
      // Only show if user is still playing track 0 (Side A)
      if (currentTrackIndex === 0) {
        showDanceNudge();
      }
    }, 15000); // 15 seconds after envelope opening
  }

  function showDanceNudge() {
    if (!danceNudgeBubble || currentTrackIndex !== 0) return;
    danceNudgeBubble.classList.remove('hidden');
    audioPlayerWrap?.classList.add('dance-nudge-active');

    // Auto-dismiss smoothly after 14 seconds if user doesn't click
    if (danceNudgeAutoDismissTimer) clearTimeout(danceNudgeAutoDismissTimer);
    danceNudgeAutoDismissTimer = setTimeout(hideDanceNudge, 14000);
  }

  function hideDanceNudge() {
    if (danceNudgeBubble) danceNudgeBubble.classList.add('hidden');
    audioPlayerWrap?.classList.remove('dance-nudge-active');
    if (danceNudgeAutoDismissTimer) {
      clearTimeout(danceNudgeAutoDismissTimer);
      danceNudgeAutoDismissTimer = null;
    }
  }

  function cancelDanceNudge() {
    if (danceNudgeTimer) {
      clearTimeout(danceNudgeTimer);
      danceNudgeTimer = null;
    }
    hideDanceNudge();
  }

  function startAutoSwitchTimer() {
    stopAutoSwitchTimer();
    // Only auto-switch if currently on Side A (first track)
    if (currentTrackIndex === 0) {
      autoSwitchTimer = setTimeout(() => {
        if (currentTrackIndex === 0 && !bgAudio.paused) {
          switchTrack(1); // Advance to Side B!
        }
      }, AUTO_SWITCH_MS);
    }
  }

  function stopAutoSwitchTimer() {
    if (autoSwitchTimer) {
      clearTimeout(autoSwitchTimer);
      autoSwitchTimer = null;
    }
  }

  // Interactive Avatar Tap Celebration
  function triggerAvatarCelebration() {
    if (!dancingAvatarImg) return;
    dancingAvatarImg.classList.remove('spin-celebrate');
    void dancingAvatarImg.offsetWidth;
    dancingAvatarImg.classList.add('spin-celebrate');

    for (let i = 0; i < 6; i++) {
      setTimeout(spawnCelebrationParticle, i * 130);
    }
  }

  function spawnCelebrationParticle() {
    if (!avatarSparklesStage) return;
    const p = document.createElement('span');
    p.className = 'sparkle-particle';
    const symbols = ['💖', '✨', '♫', '💛', '✦', '🌹', '𝄞'];
    p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    p.style.left = `${15 + Math.random() * 70}%`;
    p.style.top = `${10 + Math.random() * 50}%`;
    p.style.fontSize = `${13 + Math.random() * 7}px`;
    avatarSparklesStage.appendChild(p);
    setTimeout(() => {
      if (p.parentNode) p.parentNode.removeChild(p);
    }, 2000);
  }

  const tracks = [
    {
      id: 0,
      side: 'SIDE A',
      nextBadge: 'B',
      title: 'Royal Orchestral Serenade',
      labelTitle: 'ROYAL SERENADE',
      labelClass: 'side-a',
      src: '/assets/wedding_music.mp3'
    },
    {
      id: 1,
      side: 'SIDE B',
      nextBadge: 'A',
      title: 'Sacred Garden Symphony',
      labelTitle: 'SACRED SYMPHONY',
      labelClass: 'side-b',
      src: '/assets/wedding_music 2.mp3'
    }
  ];
  let currentTrackIndex = 0;

  const musicalSymbols = ['♪', '♫', '♩', '♬', '𝄞'];

  function spawnFloatingNote() {
    if (!playerNotesStage || !audioPlayerWrap?.classList.contains('is-playing')) return;

    const note = document.createElement('span');
    note.className = 'floating-note';
    note.textContent = musicalSymbols[Math.floor(Math.random() * musicalSymbols.length)];

    const tx = (Math.random() - 0.5) * 44 - 15;
    const rot = Math.floor(Math.random() * 50) - 25;

    note.style.setProperty('--tx', `${tx}px`);
    note.style.setProperty('--rot', `${rot}deg`);

    playerNotesStage.appendChild(note);
    setTimeout(() => {
      if (note.parentNode) note.parentNode.removeChild(note);
    }, 2400);
  }

  function startNoteSpawner() {
    if (notesInterval) clearInterval(notesInterval);
    spawnFloatingNote();
    notesInterval = setInterval(spawnFloatingNote, 1600);
  }

  function stopNoteSpawner() {
    if (notesInterval) {
      clearInterval(notesInterval);
      notesInterval = null;
    }
  }

  function setPlayerState(isPlaying) {
    if (isPlaying) {
      audioPlayerWrap?.classList.add('is-playing');
      if (!isSwitchingTrack) {
        turntableTonearm?.classList.add('arm-on-record');
      }
      vinylDisc?.classList.add('spinning');
      iconPlay?.classList.add('hidden');
      iconPause?.classList.remove('hidden');
      if (tooltipState) tooltipState.textContent = 'Playing Music';
      startNoteSpawner();
      startAutoSwitchTimer();
      dancingAvatarWrap?.classList.remove('is-paused');
      setupWebAudioBass();
    } else {
      audioPlayerWrap?.classList.remove('is-playing');
      turntableTonearm?.classList.remove('arm-on-record');
      vinylDisc?.classList.remove('spinning');
      iconPause?.classList.add('hidden');
      iconPlay?.classList.remove('hidden');
      if (tooltipState) tooltipState.textContent = 'Paused • Tap to Play';
      stopNoteSpawner();
      stopAutoSwitchTimer();
      dancingAvatarWrap?.classList.add('is-paused');
    }
  }

  function showTrackToast(side, title) {
    if (!songToastNotification || !toastSideTag || !toastTrackName) return;
    toastSideTag.textContent = side;
    toastTrackName.textContent = title;
    songToastNotification.classList.add('active');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      songToastNotification.classList.remove('active');
    }, 3200);
  }

  function switchTrack(targetIndex) {
    if (isSwitchingTrack) return;
    if (targetIndex === currentTrackIndex && !bgAudio.paused) return;

    cancelDanceNudge();
    isSwitchingTrack = true;
    currentTrackIndex = targetIndex;
    const track = tracks[currentTrackIndex];

    // 1. Lift tonearm smoothly
    turntableTonearm?.classList.remove('arm-on-record');

    // 2. Trigger 3D vinyl record flip
    if (vinylDisc) {
      vinylDisc.classList.remove('flipping');
      void vinylDisc.offsetWidth; // trigger reflow
      vinylDisc.classList.add('flipping');
    }

    // 3. Update center label, pills, dancing avatar & bass midway through the flip
    setTimeout(() => {
      if (vinylCenterLabel) {
        vinylCenterLabel.className = `vinyl-center-label ${track.labelClass}`;
      }
      if (labelSidePill) labelSidePill.textContent = track.side;
      if (labelTrackTitle) labelTrackTitle.textContent = track.labelTitle;
      if (trackNextBadge) trackNextBadge.textContent = track.nextBadge;

      if (trackPill0) trackPill0.classList.toggle('active', currentTrackIndex === 0);
      if (trackPill1) trackPill1.classList.toggle('active', currentTrackIndex === 1);

      // Handle Dancing Avatar & Extra Bass on Second Song (Side B)
      if (currentTrackIndex === 1) {
        setupWebAudioBass();
        if (bassFilter && audioCtx) {
          bassFilter.gain.setTargetAtTime(6.5, audioCtx.currentTime, 0.3);
        }
        audioPlayerWrap?.classList.add('extra-bass-active');
        dancingAvatarWrap?.classList.remove('hidden');
        triggerAvatarCelebration();
      } else {
        if (bassFilter && audioCtx) {
          bassFilter.gain.setTargetAtTime(0, audioCtx.currentTime, 0.3);
        }
        audioPlayerWrap?.classList.remove('extra-bass-active');
        dancingAvatarWrap?.classList.add('hidden');
        startAutoSwitchTimer();
      }
    }, 360);

    // 4. Smooth audio crossfade
    let fadeOutVol = bgAudio.volume;
    const fadeOut = setInterval(() => {
      fadeOutVol = Math.max(0, fadeOutVol - 0.2);
      bgAudio.volume = fadeOutVol;
      if (fadeOutVol <= 0.05) {
        clearInterval(fadeOut);

        bgAudio.src = track.src;
        bgAudio.load();
        const playPromise = bgAudio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Fade in volume smoothly
              let fadeInVol = 0;
              const fadeIn = setInterval(() => {
                fadeInVol = Math.min(0.85, fadeInVol + 0.15);
                bgAudio.volume = fadeInVol;
                if (fadeInVol >= 0.85) clearInterval(fadeIn);
              }, 40);

              setPlayerState(true);
            })
            .catch(() => {
              setPlayerState(false);
            });
        }
      }
    }, 35);

    // 5. Toast notification
    showTrackToast(track.side, track.title);

    // 6. Complete flip and lower tonearm back to record
    setTimeout(() => {
      vinylDisc?.classList.remove('flipping');
      if (!bgAudio.paused) {
        turntableTonearm?.classList.add('arm-on-record');
      }
      isSwitchingTrack = false;

      // Burst of floating musical notes celebration
      for (let i = 0; i < 4; i++) {
        setTimeout(spawnFloatingNote, i * 180);
      }
    }, 780);
  }

  /* ==========================================================================
     1. AUDIO SYSTEM & ENVELOPE OPENING SEQUENCE
     ========================================================================== */
  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    const playPromise = bgAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          bgAudio.pause();
          bgAudio.currentTime = 0;
        })
        .catch(() => { });
    }
  }

  // Pre-warm audio and handle open on click, touch or keyboard
  if (envelopeOverlay) {
    envelopeOverlay.addEventListener('touchstart', unlockAudio, { passive: true });
    envelopeOverlay.addEventListener('click', handleOpenEnvelope);
    envelopeOverlay.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleOpenEnvelope();
      }
    });
  }

  function handleOpenEnvelope() {
    if (envelopeOpened) return;
    envelopeOpened = true;

    // Fade out initial envelope
    envelopeOverlay.style.opacity = '0';
    envelopeOverlay.style.pointerEvents = 'none';

    setTimeout(() => {
      envelopeOverlay.style.display = 'none';
      lenis.start();
    }, 1300);

    // Play flap unfold transition video
    if (videoTransitionWrap && envelopeVideo) {
      videoTransitionWrap.classList.add('video-visible');
      const videoPromise = envelopeVideo.play();
      if (videoPromise !== undefined) {
        videoPromise.catch(() => { });
      }
    }

    // Start background orchestral music
    bgAudio.volume = 0.85;
    const audioPromise = bgAudio.play();
    if (audioPromise !== undefined) {
      audioPromise
        .then(() => {
          setPlayerState(true);
        })
        .catch(() => {
          console.log('Audio autoplay blocked; waiting for user interaction');
          setPlayerState(false);
        });
    }

    // Transition out video slightly before finish
    if (envelopeVideo) {
      envelopeVideo.addEventListener('timeupdate', () => {
        if (
          envelopeVideo.duration &&
          envelopeVideo.currentTime >= envelopeVideo.duration - 0.7 &&
          !envelopeVideo.dataset.fading
        ) {
          envelopeVideo.dataset.fading = '1';
          finishOpeningSequence();
        }
      });

      envelopeVideo.addEventListener('ended', () => {
        finishOpeningSequence();
      });
    } else {
      finishOpeningSequence();
    }
  }

  function finishOpeningSequence() {
    if (videoTransitionWrap) {
      videoTransitionWrap.classList.remove('video-visible');
      videoTransitionWrap.classList.add('video-fade-out');
      setTimeout(() => {
        videoTransitionWrap.style.display = 'none';
      }, 1400);
    }

    // Show floating vintage turntable player
    if (audioPlayerWrap) {
      audioPlayerWrap.classList.add('visible');
    }
    if (audioToggleBtn) {
      audioToggleBtn.classList.add('visible');
    }

    // Schedule 15-second celebratory dance CTA nudge
    scheduleDanceNudge();
  }

  // Audio Toggle Button Event Listener
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', (e) => {
      // Ignore click if clicking directly on the track pills inside tooltip
      if (e.target.closest('.track-select-pill')) return;

      if (bgAudio.paused) {
        bgAudio.play().then(() => {
          setPlayerState(true);
        }).catch(() => { });
      } else {
        bgAudio.pause();
        setPlayerState(false);
      }
    });
  }

  // Quick Track Switch Button (Side A ⇄ Side B)
  if (trackSwitchBtn) {
    trackSwitchBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const nextIndex = currentTrackIndex === 0 ? 1 : 0;
      switchTrack(nextIndex);
    });
  }

  // Track Selector Pills in Flyout Menu
  if (trackPill0) {
    trackPill0.addEventListener('click', (e) => {
      e.stopPropagation();
      switchTrack(0);
    });
    trackPill0.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        switchTrack(0);
      }
    });
  }

  if (trackPill1) {
    trackPill1.addEventListener('click', (e) => {
      e.stopPropagation();
      switchTrack(1);
    });
    trackPill1.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        switchTrack(1);
      }
    });
  }

  // Close popup menu via close button on mobile
  const closeTrackMenuBtn = document.getElementById('closeTrackMenuBtn');
  if (closeTrackMenuBtn) {
    closeTrackMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      audioPlayerWrap?.classList.remove('menu-open');
    });
  }

  // Toggle track menu when tapping Equalizer badge
  const recordEqBadge = document.getElementById('recordEqBadge');
  if (recordEqBadge) {
    recordEqBadge.style.cursor = 'pointer';
    recordEqBadge.style.pointerEvents = 'auto';
    recordEqBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      audioPlayerWrap?.classList.toggle('menu-open');
    });
  }

  // Dismiss track menu on mobile when clicking anywhere outside
  document.addEventListener('click', (e) => {
    if (audioPlayerWrap && !audioPlayerWrap.contains(e.target)) {
      audioPlayerWrap.classList.remove('menu-open');
    }
  });

  // 15-Second Nudge Interactivity: Click to switch track and dance!
  if (nudgeActionBtn) {
    nudgeActionBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      cancelDanceNudge();
      switchTrack(1); // Advance directly to Side B and reveal dancing avatar!
    });
  }

  if (danceNudgeBubble) {
    danceNudgeBubble.addEventListener('click', (e) => {
      if (e.target.closest('.nudge-close-btn')) return;
      e.stopPropagation();
      cancelDanceNudge();
      switchTrack(1);
    });
  }

  if (nudgeCloseBtn) {
    nudgeCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      cancelDanceNudge();
    });
  }

  // Tap Dancing Avatar for Celebratory Pirouette & Gold Hearts
  if (avatarDancerStage) {
    avatarDancerStage.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerAvatarCelebration();
    });
  }

  // Minimize / Hide Dancing Avatar
  if (avatarCloseBtn) {
    avatarCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dancingAvatarWrap?.classList.add('hidden');
    });
  }

  // Auto-switch track when current song finishes playing
  bgAudio.addEventListener('ended', () => {
    const nextIndex = currentTrackIndex === 0 ? 1 : 0;
    switchTrack(nextIndex);
  });

  /* ==========================================================================
     2. REAL-TIME WEDDING COUNTDOWN TIMER
     ========================================================================== */
  const targetDateStr = timerGrid?.getAttribute('data-target') || '2026-11-17T12:30:00+05:30';
  const targetTime = new Date(targetDateStr).getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetTime - now;

    if (distance <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minutesEl) minutesEl.textContent = '00';
      if (secondsEl) secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ==========================================================================
     3. ENCHANTED FLORAL INTERLUDE & INTERACTIVE PETAL SHOWER
     ========================================================================== */
  function triggerPetalShower(originX, originY) {
    if (!floralArtworkStage) return;

    const rect = floralArtworkStage.getBoundingClientRect();
    const clickX = originX !== undefined ? originX - rect.left : rect.width / 2;
    const clickY = originY !== undefined ? originY - rect.top : rect.height / 2;

    // Spawn 14 delicate rose petals
    for (let i = 0; i < 14; i++) {
      const petal = document.createElement('span');
      petal.className = 'burst-petal';

      const size = Math.floor(Math.random() * 10) + 12; // 12px - 22px
      const angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.5;
      const distance = Math.random() * 90 + 50;

      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance + Math.random() * 60 + 30; // gentle downward gravity
      const rot = Math.floor(Math.random() * 360) - 180;
      const scale = (Math.random() * 0.4 + 0.8).toFixed(2);

      petal.style.width = `${size}px`;
      petal.style.height = `${Math.floor(size * 1.35)}px`;
      petal.style.left = `${clickX}px`;
      petal.style.top = `${clickY}px`;
      petal.style.setProperty('--tx', `${tx}px`);
      petal.style.setProperty('--ty', `${ty}px`);
      petal.style.setProperty('--rot', `${rot}deg`);
      petal.style.setProperty('--scale', scale);
      petal.style.animationDelay = `${(Math.random() * 0.15).toFixed(2)}s`;

      floralArtworkStage.appendChild(petal);
      setTimeout(() => {
        if (petal.parentNode) petal.parentNode.removeChild(petal);
      }, 1900);
    }

    // Spawn 8 shimmering gold stardust specks
    for (let j = 0; j < 8; j++) {
      const sparkle = document.createElement('span');
      sparkle.className = 'burst-sparkle';

      const sAngle = Math.random() * Math.PI * 2;
      const sDist = Math.random() * 80 + 30;
      const sTx = Math.cos(sAngle) * sDist;
      const sTy = Math.sin(sAngle) * sDist - 20;

      sparkle.style.left = `${clickX}px`;
      sparkle.style.top = `${clickY}px`;
      sparkle.style.setProperty('--tx', `${sTx}px`);
      sparkle.style.setProperty('--ty', `${sTy}px`);

      floralArtworkStage.appendChild(sparkle);
      setTimeout(() => {
        if (sparkle.parentNode) sparkle.parentNode.removeChild(sparkle);
      }, 1400);
    }
  }

  if (floralArtworkStage) {
    floralArtworkStage.addEventListener('click', (e) => {
      triggerPetalShower(e.clientX, e.clientY);
    });

    floralArtworkStage.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerPetalShower();
      }
    });

    // Auto-trigger once gently when scrolled into view
    let hasBloomedOnScroll = false;
    const floralObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasBloomedOnScroll) {
            hasBloomedOnScroll = true;
            setTimeout(() => {
              triggerPetalShower();
            }, 500);
          }
        });
      },
      { threshold: 0.4 }
    );
    floralObserver.observe(floralArtworkStage);
  }

  /* ==========================================================================
     4. SCROLL ENTRANCE ANIMATIONS (Intersection Observer)
     ========================================================================== */
  const animatedElements = document.querySelectorAll('.fade-in-on-scroll');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    animatedElements.forEach((el) => observer.observe(el));
  } else {
    // Fallback if IntersectionObserver is not supported
    animatedElements.forEach((el) => el.classList.add('is-visible'));
  }

  /* ==========================================================================
     5. SCHEDULE TABS & TRAVELING FLOWER CONTROLLER
     ========================================================================== */
  const scheduleTimeline = document.getElementById('scheduleTimeline');
  const timelineStemTrack = document.getElementById('timelineStemTrack');
  const timelineStemProgress = document.getElementById('timelineStemProgress');
  const timelineTraveler = document.getElementById('timelineTraveler');
  const schedPills = document.querySelectorAll('.sched-pill');
  const timelineParts = document.querySelectorAll('.timeline-part');

  let rowData = [];
  let trackX = 0;
  let minY = 0;
  let maxY = 0;
  let targetFlowerY = 0;
  let currentFlowerY = 0;
  let currentRot = 0;
  let currentScale = 1;
  let lastDustTime = 0;

  function updateTimelineLayout() {
    if (!scheduleTimeline || !timelineTraveler) return;

    const timelineRect = scheduleTimeline.getBoundingClientRect();
    const visibleRows = Array.from(
      scheduleTimeline.querySelectorAll('.timeline-part:not(.hidden) .timeline-row')
    );

    if (!visibleRows.length) {
      timelineTraveler.style.display = 'none';
      if (timelineStemTrack) timelineStemTrack.style.display = 'none';
      return;
    }

    timelineTraveler.style.display = 'flex';
    if (timelineStemTrack) timelineStemTrack.style.display = 'block';

    const viewportEyeLevel = window.innerHeight * 0.52;

    rowData = visibleRows.map((row, index) => {
      const markerCol = row.querySelector('.marker-col');
      const markerRect = markerCol ? markerCol.getBoundingClientRect() : row.getBoundingClientRect();
      const centerX = markerRect.left + markerRect.width / 2 - timelineRect.left;
      const centerY = markerRect.top + markerRect.height / 2 - timelineRect.top;
      const scrollTrigger = row.getBoundingClientRect().top + window.scrollY - viewportEyeLevel;

      return {
        row,
        index,
        x: centerX,
        y: centerY,
        scrollTrigger
      };
    });

    trackX = rowData[0].x;
    minY = rowData[0].y;
    maxY = rowData[rowData.length - 1].y;

    if (timelineStemTrack) {
      timelineStemTrack.style.left = `${trackX}px`;
      timelineStemTrack.style.top = `${minY}px`;
      timelineStemTrack.style.height = `${Math.max(0, maxY - minY)}px`;
    }

    // Keep target and current flower positions inside bounds
    targetFlowerY = Math.max(minY, Math.min(maxY, targetFlowerY || minY));
    if (!currentFlowerY) {
      currentFlowerY = targetFlowerY;
    }
  }

  function calculateTargetPosition() {
    if (!rowData.length) return;

    const scrollY = window.scrollY;

    if (scrollY <= rowData[0].scrollTrigger) {
      targetFlowerY = rowData[0].y;
      return;
    }

    if (scrollY >= rowData[rowData.length - 1].scrollTrigger) {
      targetFlowerY = rowData[rowData.length - 1].y;
      return;
    }

    // Interpolate through visible row segments
    for (let i = 0; i < rowData.length - 1; i++) {
      const cur = rowData[i];
      const next = rowData[i + 1];

      if (scrollY >= cur.scrollTrigger && scrollY <= next.scrollTrigger) {
        const segDist = next.scrollTrigger - cur.scrollTrigger;
        const progress = segDist > 0 ? (scrollY - cur.scrollTrigger) / segDist : 0;
        const clampedProgress = Math.max(0, Math.min(1, progress));
        targetFlowerY = cur.y + (next.y - cur.y) * clampedProgress;
        return;
      }
    }
  }

  function spawnTravelerDust(x, y) {
    if (!scheduleTimeline) return;
    const dust = document.createElement('span');
    const isPetal = Math.random() > 0.65;
    dust.className = `traveler-dust ${isPetal ? 'dust-petal' : ''}`;

    const dx = (Math.random() - 0.5) * 36;
    const dy = (Math.random() - 0.5) * 28 + (isPetal ? 16 : 0);
    const rot = Math.floor(Math.random() * 180) - 90;

    dust.style.left = `${x}px`;
    dust.style.top = `${y}px`;
    dust.style.setProperty('--dx', `${dx}px`);
    dust.style.setProperty('--dy', `${dy}px`);
    dust.style.setProperty('--rot', `${rot}deg`);

    scheduleTimeline.appendChild(dust);
    setTimeout(() => {
      if (dust.parentNode) dust.parentNode.removeChild(dust);
    }, 1150);
  }

  function burstTravelerBloom(originX, originY) {
    if (!scheduleTimeline) return;

    // 10 rose petals & 8 sparkles burst
    for (let i = 0; i < 10; i++) {
      const petal = document.createElement('span');
      petal.className = 'burst-petal';

      const size = Math.floor(Math.random() * 8) + 10;
      const angle = (Math.PI * 2 * i) / 10 + (Math.random() - 0.5) * 0.4;
      const dist = Math.random() * 55 + 25;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist + 15;
      const rot = Math.floor(Math.random() * 360);

      petal.style.width = `${size}px`;
      petal.style.height = `${Math.floor(size * 1.3)}px`;
      petal.style.left = `${originX}px`;
      petal.style.top = `${originY}px`;
      petal.style.setProperty('--tx', `${tx}px`);
      petal.style.setProperty('--ty', `${ty}px`);
      petal.style.setProperty('--rot', `${rot}deg`);
      petal.style.setProperty('--scale', '0.9');

      scheduleTimeline.appendChild(petal);
      setTimeout(() => {
        if (petal.parentNode) petal.parentNode.removeChild(petal);
      }, 1600);
    }

    for (let j = 0; j < 8; j++) {
      const sparkle = document.createElement('span');
      sparkle.className = 'burst-sparkle';
      const sAngle = Math.random() * Math.PI * 2;
      const sDist = Math.random() * 45 + 15;
      const sTx = Math.cos(sAngle) * sDist;
      const sTy = Math.sin(sAngle) * sDist;

      sparkle.style.left = `${originX}px`;
      sparkle.style.top = `${originY}px`;
      sparkle.style.setProperty('--tx', `${sTx}px`);
      sparkle.style.setProperty('--ty', `${sTy}px`);

      scheduleTimeline.appendChild(sparkle);
      setTimeout(() => {
        if (sparkle.parentNode) sparkle.parentNode.removeChild(sparkle);
      }, 1300);
    }
  }

  function animateFlower() {
    if (rowData.length && timelineTraveler) {
      calculateTargetPosition();

      const dy = targetFlowerY - currentFlowerY;
      const velocity = dy * 0.12;
      currentFlowerY += velocity;

      // Dynamic tilt based on movement velocity
      const targetRot = Math.max(-10, Math.min(10, velocity * 1.6));
      currentRot += (targetRot - currentRot) * 0.12;

      // Celebrate arrival at Barat / final event
      const isAtFinale = Math.abs(currentFlowerY - maxY) < 8;
      const targetScale = isAtFinale ? 1.14 : 1.0;
      currentScale += (targetScale - currentScale) * 0.1;

      // Idle breathing sway
      const idleSway = Math.sin(Date.now() * 0.003) * 1.5;

      timelineTraveler.style.transform = `translate3d(${trackX}px, ${currentFlowerY}px, 0) translate(-50%, -50%) rotate(${currentRot + idleSway}deg) scale(${currentScale})`;

      // Update golden stem fill line
      if (timelineStemProgress) {
        const progressHeight = Math.max(0, currentFlowerY - minY);
        timelineStemProgress.style.height = `${progressHeight}px`;
      }

      // Update active rows
      rowData.forEach((item) => {
        const dist = Math.abs(currentFlowerY - item.y);
        if (dist < 26) {
          item.row.classList.add('active-step');
        } else {
          item.row.classList.remove('active-step');
        }
      });

      // Spawn dust trail if moving fast enough
      const now = Date.now();
      if (Math.abs(velocity) > 0.7 && now - lastDustTime > 140) {
        lastDustTime = now;
        spawnTravelerDust(trackX, currentFlowerY);
      }
    }

    requestAnimationFrame(animateFlower);
  }

  // Row click to travel smoothly to event
  if (scheduleTimeline) {
    scheduleTimeline.addEventListener('click', (e) => {
      const row = e.target.closest('.timeline-row');
      if (row) {
        const matched = rowData.find((d) => d.row === row);
        if (matched) {
          lenis.scrollTo(matched.scrollTrigger, { duration: 1.2 });
          burstTravelerBloom(matched.x, matched.y);
        }
      }
    });
  }

  // Click on traveling flower to trigger bloom celebration
  if (timelineTraveler) {
    timelineTraveler.addEventListener('click', (e) => {
      e.stopPropagation();
      burstTravelerBloom(trackX, currentFlowerY);
    });

    timelineTraveler.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        burstTravelerBloom(trackX, currentFlowerY);
      }
    });
  }

  // Filter tab clicks
  if (schedPills.length && timelineParts.length) {
    schedPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        schedPills.forEach((p) => {
          p.classList.remove('active');
          p.setAttribute('aria-selected', 'false');
        });
        pill.classList.add('active');
        pill.setAttribute('aria-selected', 'true');

        const filter = pill.getAttribute('data-filter');
        if (filter === 'all') {
          timelineParts.forEach((part) => {
            part.classList.remove('hidden', 'single-part');
          });
          scheduleTimeline?.classList.remove('single-view');
        } else {
          timelineParts.forEach((part) => {
            if (part.getAttribute('data-day') === filter || part.id === filter) {
              part.classList.remove('hidden');
              part.classList.add('single-part');
            } else {
              part.classList.add('hidden');
              part.classList.remove('single-part');
            }
          });
          scheduleTimeline?.classList.add('single-view');
        }

        // Re-measure after tab transition
        setTimeout(() => {
          updateTimelineLayout();
        }, 60);
      });
    });
  }

  // Setup layout and animation loop
  window.addEventListener('resize', updateTimelineLayout, { passive: true });
  window.addEventListener('scroll', calculateTargetPosition, { passive: true });

  // Initial call after fonts and images render
  setTimeout(() => {
    updateTimelineLayout();
    if (rowData.length) {
      calculateTargetPosition();
      currentFlowerY = targetFlowerY;
    }
  }, 100);

  requestAnimationFrame(animateFlower);
});
