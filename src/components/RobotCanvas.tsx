import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  Camera,
  CameraOff,
  Dices,
  Eye,
  EyeOff,
  FlipHorizontal2,
  Gauge,
  LocateFixed,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { SparkleButton } from './SparkleButton';

export type RobotEmotion =
  | 'normal'
  | 'happy'
  | 'wink'
  | 'curious'
  | 'focus'
  | 'surprised'
  | 'cool'
  | 'thinking';

export type RobotGesture =
  | 'idle'
  | 'wave'
  | 'nod'
  | 'tiltInspect'
  | 'thinkChin'
  | 'cheer'
  | 'lookAround';

export type QualityTier = 'auto' | 'lite' | 'high';

const AUTO_EMOTIONS: RobotEmotion[] = [
  'happy',
  'curious',
  'wink',
  'focus',
  'thinking',
  'cool',
  'surprised',
];

const AUTO_GESTURES: RobotGesture[] = [
  'tiltInspect',
  'nod',
  'wave',
  'thinkChin',
  'lookAround',
  'cheer',
];

interface TrackedPerson {
  id: number;
  cx: number;
  cy: number;
  gy: number;
  bw: number;
  bh: number;
  area: number;
  score: number;
}

interface RobotCanvasProps {
  isNight?: boolean;
  scrollProgress?: number;
}

declare global {
  interface Window {
    FaceDetector?: new (opts?: { maxDetectedFaces?: number; fastMode?: boolean }) => {
      detect: (source: HTMLVideoElement | HTMLCanvasElement) => Promise<
        Array<{ boundingBox: DOMRectReadOnly }>
      >;
    };
  }
}

// Pre-allocated helpers to prevent GC in animation loop
const _lookAtVec = new THREE.Vector3(0, 0.55, 0);
const _ndcVec = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function detectLowEndDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const cores = navigator.hardwareConcurrency || 8;
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 8;
  const smallViewport = window.innerWidth <= 900;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  return cores <= 4 || mem <= 4 || smallViewport || reducedMotion;
}

// Deterministic pseudo-random helper for repeatable procedural textures
function hash2d(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

/**
 * Generates procedural PBR micro-detail maps so ceramic panels, brushed titanium joints,
 * slate pedestal, and grounded contact shadows feel tactile rather than flat plastic blocks.
 */
function createProceduralSurfaceTextures(size: number, maxAnisotropy: number) {
  // 1. Ceramic satin micro-grain + subtle molded panel seam Normal & Roughness maps
  const height = new Float32Array(size * size);
  const roughData = new Uint8Array(size * size * 4);

  const seamA = Math.floor(size * 0.14);
  const seamB = Math.floor(size * 0.86);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = y * size + x;
      const fineNoise = (hash2d(x, y) - 0.5) * 0.14;
      const macroNoise =
        (Math.sin(x * 0.08) * Math.cos(y * 0.08) + Math.sin((x + y) * 0.05)) * 0.06;

      // Subtle precision panel seam near border edges
      const dSeamX = Math.min(Math.abs(x - seamA), Math.abs(x - seamB));
      const dSeamY = Math.min(Math.abs(y - seamA), Math.abs(y - seamB));
      const seamDist = Math.min(dSeamX, dSeamY);
      const seamGroove = seamDist < 2.2 ? -0.45 * (1 - seamDist / 2.2) : 0;

      height[idx] = fineNoise + macroNoise + seamGroove;

      // Roughness variation (satin ceramic ~0.30..0.44, slightly rougher in seam)
      const rVal = Math.max(
        60,
        Math.min(200, Math.round(88 + fineNoise * 95 + (seamGroove < 0 ? 48 : 0)))
      );
      const p4 = idx * 4;
      roughData[p4] = rVal;
      roughData[p4 + 1] = rVal;
      roughData[p4 + 2] = rVal;
      roughData[p4 + 3] = 255;
    }
  }

  const ceramicNormalData = new Uint8Array(size * size * 4);
  const strength = 1.65;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const xm = (x - 1 + size) % size;
      const xp = (x + 1) % size;
      const ym = (y - 1 + size) % size;
      const yp = (y + 1) % size;
      const dx = (height[y * size + xp] - height[y * size + xm]) * strength;
      const dy = (height[yp * size + x] - height[ym * size + x]) * strength;
      const nx = -dx;
      const ny = -dy;
      const nz = 1;
      const len = Math.hypot(nx, ny, nz);
      const p4 = (y * size + x) * 4;
      ceramicNormalData[p4] = Math.round(((nx / len) * 0.5 + 0.5) * 255);
      ceramicNormalData[p4 + 1] = Math.round(((ny / len) * 0.5 + 0.5) * 255);
      ceramicNormalData[p4 + 2] = Math.round(((nz / len) * 0.5 + 0.5) * 255);
      ceramicNormalData[p4 + 3] = 255;
    }
  }

  const ceramicNormalTex = new THREE.DataTexture(ceramicNormalData, size, size, THREE.RGBAFormat);
  ceramicNormalTex.wrapS = THREE.RepeatWrapping;
  ceramicNormalTex.wrapT = THREE.RepeatWrapping;
  ceramicNormalTex.anisotropy = maxAnisotropy;
  ceramicNormalTex.needsUpdate = true;

  const ceramicRoughTex = new THREE.DataTexture(roughData, size, size, THREE.RGBAFormat);
  ceramicRoughTex.wrapS = THREE.RepeatWrapping;
  ceramicRoughTex.wrapT = THREE.RepeatWrapping;
  ceramicRoughTex.anisotropy = maxAnisotropy;
  ceramicRoughTex.needsUpdate = true;

  // 2. Brushed Titanium / Anodized Graphite Normal & Roughness maps (for joints & back plate)
  const metalNormalData = new Uint8Array(size * size * 4);
  const metalRoughData = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    const streak = (hash2d(0, y) - 0.5) * 0.35;
    for (let x = 0; x < size; x++) {
      const micro = (hash2d(x * 0.25, y) - 0.5) * 0.14;
      const ny = Math.max(-0.5, Math.min(0.5, streak + micro));
      const nx = (hash2d(x, y) - 0.5) * 0.08;
      const len = Math.hypot(nx, ny, 1);
      const p4 = (y * size + x) * 4;
      metalNormalData[p4] = Math.round(((nx / len) * 0.5 + 0.5) * 255);
      metalNormalData[p4 + 1] = Math.round(((ny / len) * 0.5 + 0.5) * 255);
      metalNormalData[p4 + 2] = Math.round(((1 / len) * 0.5 + 0.5) * 255);
      metalNormalData[p4 + 3] = 255;

      const mr = Math.max(55, Math.min(185, Math.round(92 + (streak + micro) * 120)));
      metalRoughData[p4] = mr;
      metalRoughData[p4 + 1] = mr;
      metalRoughData[p4 + 2] = mr;
      metalRoughData[p4 + 3] = 255;
    }
  }

  const metalNormalTex = new THREE.DataTexture(metalNormalData, size, size, THREE.RGBAFormat);
  metalNormalTex.wrapS = THREE.RepeatWrapping;
  metalNormalTex.wrapT = THREE.RepeatWrapping;
  metalNormalTex.anisotropy = maxAnisotropy;
  metalNormalTex.needsUpdate = true;

  const metalRoughTex = new THREE.DataTexture(metalRoughData, size, size, THREE.RGBAFormat);
  metalRoughTex.wrapS = THREE.RepeatWrapping;
  metalRoughTex.wrapT = THREE.RepeatWrapping;
  metalRoughTex.anisotropy = maxAnisotropy;
  metalRoughTex.needsUpdate = true;

  // 3. Architectural Brushed Charcoal Slate Texture for Pedestal
  const pedCanvas = document.createElement('canvas');
  pedCanvas.width = size;
  pedCanvas.height = size;
  const pCtx = pedCanvas.getContext('2d')!;
  pCtx.fillStyle = '#1b2434';
  pCtx.fillRect(0, 0, size, size);
  for (let i = 0; i < size * 2; i++) {
    const px = hash2d(i, 1) * size;
    const py = hash2d(1, i) * size;
    const shade = hash2d(i, i) > 0.5 ? 'rgba(255,255,255,0.024)' : 'rgba(2,6,23,0.08)';
    pCtx.fillStyle = shade;
    pCtx.fillRect(px, py, 2 + hash2d(i, 7) * 10, 1.5);
  }
  pCtx.strokeStyle = 'rgba(255,255,255,0.045)';
  pCtx.lineWidth = Math.max(1, size / 128);
  pCtx.strokeRect(size * 0.04, size * 0.04, size * 0.92, size * 0.92);

  const pedestalTex = new THREE.CanvasTexture(pedCanvas);
  pedestalTex.colorSpace = THREE.SRGBColorSpace;
  pedestalTex.anisotropy = maxAnisotropy;

  // 4. Dual-Foot Grounded Contact Shadow Map on Top of Pedestal
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  const sCtx = shadowCanvas.getContext('2d')!;
  sCtx.clearRect(0, 0, 256, 256);

  // Soft wide body AO falloff
  const bodyAo = sCtx.createRadialGradient(128, 132, 16, 128, 132, 108);
  bodyAo.addColorStop(0, 'rgba(2, 6, 23, 0.38)');
  bodyAo.addColorStop(0.55, 'rgba(2, 6, 23, 0.16)');
  bodyAo.addColorStop(1, 'rgba(2, 6, 23, 0)');
  sCtx.fillStyle = bodyAo;
  sCtx.fillRect(0, 0, 256, 256);

  // Left & Right crisp foot contact occlusion ovals
  [88, 168].forEach((fx) => {
    sCtx.save();
    sCtx.translate(fx, 138);
    sCtx.scale(0.85, 1.32);
    const fg = sCtx.createRadialGradient(0, 0, 4, 0, 0, 38);
    fg.addColorStop(0, 'rgba(2, 6, 23, 0.65)');
    fg.addColorStop(0.55, 'rgba(2, 6, 23, 0.3)');
    fg.addColorStop(1, 'rgba(2, 6, 23, 0)');
    sCtx.fillStyle = fg;
    sCtx.beginPath();
    sCtx.arc(0, 0, 38, 0, Math.PI * 2);
    sCtx.fill();
    sCtx.restore();
  });

  const contactShadowTex = new THREE.CanvasTexture(shadowCanvas);
  contactShadowTex.anisotropy = maxAnisotropy;

  return {
    ceramicNormalTex,
    ceramicRoughTex,
    metalNormalTex,
    metalRoughTex,
    pedestalTex,
    contactShadowTex,
  };
}

export const RobotCanvas: React.FC<RobotCanvasProps> = ({
  isNight = false,
  scrollProgress = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const [camActive, setCamActive] = useState(false);
  const [camBusy, setCamBusy] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const [showFeed, setShowFeed] = useState(true);
  const [peopleList, setPeopleList] = useState<TrackedPerson[]>([]);
  const [lockedPersonId, setLockedPersonId] = useState<number | null>(null);
  const [trackingMode, setTrackingMode] = useState<'closest' | 'random_locked'>('closest');
  const [emotion, setEmotion] = useState<RobotEmotion>('normal');
  const [qualityMode, setQualityMode] = useState<QualityTier>('auto');
  const [autoLiteReason, setAutoLiteReason] = useState<boolean>(() => detectLowEndDevice());

  const [speechBubble, setSpeechBubble] = useState<{
    personId: number;
    text: string;
    key: number;
  } | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [mirrorCam, setMirrorCam] = useState<boolean>(() => {
    try {
      const saved = window.localStorage.getItem('nova_cam_mirror');
      if (saved === 'true') return true;
      if (saved === 'false') return false;
    } catch {
      // Ignore storage access errors
    }
    return true;
  });

  const isNightRef = useRef(isNight);
  const scrollProgressRef = useRef(scrollProgress);
  const emotionRef = useRef<RobotEmotion>('normal');
  const autoTriggeredRef = useRef(false);
  const userStoppedCamRef = useRef(false);
  const mirrorCamRef = useRef(mirrorCam);
  const voiceEnabledRef = useRef(voiceEnabled);
  const speakingUntilRef = useRef(0);
  const speechTimerRef = useRef<number | null>(null);

  const emotionResetTimerRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const clearEmotionTimer = () => {
    if (emotionResetTimerRef.current !== null) {
      window.clearTimeout(emotionResetTimerRef.current);
      emotionResetTimerRef.current = null;
    }
  };

  const clearSpeechState = () => {
    if (speechTimerRef.current !== null) {
      window.clearTimeout(speechTimerRef.current);
      speechTimerRef.current = null;
    }
    speakingUntilRef.current = 0;
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch {
      // Ignore speech synthesis errors
    }
  };

  const announceSelectedPerson = (personId: number, speakAudio = true) => {
    if (!mountedRef.current) return;
    if (speechTimerRef.current !== null) {
      window.clearTimeout(speechTimerRef.current);
      speechTimerRef.current = null;
    }
    setSpeechBubble({
      personId,
      text: 'O‘sha shaxs!',
      key: Date.now(),
    });
    speakingUntilRef.current = performance.now() + 1850;
    speechTimerRef.current = window.setTimeout(() => {
      speechTimerRef.current = null;
      if (mountedRef.current) {
        setSpeechBubble(null);
      }
    }, 5200);

    if (speakAudio && voiceEnabledRef.current && typeof window !== 'undefined') {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utter = new SpeechSynthesisUtterance("O'sha shaxs");
          const voices = window.speechSynthesis.getVoices();
          const matchedVoice =
            voices.find((v) => v.lang.toLowerCase().startsWith('uz')) ||
            voices.find((v) => v.lang.toLowerCase().startsWith('tr')) ||
            voices.find((v) => v.lang.toLowerCase().startsWith('ru'));
          if (matchedVoice) utter.voice = matchedVoice;
          utter.lang = matchedVoice?.lang || 'uz-UZ';
          utter.rate = 0.96;
          utter.pitch = 1.06;
          const minAnimUntil = performance.now() + 900;
          utter.onend = () => {
            if (performance.now() >= minAnimUntil) {
              speakingUntilRef.current = 0;
            }
          };
          window.speechSynthesis.speak(utter);
        }
      } catch {
        // Ignore TTS blocks in restricted browsers
      }
    }
  };

  useEffect(() => {
    mirrorCamRef.current = mirrorCam;
  }, [mirrorCam]);

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
    if (!voiceEnabled) {
      speakingUntilRef.current = 0;
      try {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      } catch {
        // Ignore
      }
    }
  }, [voiceEnabled]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearEmotionTimer();
      clearSpeechState();
    };
  }, []);

  // Gesture trigger ref so webcam / click / night-toggle can cue natural gestures
  const gestureStateRef = useRef<{
    name: RobotGesture;
    startedAt: number;
    durationMs: number;
  }>({
    name: 'idle',
    startedAt: 0,
    durationMs: 0,
  });

  const triggerGesture = (
    name: RobotGesture,
    durationMs = 2400,
    coupledEmotion?: RobotEmotion
  ) => {
    gestureStateRef.current = {
      name,
      startedAt: performance.now(),
      durationMs,
    };
    if (coupledEmotion) {
      clearEmotionTimer();
      emotionRef.current = coupledEmotion;
      setEmotion(coupledEmotion);
      emotionResetTimerRef.current = window.setTimeout(() => {
        emotionResetTimerRef.current = null;
        if (!mountedRef.current) return;
        if (emotionRef.current === coupledEmotion) {
          emotionRef.current = 'normal';
          setEmotion('normal');
        }
      }, Math.min(durationMs, 2100));
    }
  };

  const trackedPeopleRef = useRef<TrackedPerson[]>([]);
  const lockedIdRef = useRef<number | null>(null);
  const trackingModeRef = useRef<'closest' | 'random_locked'>('closest');
  const lockedMissingSinceRef = useRef<number>(0);
  const nextIdRef = useRef(1);
  const camTargetRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });
  const camActiveRef = useRef(false);
  const showFeedRef = useRef(true);
  const streamRef = useRef<MediaStream | null>(null);
  const objectDetectorRef = useRef<{
    detectForVideo: (
      videoFrame: HTMLVideoElement,
      timestamp: number
    ) => {
      detections?: Array<{
        boundingBox?: { originX: number; originY: number; width: number; height: number };
        categories?: Array<{ score?: number; categoryName?: string }>;
      }>;
    };
    close: () => void;
  } | null>(null);
  const detectTimerRef = useRef<number | null>(null);
  const prevGrayRef = useRef<Uint8Array | null>(null);
  const lastPeopleSigRef = useRef<string>('');

  const isLiteEffective =
    qualityMode === 'lite' || (qualityMode === 'auto' && autoLiteReason);

  useEffect(() => {
    if (isNightRef.current !== isNight) {
      isNightRef.current = isNight;
      if (isNight) {
        triggerGesture('nod', 1500, 'cool');
      } else {
        triggerGesture('tiltInspect', 1600, 'happy');
      }
    }
  }, [isNight]);

  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    camActiveRef.current = camActive;
  }, [camActive]);

  useEffect(() => {
    showFeedRef.current = showFeed;
  }, [showFeed]);

  // Autonomous periodic facial expressions + subtle physical micro-gestures
  useEffect(() => {
    let emoIdx = 0;
    let gestIdx = 0;
    const interval = window.setInterval(() => {
      if (document.hidden || !mountedRef.current) return;
      // While actively tracking a person via camera, keep eyes focused cleanly on the target
      if (camActiveRef.current && camTargetRef.current.active) return;
      const nextEmo = AUTO_EMOTIONS[emoIdx % AUTO_EMOTIONS.length];
      emoIdx++;
      clearEmotionTimer();
      emotionRef.current = nextEmo;
      setEmotion(nextEmo);

      // Pair expression with natural physical body gesture when idle
      if (gestureStateRef.current.name === 'idle') {
        const nextGest = AUTO_GESTURES[gestIdx % AUTO_GESTURES.length];
        gestIdx++;
        const matchedGest: RobotGesture =
          nextEmo === 'happy' || nextEmo === 'wink'
            ? nextGest === 'cheer'
              ? 'cheer'
              : 'wave'
            : nextEmo === 'thinking'
            ? 'thinkChin'
            : nextEmo === 'curious'
            ? 'tiltInspect'
            : nextGest;
        gestureStateRef.current = {
          name: matchedGest,
          startedAt: performance.now(),
          durationMs: matchedGest === 'wave' || matchedGest === 'cheer' ? 2300 : 2100,
        };
      }

      emotionResetTimerRef.current = window.setTimeout(() => {
        emotionResetTimerRef.current = null;
        if (!mountedRef.current) return;
        if (emotionRef.current === nextEmo) {
          emotionRef.current = 'normal';
          setEmotion('normal');
        }
      }, 2100);
    }, 5400);

    return () => {
      clearInterval(interval);
      clearEmotionTimer();
    };
  }, []);

  // Three.js Realistic Boxy Ceramic Robot Scene
  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let rafId = 0;
    let paceTimeout: number | null = null;
    let disposed = false;

    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [];
    const texturesToDispose: THREE.Texture[] = [];
    const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
      geometriesToDispose.push(g);
      return g;
    };
    const trackMat = <T extends THREE.Material>(m: T): T => {
      materialsToDispose.push(m);
      return m;
    };
    const trackTex = <T extends THREE.Texture>(t: T): T => {
      texturesToDispose.push(t);
      return t;
    };

    const getSize = () => ({
      w: Math.max(host.clientWidth, 320),
      h: Math.max(host.clientHeight, 360),
    });

    const probeCanvas = document.createElement('canvas');
    const probeGl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    let isSoftwareGl = false;
    if (probeGl) {
      const dbg = probeGl.getExtension('WEBGL_debug_renderer_info');
      const rStr = dbg ? String(probeGl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
      isSoftwareGl = /SwiftShader|llvmpipe|Software|Basic Render/i.test(rStr);
      probeGl.getExtension('WEBGL_lose_context')?.loseContext();
    }
    probeCanvas.width = 0;
    probeCanvas.height = 0;

    const useLite =
      qualityMode === 'lite' ||
      (qualityMode === 'auto' && (isSoftwareGl || detectLowEndDevice()));

    if (useLite && qualityMode === 'auto' && !autoLiteReason) {
      setAutoLiteReason(true);
    }

    const { w: initW, h: initH } = getSize();
    renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: useLite ? 'low-power' : 'high-performance',
    });
    const maxDpr = useLite ? 1.25 : 2;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, maxDpr));
    renderer.setSize(initW, initH);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.shadowMap.enabled = !useLite && !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    host.appendChild(renderer.domElement);

    const maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy() || 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, initW / initH, 0.1, 60);
    const mobileScale = initW <= 900 ? 1.24 : 1;
    camera.position.set(0, 1.1, 11.6 * mobileScale);
    camera.lookAt(0, 0.55, 0);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRT = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    scene.environmentIntensity = useLite ? 0.85 : 1.02;
    roomEnv.dispose();

    // Studio Warm/Cool 3-Point Rig (Strong depth & bevel highlights without overblowing white shell)
    const hemi = new THREE.HemisphereLight(0xf2f7ff, 0x94a3b8, 0.68);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.85);
    keyLight.position.set(-3.4, 5.4, 4.4);
    if (!useLite && !isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 18;
      keyLight.shadow.camera.left = -2.6;
      keyLight.shadow.camera.right = 2.6;
      keyLight.shadow.camera.top = 2.8;
      keyLight.shadow.camera.bottom = -2.8;
      keyLight.shadow.radius = 5;
      keyLight.shadow.bias = -0.0004;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xdbeafe, 1.35);
    rimLight.position.set(4.2, 2.4, -3.8);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0x60a5fa, 1.9, 7, 1.5);
    fillLight.position.set(-3.2, 1.2, 1.1);
    scene.add(fillLight);

    const nightAuraLight = new THREE.PointLight(0x2563eb, 0, 10, 1.4);
    nightAuraLight.position.set(0, 1.25, 2.45);
    scene.add(nightAuraLight);

    // Subtle screen bounce light onto chest & chin in night mode
    const screenBounceLight = new THREE.PointLight(0x38bdf8, 0, 2.8, 2);
    screenBounceLight.position.set(0, 1.08, 1.12);
    scene.add(screenBounceLight);

    // Procedural PBR Surface Textures
    const texSize = useLite ? 128 : 256;
    const {
      ceramicNormalTex,
      ceramicRoughTex,
      metalNormalTex,
      metalRoughTex,
      pedestalTex,
      contactShadowTex,
    } = createProceduralSurfaceTextures(texSize, maxAnisotropy);
    trackTex(ceramicNormalTex);
    trackTex(ceramicRoughTex);
    trackTex(metalNormalTex);
    trackTex(metalRoughTex);
    trackTex(pedestalTex);
    trackTex(contactShadowTex);

    // Tactile White-Ceramic & Brushed Graphite Materials (strong roughness & metalness contrast)
    const shellMat = trackMat(
      useLite
        ? new THREE.MeshStandardMaterial({
            color: 0xe9eef5,
            roughness: 0.42,
            roughnessMap: ceramicRoughTex,
            normalMap: ceramicNormalTex,
            normalScale: new THREE.Vector2(0.28, 0.28),
            metalness: 0.05,
          })
        : new THREE.MeshPhysicalMaterial({
            color: 0xe9eef5,
            roughness: 0.4,
            roughnessMap: ceramicRoughTex,
            normalMap: ceramicNormalTex,
            normalScale: new THREE.Vector2(0.32, 0.32),
            metalness: 0.04,
            clearcoat: 0.58,
            clearcoatRoughness: 0.24,
            envMapIntensity: 1.05,
          })
    );

    const shellLightMat = trackMat(
      useLite
        ? new THREE.MeshStandardMaterial({
            color: 0xf8fafc,
            roughness: 0.34,
            roughnessMap: ceramicRoughTex,
            normalMap: ceramicNormalTex,
            normalScale: new THREE.Vector2(0.22, 0.22),
            metalness: 0.04,
          })
        : new THREE.MeshPhysicalMaterial({
            color: 0xf8fafc,
            roughness: 0.32,
            roughnessMap: ceramicRoughTex,
            normalMap: ceramicNormalTex,
            normalScale: new THREE.Vector2(0.25, 0.25),
            metalness: 0.03,
            clearcoat: 0.65,
            clearcoatRoughness: 0.2,
            envMapIntensity: 1.1,
          })
    );

    const jointsMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.36,
        roughnessMap: metalRoughTex,
        normalMap: metalNormalTex,
        normalScale: new THREE.Vector2(0.35, 0.35),
        metalness: 0.72,
        envMapIntensity: 1.2,
      })
    );

    const chromeRingMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.22,
        roughnessMap: metalRoughTex,
        metalness: 0.88,
        envMapIntensity: 1.35,
      })
    );

    const deepDarkMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x0b1120,
        roughness: 0.48,
        metalness: 0.45,
      })
    );

    const pedestalMat = trackMat(
      new THREE.MeshStandardMaterial({
        map: pedestalTex,
        color: 0xffffff,
        roughness: 0.84,
        metalness: 0.1,
      })
    );

    // Conic Gradient Texture for Face Ring (Cobalt Blue -> Electric Cyan -> Sky)
    const ringSize = useLite ? 256 : 512;
    const ringCanvas = document.createElement('canvas');
    ringCanvas.width = ringSize;
    ringCanvas.height = ringSize;
    const rCtx = ringCanvas.getContext('2d')!;
    const halfR = ringSize / 2;
    const conic = rCtx.createConicGradient((200 * Math.PI) / 180, halfR, halfR);
    conic.addColorStop(0.0, '#1d4ed8');
    conic.addColorStop(0.18, '#2563eb');
    conic.addColorStop(0.36, '#0284c7');
    conic.addColorStop(0.52, '#38bdf8');
    conic.addColorStop(0.7, '#0ea5e9');
    conic.addColorStop(0.86, '#2563eb');
    conic.addColorStop(1.0, '#1d4ed8');
    rCtx.fillStyle = conic;
    rCtx.fillRect(0, 0, ringSize, ringSize);
    const ringTex = trackTex(new THREE.CanvasTexture(ringCanvas));
    ringTex.colorSpace = THREE.SRGBColorSpace;
    ringTex.anisotropy = maxAnisotropy;

    const ringMat = trackMat(
      useLite
        ? new THREE.MeshStandardMaterial({
            map: ringTex,
            emissiveMap: ringTex,
            emissive: new THREE.Color(0xffffff),
            emissiveIntensity: 0.24,
            roughness: 0.36,
            metalness: 0.08,
          })
        : new THREE.MeshPhysicalMaterial({
            map: ringTex,
            emissiveMap: ringTex,
            emissive: new THREE.Color(0xffffff),
            emissiveIntensity: 0.24,
            roughness: 0.34,
            clearcoat: 0.55,
            clearcoatRoughness: 0.18,
          })
    );

    // Crisp High-PPI OLED Face Screen Texture (512x512 High, 384x384 Lite)
    const faceSize = useLite ? 384 : 512;
    const faceScale = faceSize / 512;
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = faceSize;
    faceCanvas.height = faceSize;
    const fCtx = faceCanvas.getContext('2d')!;
    const faceTex = trackTex(new THREE.CanvasTexture(faceCanvas));
    faceTex.colorSpace = THREE.SRGBColorSpace;
    faceTex.anisotropy = maxAnisotropy;

    const screenMat = trackMat(
      useLite
        ? new THREE.MeshStandardMaterial({
            color: 0x050811,
            roughness: 0.16,
            emissive: new THREE.Color(0xffffff),
            emissiveMap: faceTex,
            emissiveIntensity: 1.55,
          })
        : new THREE.MeshPhysicalMaterial({
            color: 0x050811,
            roughness: 0.1,
            clearcoat: 1,
            clearcoatRoughness: 0.06,
            emissive: new THREE.Color(0xffffff),
            emissiveMap: faceTex,
            emissiveIntensity: 1.62,
          })
    );

    // Recessed Optical Cover Glass directly in front of OLED screen
    const visorGlassMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        roughness: 0.06,
        metalness: 0.05,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
        envMapIntensity: 1.6,
      })
    );

    const makeRoundedRectShape = (w: number, h: number, r: number) => {
      const s = new THREE.Shape();
      const x = -w / 2;
      const y = -h / 2;
      s.moveTo(x + r, y);
      s.lineTo(x + w - r, y);
      s.quadraticCurveTo(x + w, y, x + w, y + r);
      s.lineTo(x + w, y + h - r);
      s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      s.lineTo(x + r, y + h);
      s.quadraticCurveTo(x, y + h, x, y + h - r);
      s.lineTo(x, y + r);
      s.quadraticCurveTo(x, y, x + r, y);
      return s;
    };

    const seg = (highVal: number) => (useLite ? Math.max(2, Math.floor(highVal / 2)) : highVal);

    const robotRoot = new THREE.Group();
    scene.add(robotRoot);

    // Chamfered Charcoal Slate Pedestal (exact 1.7 x 1.6 x 1.7 footprint, flush top at y = -1.42)
    const pedestal = new THREE.Mesh(
      trackGeo(new RoundedBoxGeometry(1.7, 1.6, 1.7, seg(3), 0.032)),
      pedestalMat
    );
    pedestal.position.set(0, -2.22, 0);
    pedestal.receiveShadow = !useLite;
    robotRoot.add(pedestal);

    // Grounded Contact Shadow Plane right under the robot's feet on pedestal top
    const contactShadowMat = trackMat(
      new THREE.MeshBasicMaterial({
        map: contactShadowTex,
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      })
    );
    const contactShadowPlane = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(1.26, 1.06)),
      contactShadowMat
    );
    contactShadowPlane.rotation.x = -Math.PI / 2;
    contactShadowPlane.position.set(0, -1.418, 0.06);
    robotRoot.add(contactShadowPlane);

    // Base stance group (keeps feet firmly grounded on pedestal while upper body shifts weight & breathes)
    const bodyGroup = new THREE.Group();
    robotRoot.add(bodyGroup);

    const legsGroup = new THREE.Group();
    bodyGroup.add(legsGroup);

    // Legs & Feet (exact original proportions + precision ankle/hip mechanical collars)
    [-0.28, 0.28].forEach((lx) => {
      const hip = new THREE.Mesh(
        trackGeo(new THREE.SphereGeometry(0.14, useLite ? 12 : 20, useLite ? 10 : 18)),
        jointsMat
      );
      hip.position.set(lx, -0.72, 0);
      legsGroup.add(hip);

      const hipCollar = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.135, 0.145, 0.035, useLite ? 14 : 22)),
        chromeRingMat
      );
      hipCollar.position.set(lx, -0.785, 0);
      legsGroup.add(hipCollar);

      const leg = new THREE.Mesh(
        trackGeo(new RoundedBoxGeometry(0.32, 0.38, 0.34, seg(4), 0.08)),
        shellMat
      );
      leg.position.set(lx, -0.96, 0.01);
      leg.castShadow = !useLite;
      leg.receiveShadow = !useLite;
      legsGroup.add(leg);

      const ankle = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.1, 0.105, 0.12, useLite ? 12 : 20)),
        jointsMat
      );
      ankle.position.set(lx, -1.18, 0.02);
      legsGroup.add(ankle);

      const ankleCuff = new THREE.Mesh(
        trackGeo(new THREE.TorusGeometry(0.106, 0.014, 8, useLite ? 14 : 22)),
        chromeRingMat
      );
      ankleCuff.rotation.x = Math.PI / 2;
      ankleCuff.position.set(lx, -1.23, 0.02);
      legsGroup.add(ankleCuff);

      const foot = new THREE.Mesh(
        trackGeo(new RoundedBoxGeometry(0.36, 0.18, 0.54, seg(4), 0.07)),
        shellLightMat
      );
      foot.position.set(lx, -1.33, 0.09);
      foot.castShadow = !useLite;
      foot.receiveShadow = !useLite;
      legsGroup.add(foot);
    });

    // Articulated Upper-Body Pivot at Hip/Pelvis (y = -0.58) so torso leans, breathes, and gestures cleanly
    const upperPivot = new THREE.Group();
    upperPivot.position.set(0, -0.58, 0);
    bodyGroup.add(upperPivot);

    const upperBody = new THREE.Group();
    upperBody.position.set(0, 0.58, 0);
    upperPivot.add(upperBody);

    const pelvis = new THREE.Mesh(
      trackGeo(new RoundedBoxGeometry(0.96, 0.2, 0.72, seg(4), 0.07)),
      jointsMat
    );
    pelvis.position.set(0, -0.58, 0);
    pelvis.castShadow = !useLite;
    upperBody.add(pelvis);

    // Waist mechanical gasket seam between pelvis & torso
    const waistGasket = new THREE.Mesh(
      trackGeo(new RoundedBoxGeometry(0.86, 0.055, 0.64, seg(3), 0.025)),
      deepDarkMat
    );
    waistGasket.position.set(0, -0.49, 0);
    upperBody.add(waistGasket);

    const torso = new THREE.Mesh(
      trackGeo(new RoundedBoxGeometry(1.22, 1.12, 0.92, seg(5), 0.24)),
      shellMat
    );
    torso.position.set(0, 0.02, 0);
    torso.castShadow = !useLite;
    torso.receiveShadow = !useLite;
    upperBody.add(torso);

    const chestSlab = new THREE.Mesh(
      trackGeo(new RoundedBoxGeometry(0.88, 0.3, 0.14, seg(4), 0.08)),
      shellLightMat
    );
    chestSlab.position.set(0, 0.34, 0.44);
    chestSlab.castShadow = !useLite;
    chestSlab.receiveShadow = !useLite;
    upperBody.add(chestSlab);

    // Three dynamic chest status LEDs (Cyan, Cobalt Blue, Emerald) with metallic bezels
    const ledColors = [0x38bdf8, 0x2563eb, 0x10b981];
    const ledMats: THREE.MeshStandardMaterial[] = [];
    [-0.17, 0, 0.17].forEach((lx, i) => {
      const bezelRing = new THREE.Mesh(
        trackGeo(new THREE.TorusGeometry(0.04, 0.008, 8, useLite ? 12 : 18)),
        chromeRingMat
      );
      bezelRing.position.set(lx, 0.34, 0.508);
      upperBody.add(bezelRing);

      const ledMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: ledColors[i],
          emissive: ledColors[i],
          emissiveIntensity: 1.35,
          roughness: 0.18,
          metalness: 0.1,
        })
      );
      ledMats.push(ledMat);
      const led = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.035, 0.035, 0.03, useLite ? 12 : 20)),
        ledMat
      );
      led.rotation.x = Math.PI / 2;
      led.position.set(lx, 0.34, 0.508);
      upperBody.add(led);
    });

    [-0.2, 0.2].forEach((sx) => {
      const slot = new THREE.Mesh(
        trackGeo(new RoundedBoxGeometry(0.085, 0.3, 0.05, seg(3), 0.03)),
        deepDarkMat
      );
      slot.position.set(sx, -0.08, 0.45);
      upperBody.add(slot);

      const lip = new THREE.Mesh(
        trackGeo(new THREE.TorusGeometry(0.068, 0.024, useLite ? 8 : 12, useLite ? 14 : 20, Math.PI)),
        jointsMat
      );
      lip.position.set(sx, 0.09, 0.465);
      upperBody.add(lip);
    });

    // Articulated Arms (shoulder + upper arm + elbow + forearm + cuff + hand + thumb)
    const arms: Array<{
      shoulder: THREE.Group;
      forearm: THREE.Group;
      side: number;
    }> = [];

    [-1, 1].forEach((side) => {
      const shoulder = new THREE.Group();
      shoulder.position.set(side * 0.72, 0.36, 0);
      shoulder.rotation.z = side * 0.16;

      const sBall = new THREE.Mesh(
        trackGeo(new THREE.SphereGeometry(0.16, useLite ? 12 : 20, useLite ? 10 : 20)),
        jointsMat
      );
      shoulder.add(sBall);

      const sCollar = new THREE.Mesh(
        trackGeo(new THREE.TorusGeometry(0.145, 0.015, 8, useLite ? 14 : 22)),
        chromeRingMat
      );
      sCollar.rotation.y = Math.PI / 2;
      sCollar.position.set(-side * 0.09, 0, 0);
      shoulder.add(sCollar);

      const upperArm = new THREE.Mesh(
        trackGeo(new RoundedBoxGeometry(0.24, 0.38, 0.24, seg(4), 0.08)),
        shellMat
      );
      upperArm.position.set(0, -0.24, 0);
      upperArm.castShadow = !useLite;
      upperArm.receiveShadow = !useLite;
      shoulder.add(upperArm);

      const elbow = new THREE.Mesh(
        trackGeo(new THREE.SphereGeometry(0.12, useLite ? 12 : 18, useLite ? 10 : 18)),
        jointsMat
      );
      elbow.position.set(0, -0.45, 0);
      shoulder.add(elbow);

      const elbowRing = new THREE.Mesh(
        trackGeo(new THREE.TorusGeometry(0.118, 0.012, 8, useLite ? 12 : 20)),
        chromeRingMat
      );
      elbowRing.rotation.y = Math.PI / 2;
      elbowRing.position.set(0, -0.45, 0);
      shoulder.add(elbowRing);

      const forearm = new THREE.Group();
      forearm.position.set(0, -0.45, 0);
      forearm.rotation.x = -0.35;

      const wristCuff = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.105, 0.11, 0.05, useLite ? 12 : 18)),
        jointsMat
      );
      wristCuff.position.set(0, -0.06, 0);
      forearm.add(wristCuff);

      const handBlock = new THREE.Mesh(
        trackGeo(new RoundedBoxGeometry(0.25, 0.34, 0.25, seg(4), 0.08)),
        shellLightMat
      );
      handBlock.position.set(0, -0.22, 0);
      handBlock.castShadow = !useLite;
      handBlock.receiveShadow = !useLite;
      forearm.add(handBlock);

      const thumb = new THREE.Mesh(
        trackGeo(new RoundedBoxGeometry(0.08, 0.14, 0.09, seg(3), 0.03)),
        shellLightMat
      );
      thumb.position.set(-side * 0.13, -0.18, 0.09);
      forearm.add(thumb);

      shoulder.add(forearm);
      upperBody.add(shoulder);
      arms.push({ shoulder, forearm, side });
    });

    // Articulated Neck + Precision Ribbed Collar
    const neck = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.19, 0.23, 0.26, useLite ? 14 : 24)),
      jointsMat
    );
    neck.position.set(0, 0.68, 0);
    upperBody.add(neck);

    const neckCollar = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.235, 0.022, 8, useLite ? 16 : 26)),
      chromeRingMat
    );
    neckCollar.rotation.x = Math.PI / 2;
    neckCollar.position.set(0, 0.59, 0);
    upperBody.add(neckCollar);

    const neckMidRib = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.205, 0.016, 8, useLite ? 16 : 24)),
      deepDarkMat
    );
    neckMidRib.rotation.x = Math.PI / 2;
    neckMidRib.position.set(0, 0.69, 0);
    upperBody.add(neckMidRib);

    const headPivot = new THREE.Group();
    headPivot.position.set(0, 0.78, 0);
    upperBody.add(headPivot);

    const headInner = new THREE.Group();
    headInner.position.set(0, 0.78, 0);
    headPivot.add(headInner);

    const skull = new THREE.Mesh(
      trackGeo(new RoundedBoxGeometry(1.5, 1.42, 1.3, seg(6), 0.2)),
      shellMat
    );
    skull.castShadow = !useLite;
    skull.receiveShadow = !useLite;
    headInner.add(skull);

    const backBlock = new THREE.Mesh(
      trackGeo(new RoundedBoxGeometry(1.28, 1.14, 0.9, seg(4), 0.14)),
      jointsMat
    );
    backBlock.position.set(0, 0, -0.28);
    headInner.add(backBlock);

    // Batched InstancedMesh for all 26 dark back circuit bars (1 draw call)
    const barGeo = trackGeo(new THREE.BoxGeometry(1, 1, 1));
    const barInstanced = new THREE.InstancedMesh(barGeo, deepDarkMat, 26);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 26; i++) {
      const onTop = i % 3 === 0;
      const bw = 0.05 + ((i * 17) % 10) * 0.012;
      const bh = 0.03 + ((i * 7) % 5) * 0.008;
      dummy.scale.set(bw, onTop ? 0.025 : bh, onTop ? bh : 0.025);
      if (onTop) {
        dummy.position.set(
          -0.46 + ((i * 37) % 92) * 0.01,
          0.58,
          -0.58 + ((i * 19) % 45) * 0.01
        );
      } else {
        dummy.position.set(
          -0.48 + ((i * 29) % 96) * 0.01,
          -0.4 + ((i * 23) % 80) * 0.01,
          -0.735
        );
      }
      dummy.updateMatrix();
      barInstanced.setMatrixAt(i, dummy.matrix);
    }
    barInstanced.instanceMatrix.needsUpdate = true;
    barInstanced.computeBoundingSphere();
    headInner.add(barInstanced);

    const ringOuter = makeRoundedRectShape(1.5, 1.44, 0.3);
    ringOuter.holes.push(makeRoundedRectShape(1.08, 1.02, 0.2));
    const ringGeo = trackGeo(
      new THREE.ExtrudeGeometry(ringOuter, {
        depth: 0.1,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.03,
        bevelSegments: useLite ? 2 : 4,
      })
    );
    const rPos = ringGeo.attributes.position;
    const rUv = ringGeo.attributes.uv;
    for (let i = 0; i < rPos.count; i++) {
      rUv.setXY(i, (rPos.getX(i) + 0.78) / 1.56, (rPos.getY(i) + 0.75) / 1.5);
    }
    rUv.needsUpdate = true;
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(0, 0, 0.6);
    headInner.add(ringMesh);

    const bezelShape = makeRoundedRectShape(1.12, 1.06, 0.2);
    bezelShape.holes.push(makeRoundedRectShape(0.9, 0.84, 0.14));
    const bezelGeo = trackGeo(
      new THREE.ExtrudeGeometry(bezelShape, {
        depth: 0.06,
        bevelEnabled: true,
        bevelThickness: 0.015,
        bevelSize: 0.015,
        bevelSegments: useLite ? 1 : 2,
      })
    );
    const bezelMesh = new THREE.Mesh(bezelGeo, shellLightMat);
    bezelMesh.position.set(0, 0, 0.62);
    headInner.add(bezelMesh);

    // Subtle Optical Camera Pinhole Sensor centered on top bezel
    const sensorHousing = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.032, 0.032, 0.02, 16)),
      deepDarkMat
    );
    sensorHousing.rotation.x = Math.PI / 2;
    sensorHousing.position.set(0, 0.472, 0.688);
    headInner.add(sensorHousing);

    const sensorLensMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        emissive: 0x0284c7,
        emissiveIntensity: 0.35,
        roughness: 0.1,
        metalness: 0.6,
      })
    );
    const sensorLens = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.016, 12, 10)),
      sensorLensMat
    );
    sensorLens.position.set(0, 0.472, 0.694);
    headInner.add(sensorLens);

    const screenShape = makeRoundedRectShape(0.9, 0.84, 0.14);
    const screenGeo = trackGeo(new THREE.ShapeGeometry(screenShape));
    const sPos = screenGeo.attributes.position;
    const sUv = screenGeo.attributes.uv;
    for (let i = 0; i < sPos.count; i++) {
      sUv.setXY(i, (sPos.getX(i) + 0.45) / 0.9, (sPos.getY(i) + 0.42) / 0.84);
    }
    sUv.needsUpdate = true;
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 0, 0.66);
    headInner.add(screenMesh);

    // Thin curved optical glass layer slightly ahead of OLED screen
    const screenGlass = new THREE.Mesh(screenGeo, visorGlassMat);
    screenGlass.position.set(0, 0, 0.672);
    screenGlass.renderOrder = 2;
    headInner.add(screenGlass);

    [-1, 1].forEach((side) => {
      const earBase = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.22, 0.22, 0.1, useLite ? 14 : 28)),
        jointsMat
      );
      earBase.rotation.z = Math.PI / 2;
      earBase.position.set(side * 0.77, 0.06, -0.02);
      headInner.add(earBase);

      const earRim = new THREE.Mesh(
        trackGeo(new THREE.TorusGeometry(0.205, 0.012, 8, useLite ? 16 : 26)),
        chromeRingMat
      );
      earRim.rotation.y = Math.PI / 2;
      earRim.position.set(side * 0.822, 0.06, -0.02);
      headInner.add(earRim);

      const earCap = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.15, 0.15, 0.13, useLite ? 12 : 24)),
        deepDarkMat
      );
      earCap.rotation.z = Math.PI / 2;
      earCap.position.set(side * 0.78, 0.06, -0.02);
      headInner.add(earCap);
    });

    const cable = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.28, 0.04, useLite ? 8 : 12, useLite ? 16 : 28, Math.PI)),
      jointsMat
    );
    cable.rotation.y = Math.PI / 2;
    cable.rotation.x = Math.PI;
    cable.position.set(0.76, -0.12, -0.02);
    headInner.add(cable);

    // High-PPI OLED Face Renderer (Subpixel grid, luminous iris, corneal catchlight, cam brackets)
    let lastDrawn = {
      gx: 99,
      gy: 99,
      blink: -1,
      night: !isNightRef.current,
      emo: '' as RobotEmotion | '',
      camOn: false,
      pupilPulse: -1,
      speakWave: -1,
    };

    const drawFaceIfDirty = (
      gx: number,
      gy: number,
      blinkScaleY: number,
      night: boolean,
      emo: RobotEmotion,
      camOn: boolean,
      pupilPulse: number,
      speakWave: number
    ) => {
      const moved =
        Math.abs(gx - lastDrawn.gx) > 0.008 ||
        Math.abs(gy - lastDrawn.gy) > 0.008 ||
        Math.abs(blinkScaleY - lastDrawn.blink) > 0.02 ||
        night !== lastDrawn.night ||
        emo !== lastDrawn.emo ||
        camOn !== lastDrawn.camOn ||
        Math.abs(pupilPulse - lastDrawn.pupilPulse) > 0.05 ||
        Math.abs(speakWave - lastDrawn.speakWave) > 0.08;

      if (!moved) return;

      lastDrawn = { gx, gy, blink: blinkScaleY, night, emo, camOn, pupilPulse, speakWave };

      fCtx.save();
      fCtx.setTransform(faceScale, 0, 0, faceScale, 0, 0);

      // Deep OLED black with recessed inner depth gradient
      fCtx.fillStyle = '#03060c';
      fCtx.fillRect(0, 0, 512, 512);

      const bgGlow = fCtx.createRadialGradient(256, 256, 28, 256, 256, 252);
      if (night) {
        bgGlow.addColorStop(
          0,
          emo === 'cool' ? 'rgba(56, 189, 248, 0.38)' : 'rgba(37, 99, 235, 0.42)'
        );
        bgGlow.addColorStop(0.55, 'rgba(14, 165, 233, 0.14)');
      } else {
        bgGlow.addColorStop(0, 'rgba(30, 58, 138, 0.14)');
        bgGlow.addColorStop(0.65, 'rgba(15, 23, 42, 0.06)');
      }
      bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
      fCtx.fillStyle = bgGlow;
      fCtx.fillRect(0, 0, 512, 512);

      // Gaze displacement + subtle perspective foreshortening when looking sideways
      const ox = gx * 36;
      const oy = gy * 26;
      const perspL = 1 - Math.max(0, -gx) * 0.08;
      const perspR = 1 - Math.max(0, gx) * 0.08;
      const lx = 194 + ox;
      const ly = 260 + oy;
      const rx = 318 + ox;
      const ry = 252 + oy;

      const drawLuminousEye = (
        cx: number,
        cy: number,
        radX: number,
        radY: number,
        isCuriousSubtle = false
      ) => {
        // Soft OLED backlight halo around eye (no shadowBlur cost)
        const halo = fCtx.createRadialGradient(cx, cy, radX * 0.4, cx, cy, radX * 2.1);
        halo.addColorStop(
          0,
          night ? 'rgba(56, 189, 248, 0.38)' : 'rgba(224, 242, 254, 0.22)'
        );
        halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
        fCtx.fillStyle = halo;
        fCtx.beginPath();
        fCtx.arc(cx, cy, radX * 2.1, 0, Math.PI * 2);
        fCtx.fill();

        // Main OLED iris body with vertical luminous gradient
        const grad = fCtx.createLinearGradient(cx, cy - radY, cx, cy + radY);
        if (night) {
          grad.addColorStop(0, '#e0f2fe');
          grad.addColorStop(0.45, emo === 'cool' ? '#22d3ee' : '#38bdf8');
          grad.addColorStop(1, emo === 'cool' ? '#10b981' : '#2563eb');
        } else {
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.65, '#f1f5f9');
          grad.addColorStop(1, '#cbd5e1');
        }
        fCtx.fillStyle = grad;
        fCtx.beginPath();
        fCtx.ellipse(cx, cy, radX, Math.max(3.5, radY), 0, 0, Math.PI * 2);
        fCtx.fill();

        // Subtle inner iris ring & living corneal catchlight when eye is open
        if (radY > 14) {
          if (camOn || isCuriousSubtle || emo === 'curious') {
            const pRad = Math.max(5, Math.min(11, 8 + pupilPulse * 2.2));
            fCtx.fillStyle = night ? 'rgba(15, 23, 42, 0.35)' : 'rgba(37, 99, 235, 0.16)';
            fCtx.beginPath();
            fCtx.arc(cx + gx * 3.5, cy + gy * 3.5, pRad, 0, Math.PI * 2);
            fCtx.fill();
          }

          // Primary bright corneal catchlight glint (gives instant living depth)
          fCtx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          fCtx.beginPath();
          fCtx.arc(cx - radX * 0.28 + gx * 2, cy - radY * 0.34 + gy * 2, 4.6, 0, Math.PI * 2);
          fCtx.fill();

          // Secondary micro catchlight
          fCtx.fillStyle = 'rgba(224, 242, 254, 0.72)';
          fCtx.beginPath();
          fCtx.arc(cx + radX * 0.25, cy + radY * 0.26, 2.1, 0, Math.PI * 2);
          fCtx.fill();
        }
      };

      const makeStrokeStyle = () => {
        if (!night) return '#f8fafc';
        const g = fCtx.createLinearGradient(140, 180, 380, 320);
        if (emo === 'cool') {
          g.addColorStop(0, '#22d3ee');
          g.addColorStop(1, '#10b981');
        } else {
          g.addColorStop(0, '#7dd3fc');
          g.addColorStop(1, '#2563eb');
        }
        return g;
      };
      const strokeStyle = makeStrokeStyle();

      if (emo === 'happy') {
        fCtx.strokeStyle = strokeStyle;
        fCtx.lineWidth = 15;
        fCtx.lineCap = 'round';
        [
          [lx, ly],
          [rx, ry],
        ].forEach(([cx, cy]) => {
          const halo = fCtx.createRadialGradient(cx, cy, 8, cx, cy, 56);
          halo.addColorStop(0, night ? 'rgba(56,189,248,0.28)' : 'rgba(255,255,255,0.14)');
          halo.addColorStop(1, 'rgba(0,0,0,0)');
          fCtx.fillStyle = halo;
          fCtx.beginPath();
          fCtx.arc(cx, cy, 56, 0, Math.PI * 2);
          fCtx.fill();

          fCtx.beginPath();
          fCtx.arc(cx, cy + 12, 30, Math.PI * 1.14, Math.PI * 1.86);
          fCtx.stroke();
        });
      } else if (emo === 'focus') {
        fCtx.strokeStyle = night ? '#38bdf8' : '#e2e8f0';
        fCtx.lineWidth = 8.5;
        fCtx.lineJoin = 'round';
        [
          [lx, ly],
          [rx, ry],
        ].forEach(([cx, cy]) => {
          fCtx.beginPath();
          fCtx.moveTo(cx, cy - 34);
          fCtx.lineTo(cx + 30, cy);
          fCtx.lineTo(cx, cy + 34);
          fCtx.lineTo(cx - 30, cy);
          fCtx.closePath();
          fCtx.stroke();

          fCtx.fillStyle = night ? '#38bdf8' : '#ffffff';
          fCtx.beginPath();
          fCtx.arc(cx + gx * 3, cy + gy * 3, 10 + pupilPulse * 2, 0, Math.PI * 2);
          fCtx.fill();
        });
      } else if (emo === 'wink') {
        drawLuminousEye(lx, ly, 30 * perspL, 38 * blinkScaleY);

        fCtx.strokeStyle = strokeStyle;
        fCtx.lineWidth = 14;
        fCtx.lineCap = 'round';
        fCtx.beginPath();
        fCtx.arc(rx, ry + 10, 28, Math.PI * 1.15, Math.PI * 1.85);
        fCtx.stroke();
      } else if (emo === 'surprised') {
        [
          [lx, ly, 38 * perspL],
          [rx, ry, 38 * perspR],
        ].forEach(([cx, cy, rad]) => {
          drawLuminousEye(cx, cy, rad, 40 * blinkScaleY);
          fCtx.fillStyle = '#04070f';
          fCtx.beginPath();
          fCtx.arc(cx + gx * 3, cy + gy * 3, 12, 0, Math.PI * 2);
          fCtx.fill();
          fCtx.fillStyle = '#ffffff';
          fCtx.beginPath();
          fCtx.arc(cx - 8, cy - 10, 4.5, 0, Math.PI * 2);
          fCtx.fill();
        });
      } else if (emo === 'cool') {
        const visorGrad = fCtx.createLinearGradient(128, 232, 384, 282);
        visorGrad.addColorStop(0, '#38bdf8');
        visorGrad.addColorStop(0.5, '#2563eb');
        visorGrad.addColorStop(1, '#10b981');
        fCtx.fillStyle = visorGrad;
        fCtx.beginPath();
        fCtx.roundRect(126 + ox * 0.72, 230 + oy * 0.72, 260, 52, 21);
        fCtx.fill();

        // Crisp diagonal specular sweep across cool visor
        fCtx.fillStyle = 'rgba(255, 255, 255, 0.36)';
        fCtx.beginPath();
        fCtx.moveTo(165 + ox * 0.72, 234 + oy * 0.72);
        fCtx.lineTo(205 + ox * 0.72, 234 + oy * 0.72);
        fCtx.lineTo(175 + ox * 0.72, 278 + oy * 0.72);
        fCtx.lineTo(135 + ox * 0.72, 278 + oy * 0.72);
        fCtx.closePath();
        fCtx.fill();
      } else {
        const ls = emo === 'curious' ? 1.18 : 1;
        const rs = emo === 'curious' ? 0.74 : 1;
        const sy = emo === 'thinking' ? -18 : 0;
        drawLuminousEye(lx, ly + sy, 30 * perspL, 39 * blinkScaleY * ls, camOn);
        drawLuminousEye(rx, ry + sy, 30 * perspR, 39 * blinkScaleY * rs, camOn);
      }

      // Expressive subtle mouth micro-curves or active OLED voice equalizer while speaking
      if (speakWave > 0.02) {
        fCtx.fillStyle = night ? '#38bdf8' : '#e0f2fe';
        const bars = 5;
        const barW = 7;
        const gap = 5;
        const totalW = bars * barW + (bars - 1) * gap;
        const startX = 256 + ox * 0.4 - totalW / 2;
        const baseY = 352 + oy * 0.3;
        for (let b = 0; b < bars; b++) {
          const phase = speakWave * Math.PI * 2 + b * 0.9;
          const h = 8 + Math.abs(Math.sin(phase)) * (b === 2 ? 22 : b === 1 || b === 3 ? 17 : 11);
          fCtx.beginPath();
          fCtx.roundRect(startX + b * (barW + gap), baseY - h / 2, barW, h, 3.5);
          fCtx.fill();
        }
      } else if (emo !== 'normal') {
        fCtx.strokeStyle = night ? '#38bdf8' : 'rgba(241,245,249,0.88)';
        fCtx.lineWidth = 6.5;
        fCtx.lineCap = 'round';
        fCtx.beginPath();
        if (emo === 'happy' || emo === 'wink') {
          fCtx.moveTo(224 + ox * 0.4, 344 + oy * 0.3);
          fCtx.quadraticCurveTo(256 + ox * 0.4, 376 + oy * 0.3, 288 + ox * 0.4, 344 + oy * 0.3);
        } else if (emo === 'surprised') {
          fCtx.arc(256 + ox * 0.4, 355 + oy * 0.3, 14, 0, Math.PI * 2);
        } else if (emo === 'thinking' || emo === 'focus') {
          fCtx.moveTo(234 + ox * 0.4, 350 + oy * 0.3);
          fCtx.lineTo(278 + ox * 0.4, 350 + oy * 0.3);
        }
        fCtx.stroke();
      }

      // Subtle OLED Corner Optical Tracking Brackets when webcam lock is active
      if (camOn) {
        fCtx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
        fCtx.lineWidth = 3.5;
        const m = 42;
        const len = 26;
        // Top-left & Top-right & Bottom-left & Bottom-right brackets
        [
          [m, m, 1, 1],
          [512 - m, m, -1, 1],
          [m, 512 - m, 1, -1],
          [512 - m, 512 - m, -1, -1],
        ].forEach(([bx, by, dx, dy]) => {
          fCtx.beginPath();
          fCtx.moveTo(bx + dx * len, by);
          fCtx.lineTo(bx, by);
          fCtx.lineTo(bx, by + dy * len);
          fCtx.stroke();
        });
      }

      // Crisp OLED Subpixel Micro-Scanline Lattice ("px" surface realism)
      fCtx.fillStyle = 'rgba(2, 6, 23, 0.16)';
      for (let sy = 4; sy < 512; sy += 6) {
        fCtx.fillRect(0, sy, 512, 1.5);
      }

      // Soft curved glass specular sheen across upper-left visor
      const glassSheen = fCtx.createLinearGradient(0, 0, 260, 260);
      glassSheen.addColorStop(0, 'rgba(255, 255, 255, 0.11)');
      glassSheen.addColorStop(0.45, 'rgba(255, 255, 255, 0.025)');
      glassSheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
      fCtx.fillStyle = glassSheen;
      fCtx.fillRect(0, 0, 512, 512);

      fCtx.restore();
      faceTex.needsUpdate = true;
    };

    // Motion, Oculomotor Gaze & Joint Damping State
    const pointerRaw = { x: 0, y: 0 };
    const eyeSmooth = { x: 0, y: 0 };
    const headSmooth = { x: 0, y: 0 };
    let smoothScroll = 0;
    let camLookBlend = 0;

    // Natural eye saccade offset when idle
    let saccadeX = 0;
    let saccadeY = 0;
    let nextSaccadeAt = performance.now() + 1400;

    // Double-blink capable blink state
    let blinkScaleY = 1;
    let blinkStart = -1;
    let doubleBlinkQueued = false;
    let nextBlinkAt = performance.now() + 2400 + Math.random() * 2200;

    // Smoothly damped kinematic joint states
    const joints = {
      bodyPitch: 0,
      bodyRoll: 0,
      bodyYaw: -0.42,
      headYaw: -0.6,
      headPitch: 0.16,
      headRoll: 0.22,
      lShoulderX: 0,
      lShoulderZ: -0.16,
      rShoulderX: 0,
      rShoulderZ: 0.16,
      lForearmX: -0.35,
      rForearmX: -0.35,
      rForearmZ: 0,
    };

    const onPointerMove = (e: PointerEvent) => {
      if (camActiveRef.current && camTargetRef.current.active) return;
      const rect = host.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      const ny = ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1;
      pointerRaw.x = Math.max(-1, Math.min(1, nx));
      pointerRaw.y = Math.max(-1, Math.min(1, ny));
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // Click / tap directly on the 3D robot triggers friendly wave + happy reaction
    const onPointerDown = (e: PointerEvent) => {
      if (!host) return;
      const rect = host.getBoundingClientRect();
      _ndcVec.set(
        ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1,
        -((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 + 1
      );
      _raycaster.setFromCamera(_ndcVec, camera);
      const hits = _raycaster.intersectObject(bodyGroup, true);
      if (hits.length > 0) {
        const nextPick: RobotGesture =
          gestureStateRef.current.name === 'wave' ? 'cheer' : 'wave';
        triggerGesture(nextPick, 2400, nextPick === 'wave' ? 'wink' : 'happy');
      }
    };
    host.addEventListener('pointerdown', onPointerDown);

    let viewW = initW;
    const handleResize = () => {
      if (!host || !renderer) return;
      const { w, h } = getSize();
      viewW = w;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(host);

    let contextLost = false;
    const onLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
    };
    const onRestored = () => {
      contextLost = false;
    };
    renderer.domElement.addEventListener('webglcontextlost', onLost);
    renderer.domElement.addEventListener('webglcontextrestored', onRestored);

    let lastFrameAt = performance.now();
    let slowFrames = 0;
    let dynamicThrottle = false;

    const scheduleNext = () => {
      if (disposed || document.hidden) return;
      if (useLite || isSoftwareGl || dynamicThrottle) {
        if (paceTimeout !== null) {
          clearTimeout(paceTimeout);
          paceTimeout = null;
        }
        paceTimeout = window.setTimeout(() => {
          paceTimeout = null;
          if (!disposed && !document.hidden) {
            rafId = requestAnimationFrame(renderTick);
          }
        }, isSoftwareGl ? 45 : 30);
      } else {
        rafId = requestAnimationFrame(renderTick);
      }
    };

    const renderTick = (now: number) => {
      rafId = 0;
      if (disposed || document.hidden) return;

      const dtMs = now - lastFrameAt;
      lastFrameAt = now;
      const dt = Math.min(0.05, Math.max(0.004, dtMs * 0.001));

      if (qualityMode === 'auto' && !useLite && !dynamicThrottle) {
        if (dtMs > 42 && dtMs < 500) {
          slowFrames++;
          if (slowFrames >= 30 && renderer) {
            dynamicThrottle = true;
            renderer.setPixelRatio(1);
            setAutoLiteReason(true);
          }
        } else {
          slowFrames = Math.max(0, slowFrames - 1);
        }
      }

      if (!contextLost && renderer) {
        const t = now * 0.001;
        const night = isNightRef.current;
        const emo = emotionRef.current;
        const camOn = camActiveRef.current;

        // Smooth lighting transitions
        hemi.intensity = THREE.MathUtils.damp(hemi.intensity, night ? 0.36 : 0.68, 5, dt);
        keyLight.intensity = THREE.MathUtils.damp(keyLight.intensity, night ? 0.92 : 1.85, 5, dt);
        nightAuraLight.intensity = THREE.MathUtils.damp(
          nightAuraLight.intensity,
          night ? 3.2 : 0,
          5,
          dt
        );
        nightAuraLight.color.setHex(emo === 'cool' ? 0x38bdf8 : 0x2563eb);
        screenBounceLight.intensity = THREE.MathUtils.damp(
          screenBounceLight.intensity,
          night ? 1.15 : 0.18,
          5,
          dt
        );
        ringMat.emissiveIntensity = THREE.MathUtils.damp(
          ringMat.emissiveIntensity,
          night ? 0.95 : 0.24,
          5,
          dt
        );
        sensorLensMat.emissiveIntensity = THREE.MathUtils.damp(
          sensorLensMat.emissiveIntensity,
          camOn ? 1.8 : 0.25,
          8,
          dt
        );

        // Chest LED living telemetry wave
        ledMats.forEach((lm, idx) => {
          const speed = camOn || emo === 'thinking' ? 5.2 : 2.1;
          const wave = 0.5 + 0.5 * Math.sin(t * speed - idx * 1.15);
          lm.emissiveIntensity = (night ? 1.25 : 0.75) + wave * 0.95;
        });

        const targetScroll = Math.max(0, Math.min(1, scrollProgressRef.current));
        smoothScroll = THREE.MathUtils.damp(smoothScroll, targetScroll, 6, dt);
        const e = easeInOutCubic(smoothScroll);

        // Idle oculomotor micro-saccades (disabled when locked onto live person for crisp gaze accuracy)
        const useCam = camOn && camTargetRef.current.active;
        camLookBlend = THREE.MathUtils.damp(camLookBlend, useCam ? 1 : 0, 5.5, dt);

        if (useCam) {
          saccadeX = 0;
          saccadeY = 0;
        } else if (now >= nextSaccadeAt) {
          saccadeX = (Math.random() - 0.5) * 0.34;
          saccadeY = (Math.random() - 0.5) * 0.22;
          nextSaccadeAt = now + 1300 + Math.random() * 1900;
        }

        const rawX = useCam ? camTargetRef.current.x : pointerRaw.x;
        const rawY = useCam ? camTargetRef.current.y : pointerRaw.y;

        // Eye-lead / Head-lag: eyes snap faster than ceramic head
        const targetEyeX = Math.max(-1, Math.min(1, rawX + saccadeX));
        const targetEyeY = Math.max(-1, Math.min(1, rawY + saccadeY));
        eyeSmooth.x = THREE.MathUtils.damp(eyeSmooth.x, targetEyeX, useCam ? 20 : 12.5, dt);
        eyeSmooth.y = THREE.MathUtils.damp(eyeSmooth.y, targetEyeY, useCam ? 20 : 12.5, dt);

        headSmooth.x = THREE.MathUtils.damp(headSmooth.x, rawX + saccadeX * 0.35, useCam ? 10 : 5.4, dt);
        headSmooth.y = THREE.MathUtils.damp(headSmooth.y, rawY + saccadeY * 0.3, useCam ? 10 : 5.4, dt);

        // Camera glides smoothly from Intro to Close-Up with subtle parallax
        const mobileMult = viewW <= 900 ? 1.24 : 1;
        const camZ = (11.6 + (6.9 - 11.6) * e) * mobileMult;
        const camY = 1.1 + (1.95 - 1.1) * e;
        const lookY = 0.55 + (1.72 - 0.55) * e;

        camera.position.set(headSmooth.x * (useCam ? 0.1 : 0.24), camY - headSmooth.y * 0.08, camZ);
        _lookAtVec.set(0, lookY, 0);
        camera.lookAt(_lookAtVec);

        // Active Gesture Evaluation
        const gs = gestureStateRef.current;
        if (gs.name !== 'idle' && now - gs.startedAt > gs.durationMs) {
          gs.name = 'idle';
        }
        const gp =
          gs.name === 'idle'
            ? 0
            : Math.max(0, Math.min(1, (now - gs.startedAt) / Math.max(1, gs.durationMs)));
        // Smooth bell envelope (0 -> 1 -> 0) for gesture blending
        const gEnv = gs.name === 'idle' ? 0 : Math.sin(gp * Math.PI);

        // Grounded Organic Breathing + Weight Shift
        const breath = Math.sin(t * 1.55);
        const weightShift = Math.sin(t * 0.78);
        const microSway = Math.cos(t * 1.12);

        // When Live Gaze tracks a person, zero out the asymmetric intro yaw/roll so the robot faces the target directly
        const baseBodyYaw = (-0.42 + (-0.2 - -0.42) * e) * (1 - camLookBlend);
        const baseHeadYaw = (-0.58 + (-0.06 - -0.58) * e) * (1 - camLookBlend);
        const baseHeadPitch = (0.15 + (0.04 - 0.15) * e) * (1 - camLookBlend);
        const baseHeadRoll = (0.21 + (0 - 0.21) * e) * (1 - camLookBlend);

        const yawGain = useCam ? 0.7 : 0.44;
        const pitchGain = useCam ? 0.34 : 0.18;

        // Gesture kinematic targets
        let gBodyPitch = e * 0.045;
        let gBodyRoll = weightShift * 0.024;
        let gBodyYaw = 0;

        let gHeadYaw = 0;
        let gHeadPitch = 0;
        let gHeadRoll = 0;

        // Natural asymmetrical relaxed idle arms
        let gLShoulderX = breath * 0.032 + weightShift * 0.022;
        let gLShoulderZ = -0.16 - breath * 0.015;
        let gRShoulderX = -breath * 0.028 - weightShift * 0.022;
        let gRShoulderZ = 0.16 + breath * 0.015;
        let gLForearmX = -0.34 + microSway * 0.035;
        let gRForearmX = -0.38 - microSway * 0.035;
        let gRForearmZ = 0;

        if (gs.name === 'wave') {
          const waveOsc = Math.sin(gp * Math.PI * 5.2);
          gBodyRoll += -0.055 * gEnv;
          gBodyPitch += 0.03 * gEnv;
          gHeadRoll += -0.11 * gEnv;
          gRShoulderX = THREE.MathUtils.lerp(gRShoulderX, -0.48, gEnv);
          gRShoulderZ = THREE.MathUtils.lerp(gRShoulderZ, 1.38 + waveOsc * 0.14, gEnv);
          gRForearmX = THREE.MathUtils.lerp(gRForearmX, -0.78, gEnv);
          gRForearmZ = waveOsc * 0.34 * gEnv;
          gLShoulderZ = THREE.MathUtils.lerp(gLShoulderZ, -0.24, gEnv);
        } else if (gs.name === 'nod') {
          const doubleNod = Math.sin(gp * Math.PI * 4) * gEnv;
          gHeadPitch += doubleNod * 0.16;
          gBodyPitch += Math.max(0, doubleNod) * 0.045;
        } else if (gs.name === 'tiltInspect') {
          gHeadRoll += 0.22 * gEnv;
          gHeadPitch += -0.05 * gEnv;
          gBodyRoll += 0.04 * gEnv;
          gLShoulderZ = THREE.MathUtils.lerp(gLShoulderZ, -0.26, gEnv);
          gRShoulderZ = THREE.MathUtils.lerp(gRShoulderZ, 0.26, gEnv);
          gLForearmX = THREE.MathUtils.lerp(gLForearmX, -0.58, gEnv);
          gRForearmX = THREE.MathUtils.lerp(gRForearmX, -0.58, gEnv);
        } else if (gs.name === 'thinkChin') {
          gHeadPitch += -0.12 * gEnv;
          gHeadYaw += 0.18 * gEnv;
          gHeadRoll += -0.1 * gEnv;
          gBodyPitch += -0.025 * gEnv;
          gRShoulderX = THREE.MathUtils.lerp(gRShoulderX, -0.78, gEnv);
          gRShoulderZ = THREE.MathUtils.lerp(gRShoulderZ, 0.18, gEnv);
          gRForearmX = THREE.MathUtils.lerp(gRForearmX, -1.25, gEnv);
          gLShoulderX = THREE.MathUtils.lerp(gLShoulderX, 0.12, gEnv);
        } else if (gs.name === 'cheer') {
          const bounce = Math.abs(Math.sin(gp * Math.PI * 3)) * gEnv;
          gBodyPitch += -0.04 * gEnv;
          gLShoulderX = THREE.MathUtils.lerp(gLShoulderX, -0.62, gEnv);
          gRShoulderX = THREE.MathUtils.lerp(gRShoulderX, -0.62, gEnv);
          gLShoulderZ = THREE.MathUtils.lerp(gLShoulderZ, -0.72 - bounce * 0.15, gEnv);
          gRShoulderZ = THREE.MathUtils.lerp(gRShoulderZ, 0.72 + bounce * 0.15, gEnv);
          gLForearmX = THREE.MathUtils.lerp(gLForearmX, -0.82, gEnv);
          gRForearmX = THREE.MathUtils.lerp(gRForearmX, -0.82, gEnv);
        } else if (gs.name === 'lookAround') {
          const sweep = Math.sin(gp * Math.PI * 2);
          gHeadYaw += sweep * 0.34 * gEnv;
          gBodyYaw += sweep * 0.1 * gEnv;
          gHeadRoll += -sweep * 0.08 * gEnv;
        }

        const emoRoll = emo === 'curious' ? 0.09 : 0;
        const emoPitch = emo === 'thinking' ? -0.09 : 0;

        // Exponential damping for physical mass & inertia
        joints.bodyPitch = THREE.MathUtils.damp(joints.bodyPitch, gBodyPitch + breath * 0.012, 6, dt);
        joints.bodyRoll = THREE.MathUtils.damp(joints.bodyRoll, gBodyRoll, 5, dt);
        joints.bodyYaw = THREE.MathUtils.damp(
          joints.bodyYaw,
          baseBodyYaw + headSmooth.x * (useCam ? 0.26 : 0.14) + gBodyYaw,
          useCam ? 8 : 6,
          dt
        );

        joints.headYaw = THREE.MathUtils.damp(
          joints.headYaw,
          baseHeadYaw + headSmooth.x * yawGain + gHeadYaw,
          7,
          dt
        );
        joints.headPitch = THREE.MathUtils.damp(
          joints.headPitch,
          baseHeadPitch + headSmooth.y * pitchGain + Math.sin(0.9 * t) * 0.02 + emoPitch + gHeadPitch,
          7,
          dt
        );
        joints.headRoll = THREE.MathUtils.damp(
          joints.headRoll,
          baseHeadRoll + Math.sin(0.7 * t) * 0.018 + emoRoll + gHeadRoll,
          6,
          dt
        );

        joints.lShoulderX = THREE.MathUtils.damp(joints.lShoulderX, gLShoulderX, 8, dt);
        joints.lShoulderZ = THREE.MathUtils.damp(joints.lShoulderZ, gLShoulderZ, 8, dt);
        joints.rShoulderX = THREE.MathUtils.damp(joints.rShoulderX, gRShoulderX, 8, dt);
        joints.rShoulderZ = THREE.MathUtils.damp(joints.rShoulderZ, gRShoulderZ, 8, dt);
        joints.lForearmX = THREE.MathUtils.damp(joints.lForearmX, gLForearmX, 9, dt);
        joints.rForearmX = THREE.MathUtils.damp(joints.rForearmX, gRForearmX, 9, dt);
        joints.rForearmZ = THREE.MathUtils.damp(joints.rForearmZ, gRForearmZ, 10, dt);

        // Apply transforms: feet remain rooted on pedestal while upperPivot breathes & shifts weight
        upperPivot.position.y = -0.58 + breath * 0.012;
        upperPivot.rotation.set(joints.bodyPitch, joints.bodyYaw, joints.bodyRoll);

        // Relative head turn on top of upperBody
        headPivot.rotation.set(joints.headPitch, joints.headYaw - joints.bodyYaw * 0.35, joints.headRoll);

        // Left arm (index 0, side -1) & Right arm (index 1, side +1)
        const leftArm = arms[0];
        const rightArm = arms[1];
        if (leftArm) {
          leftArm.shoulder.rotation.x = joints.lShoulderX;
          leftArm.shoulder.rotation.z = joints.lShoulderZ;
          leftArm.forearm.rotation.x = joints.lForearmX;
        }
        if (rightArm) {
          rightArm.shoulder.rotation.x = joints.rShoulderX;
          rightArm.shoulder.rotation.z = joints.rShoulderZ;
          rightArm.forearm.rotation.x = joints.rForearmX;
          rightArm.forearm.rotation.z = joints.rForearmZ;
        }

        // Natural blinking + occasional quick double-blink
        if (now >= nextBlinkAt && blinkStart < 0) {
          blinkStart = now;
          doubleBlinkQueued = Math.random() < 0.22;
        }
        if (blinkStart >= 0) {
          const bdt = (now - blinkStart) / 165;
          if (bdt >= 1) {
            blinkStart = -1;
            blinkScaleY = 1;
            if (doubleBlinkQueued) {
              doubleBlinkQueued = false;
              nextBlinkAt = now + 150;
            } else {
              nextBlinkAt = now + 2400 + Math.random() * 2900;
            }
          } else {
            blinkScaleY = 1 - 0.92 * Math.sin(bdt * Math.PI);
          }
        }

        // Eye gaze uses eyeSmooth (eyes lead head!) for unmistakable living alertness
        const pupilPulse = 0.5 + 0.5 * Math.sin(t * 2.4);
        const speakWave =
          now < speakingUntilRef.current ? 0.25 + 0.75 * Math.abs(Math.sin(t * 14)) : 0;
        drawFaceIfDirty(
          eyeSmooth.x,
          eyeSmooth.y,
          blinkScaleY,
          night,
          emo,
          camOn,
          pupilPulse,
          speakWave
        );
        renderer.render(scene, camera);
      }

      scheduleNext();
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        rafId = 0;
        if (paceTimeout !== null) {
          clearTimeout(paceTimeout);
          paceTimeout = null;
        }
      } else if (!disposed) {
        cancelAnimationFrame(rafId);
        if (paceTimeout !== null) {
          clearTimeout(paceTimeout);
          paceTimeout = null;
        }
        lastFrameAt = performance.now();
        rafId = requestAnimationFrame(renderTick);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    rafId = requestAnimationFrame(renderTick);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      rafId = 0;
      if (paceTimeout !== null) {
        clearTimeout(paceTimeout);
        paceTimeout = null;
      }
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerdown', onPointerDown);
      ro.disconnect();
      if (renderer) {
        renderer.domElement.removeEventListener('webglcontextlost', onLost);
        renderer.domElement.removeEventListener('webglcontextrestored', onRestored);
        renderer.renderLists?.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === host) {
          host.removeChild(renderer.domElement);
        }
      }
      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());
      texturesToDispose.forEach((t) => t.dispose());
      envRT.dispose();
      pmrem.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qualityMode]);

  // Multi-person Webcam Detection (MediaPipe ObjectDetector + Native/YCbCr Fallbacks)
  const stopCamera = (byUser = false) => {
    if (byUser) userStoppedCamRef.current = true;
    if (detectTimerRef.current !== null) {
      cancelAnimationFrame(detectTimerRef.current);
      detectTimerRef.current = null;
    }
    if (objectDetectorRef.current) {
      try {
        objectDetectorRef.current.close();
      } catch {
        // Ignore detector close errors
      }
      objectDetectorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    prevGrayRef.current = null;
    trackedPeopleRef.current = [];
    lockedIdRef.current = null;
    trackingModeRef.current = 'closest';
    lockedMissingSinceRef.current = 0;
    lastPeopleSigRef.current = '';
    camTargetRef.current.active = false;
    clearSpeechState();
    setSpeechBubble(null);
    setCamActive(false);
    setPeopleList([]);
    setLockedPersonId(null);
    setTrackingMode('closest');
  };

  useEffect(() => {
    return () => {
      stopCamera(false);
    };
  }, []);

  const detectMultiPeopleFallback = (
    procCanvas: HTMLCanvasElement,
    procCtx: CanvasRenderingContext2D,
    video: HTMLVideoElement
  ): Array<Omit<TrackedPerson, 'id'>> => {
    const W = 160;
    const H = 120;
    if (procCanvas.width !== W) procCanvas.width = W;
    if (procCanvas.height !== H) procCanvas.height = H;

    if (mirrorCamRef.current) {
      procCtx.save();
      procCtx.scale(-1, 1);
      procCtx.drawImage(video, -W, 0, W, H);
      procCtx.restore();
    } else {
      procCtx.drawImage(video, 0, 0, W, H);
    }

    const frame = procCtx.getImageData(0, 0, W, H);
    const data = frame.data;
    const mask = new Uint8Array(W * H);
    const currGray = new Uint8Array(W * H);

    for (let i = 0; i < W * H; i++) {
      const idx = i * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const gray = (r * 30 + g * 59 + b * 11) / 100;
      currGray[i] = gray;
      // YCbCr skin chrominance + motion cue (far fewer wall false-positives than naive RGB)
      const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
      const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
      const isSkin = gray > 45 && cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173;
      const diff = prevGrayRef.current ? Math.abs(gray - prevGrayRef.current[i]) : 0;
      if (isSkin || (diff > 20 && gray > 35)) {
        mask[i] = 1;
      }
    }
    prevGrayRef.current = currGray;

    const visited = new Uint8Array(W * H);
    const clusters: Array<Omit<TrackedPerson, 'id'>> = [];
    const queue = new Int32Array(W * H);

    for (let y = 2; y < H - 4; y++) {
      for (let x = 2; x < W - 2; x++) {
        const start = y * W + x;
        if (!mask[start] || visited[start]) continue;

        let head = 0;
        let tail = 0;
        queue[tail++] = start;
        visited[start] = 1;

        let minX = x,
          maxX = x,
          minY = y,
          maxY = y,
          count = 0;

        while (head < tail) {
          const p = queue[head++];
          const px = p % W;
          const py = (p / W) | 0;
          count++;
          if (px < minX) minX = px;
          if (px > maxX) maxX = px;
          if (py < minY) minY = py;
          if (py > maxY) maxY = py;

          const neighbors = [p - 1, p + 1, p - W, p + W];
          for (let n = 0; n < 4; n++) {
            const np = neighbors[n];
            if (np >= 0 && np < W * H && !visited[np] && mask[np]) {
              const nx = np % W;
              if (Math.abs(nx - px) <= 1) {
                visited[np] = 1;
                queue[tail++] = np;
              }
            }
          }
        }

        const bw = (maxX - minX + 1) / W;
        const bh = (maxY - minY + 1) / H;
        if (count >= 14 && bw > 0.038 && bh > 0.055) {
          const cx = (minX + maxX) / (2 * W);
          const cy = (minY + maxY) / (2 * H);
          const gy = (minY + (maxY - minY) * 0.34) / H;
          clusters.push({
            cx,
            cy,
            gy,
            bw,
            bh,
            area: bw * bh,
            score: count / (W * H),
          });
        }
      }
    }

    clusters.sort((a, b) => b.area - a.area);
    return clusters.slice(0, 8);
  };

  const assignStableIds = (
    raw: Array<Omit<TrackedPerson, 'id'>>,
    now: number
  ): TrackedPerson | null => {
    const prev = trackedPeopleRef.current;
    const usedPrev = new Set<number>();
    const updated: TrackedPerson[] = raw.map((det) => {
      let bestIdx = -1;
      let bestDist = 0.24;
      prev.forEach((p, idx) => {
        if (usedPrev.has(idx)) return;
        const d = Math.hypot(p.cx - det.cx, p.cy - det.cy);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = idx;
        }
      });
      if (bestIdx !== -1) {
        usedPrev.add(bestIdx);
        return { ...det, id: prev[bestIdx].id };
      }
      return { ...det, id: nextIdRef.current++ };
    });

    trackedPeopleRef.current = updated;

    const sig = updated.map((p) => p.id).join(',');
    if (sig !== lastPeopleSigRef.current) {
      lastPeopleSigRef.current = sig;
      setPeopleList(updated);
    }

    if (updated.length === 0) {
      if (trackingModeRef.current === 'random_locked' && lockedIdRef.current !== null) {
        if (lockedMissingSinceRef.current === 0) lockedMissingSinceRef.current = now;
        if (now - lockedMissingSinceRef.current < 900) {
          // Hold last gaze briefly so distant detections don't lose lock on 1-2 dropped frames
          return null;
        }
        trackingModeRef.current = 'closest';
        setTrackingMode('closest');
      }
      lockedMissingSinceRef.current = 0;
      if (lockedIdRef.current !== null) {
        lockedIdRef.current = null;
        setLockedPersonId(null);
      }
      return null;
    }

    // Mode 1: RANDOM_LOCKED (user triggered Random Pick or clicked a specific person — closeness rule OFF!)
    if (trackingModeRef.current === 'random_locked' && lockedIdRef.current !== null) {
      const lockedTarget = updated.find((p) => p.id === lockedIdRef.current);
      if (lockedTarget) {
        lockedMissingSinceRef.current = 0;
        return lockedTarget;
      }
      if (lockedMissingSinceRef.current === 0) lockedMissingSinceRef.current = now;
      if (now - lockedMissingSinceRef.current < 900) {
        return null; // Keep current camTargetRef briefly
      }
      // Locked person truly exited frame -> smoothly return to closest-person tracking
      trackingModeRef.current = 'closest';
      lockedMissingSinceRef.current = 0;
      setTrackingMode('closest');
    }

    // Mode 2: CLOSEST (default passive tracking — look ONLY at the closest person!)
    let closest = updated[0];
    for (let i = 1; i < updated.length; i++) {
      if (updated[i].area > closest.area) {
        closest = updated[i];
      }
    }

    // Hysteresis (15%) prevents rapid flickering if two people stand at nearly equal distance
    const currentLocked = updated.find((p) => p.id === lockedIdRef.current);
    const chosen =
      currentLocked && closest.id !== currentLocked.id && closest.area <= currentLocked.area * 1.15
        ? currentLocked
        : closest;

    if (lockedIdRef.current !== chosen.id) {
      lockedIdRef.current = chosen.id;
      setLockedPersonId(chosen.id);
    }
    return chosen;
  };

  const startCamera = async () => {
    if (camActiveRef.current || camBusy) return;
    userStoppedCamRef.current = false;
    setCamBusy(true);
    setCamError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;

      // Smart camera orientation check: rear/external cameras should not be mirrored unless user explicitly toggled
      try {
        const hasSavedMirror = window.localStorage.getItem('nova_cam_mirror') !== null;
        if (!hasSavedMirror) {
          const track = stream.getVideoTracks()[0];
          const settings = track?.getSettings?.();
          const label = (track?.label || '').toLowerCase();
          if (
            settings?.facingMode === 'environment' ||
            /back|rear|environment/.test(label)
          ) {
            mirrorCamRef.current = false;
            setMirrorCam(false);
          }
        }
      } catch {
        // Ignore capability inspection errors
      }

      const video = videoRef.current;
      if (!video) {
        stopCamera(false);
        return;
      }
      video.srcObject = stream;
      await video.play();

      // Load high-accuracy MediaPipe ObjectDetector (detects BOTH near and far people reliably)
      let mpDetector: typeof objectDetectorRef.current = null;
      try {
        const { FilesetResolver, ObjectDetector } = await import('@mediapipe/tasks-vision');
        if (!mountedRef.current) {
          stopCamera(false);
          return;
        }
        const vision = await FilesetResolver.forVisionTasks('/vision/wasm');
        mpDetector = await ObjectDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: '/vision/efficientdet_lite0.tflite',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          categoryAllowlist: ['person'],
          scoreThreshold: 0.27,
          maxResults: 10,
        });
        objectDetectorRef.current = mpDetector;
      } catch {
        mpDetector = null;
      }

      if (!mountedRef.current || !streamRef.current) {
        mpDetector?.close();
        objectDetectorRef.current = null;
        return;
      }

      setCamActive(true);
      camActiveRef.current = true;
      trackingModeRef.current = 'closest';
      setTrackingMode('closest');

      const procCanvas = document.createElement('canvas');
      const procCtx = procCanvas.getContext('2d', { willReadFrequently: true })!;
      const faceDetector =
        !mpDetector && window.FaceDetector
          ? new window.FaceDetector({ maxDetectedFaces: 8, fastMode: true })
          : null;

      let lastDetect = 0;
      let lastPreviewDraw = 0;
      let lastVideoTs = 0;

      const loop = async (now: number) => {
        if (!camActiveRef.current || !videoRef.current) return;
        if (document.hidden) {
          detectTimerRef.current = requestAnimationFrame(loop);
          return;
        }

        if (now - lastDetect > 95 && video.readyState >= 2) {
          lastDetect = now;
          let rawDets: Array<Omit<TrackedPerson, 'id'>> = [];

          if (mpDetector) {
            try {
              const ts = Math.max(lastVideoTs + 1, Math.round(now));
              lastVideoTs = ts;
              const res = mpDetector.detectForVideo(video, ts);
              const vw = Math.max(video.videoWidth, 1);
              const vh = Math.max(video.videoHeight, 1);
              rawDets = (res.detections || [])
                .filter((d) => d.boundingBox && d.boundingBox.width > 0 && d.boundingBox.height > 0)
                .map((d) => {
                  const b = d.boundingBox!;
                  const bw = Math.min(1, b.width / vw);
                  const bh = Math.min(1, b.height / vh);
                  const rawCx = (b.originX + b.width * 0.5) / vw;
                  const cx = mirrorCamRef.current ? 1 - rawCx : rawCx;
                  const cy = (b.originY + b.height * 0.5) / vh;
                  // Aim robot eyes at head/face area (~24% from top of person bounding box)
                  const gy = (b.originY + b.height * 0.24) / vh;
                  const conf = d.categories?.[0]?.score ?? 0.5;
                  return {
                    cx: Math.max(0.02, Math.min(0.98, cx)),
                    cy: Math.max(0.02, Math.min(0.98, cy)),
                    gy: Math.max(0.02, Math.min(0.95, gy)),
                    bw,
                    bh,
                    area: bw * bh,
                    score: conf,
                  };
                })
                .filter((d) => d.bw >= 0.03 && d.bh >= 0.06);
            } catch {
              rawDets = detectMultiPeopleFallback(procCanvas, procCtx, video);
            }
          } else if (faceDetector) {
            try {
              const faces = await faceDetector.detect(video);
              const vw = Math.max(video.videoWidth, 1);
              const vh = Math.max(video.videoHeight, 1);
              rawDets = faces.map((f) => {
                const b = f.boundingBox;
                const rawCx = (b.x + b.width / 2) / vw;
                const cx = mirrorCamRef.current ? 1 - rawCx : rawCx;
                const cy = (b.y + b.height / 2) / vh;
                const bw = b.width / vw;
                const bh = b.height / vh;
                return { cx, cy, gy: cy, bw, bh, area: bw * bh, score: bw * bh };
              });
            } catch {
              rawDets = detectMultiPeopleFallback(procCanvas, procCtx, video);
            }
          } else {
            rawDets = detectMultiPeopleFallback(procCanvas, procCtx, video);
          }

          const target = assignStableIds(rawDets, now);
          if (target) {
            camTargetRef.current = {
              x: Math.max(-1, Math.min(1, (target.cx - 0.5) * 2)),
              y: Math.max(-1, Math.min(1, (target.gy - 0.42) * 1.9)),
              active: true,
            };
          } else if (
            trackingModeRef.current !== 'random_locked' ||
            now - lockedMissingSinceRef.current >= 900
          ) {
            camTargetRef.current.active = false;
          }
        }

        const preview = previewCanvasRef.current;
        if (
          preview &&
          showFeedRef.current &&
          video.readyState >= 2 &&
          now - lastPreviewDraw > 55
        ) {
          lastPreviewDraw = now;
          const pCtx = preview.getContext('2d');
          if (pCtx) {
            const pw = preview.width;
            const ph = preview.height;
            if (mirrorCamRef.current) {
              pCtx.save();
              pCtx.scale(-1, 1);
              pCtx.drawImage(video, -pw, 0, pw, ph);
              pCtx.restore();
            } else {
              pCtx.drawImage(video, 0, 0, pw, ph);
            }

            const isRandomMode = trackingModeRef.current === 'random_locked';
            trackedPeopleRef.current.forEach((p) => {
              const isLocked = p.id === lockedIdRef.current;
              const rx = (p.cx - p.bw / 2) * pw;
              const ry = (p.cy - p.bh / 2) * ph;
              const rw = p.bw * pw;
              const rh = p.bh * ph;

              const boxColor = isLocked ? (isRandomMode ? '#10b981' : '#2563eb') : 'rgba(255,255,255,0.78)';
              pCtx.strokeStyle = boxColor;
              pCtx.lineWidth = isLocked ? 2.5 : 1.5;
              pCtx.strokeRect(rx, ry, rw, rh);

              // Subtle gaze target dot on tracked person's head/face
              if (isLocked) {
                pCtx.fillStyle = boxColor;
                pCtx.beginPath();
                pCtx.arc(p.cx * pw, p.gy * ph, 3.5, 0, Math.PI * 2);
                pCtx.fill();
              }

              const badgeText = isLocked
                ? isRandomMode
                  ? `TANLANDI #${p.id}`
                  : `YAQIN #${p.id}`
                : `#${p.id}`;
              const badgeW = isLocked ? 74 : 28;
              pCtx.fillStyle = isLocked ? boxColor : 'rgba(15,23,42,0.8)';
              pCtx.fillRect(rx, Math.max(0, ry - 15), badgeW, 15);
              pCtx.fillStyle = '#ffffff';
              pCtx.font = '10px "IBM Plex Mono", monospace';
              pCtx.fillText(badgeText, rx + 4, Math.max(11, ry - 4));
            });
          }
        }

        detectTimerRef.current = requestAnimationFrame(loop);
      };

      detectTimerRef.current = requestAnimationFrame(loop);
    } catch {
      setCamError('Kamera ruxsati berilmadi — tugma orqali yoqing.');
      stopCamera(false);
    } finally {
      setCamBusy(false);
    }
  };

  // Auto-activate camera when dashboard is scrolled down
  useEffect(() => {
    if (
      scrollProgress > 0.25 &&
      !camActiveRef.current &&
      !userStoppedCamRef.current &&
      !autoTriggeredRef.current
    ) {
      autoTriggeredRef.current = true;
      void startCamera();
    } else if (scrollProgress < 0.05) {
      autoTriggeredRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollProgress]);

  const handleSelectPerson = (personId: number) => {
    const target = trackedPeopleRef.current.find((p) => p.id === personId);
    trackingModeRef.current = 'random_locked';
    lockedMissingSinceRef.current = 0;
    setTrackingMode('random_locked');
    lockedIdRef.current = personId;
    setLockedPersonId(personId);
    if (target) {
      camTargetRef.current = {
        x: Math.max(-1, Math.min(1, (target.cx - 0.5) * 2)),
        y: Math.max(-1, Math.min(1, (target.gy - 0.42) * 1.9)),
        active: true,
      };
    }
    triggerGesture('tiltInspect', 1650, 'curious');
    announceSelectedPerson(personId, true);
  };

  // Uniform random selection across ALL detected people (ignores closeness — picks distant people too!)
  const handleRandomPickPerson = () => {
    const list = trackedPeopleRef.current;
    if (list.length === 0) return;
    const picked = list[Math.floor(Math.random() * list.length)];
    handleSelectPerson(picked.id);
  };

  const handleReturnClosestMode = () => {
    trackingModeRef.current = 'closest';
    lockedMissingSinceRef.current = 0;
    setTrackingMode('closest');
    setSpeechBubble(null);
    clearSpeechState();
    const list = trackedPeopleRef.current;
    if (list.length > 0) {
      let closest = list[0];
      for (let i = 1; i < list.length; i++) {
        if (list[i].area > closest.area) closest = list[i];
      }
      lockedIdRef.current = closest.id;
      setLockedPersonId(closest.id);
      camTargetRef.current = {
        x: Math.max(-1, Math.min(1, (closest.cx - 0.5) * 2)),
        y: Math.max(-1, Math.min(1, (closest.gy - 0.42) * 1.9)),
        active: true,
      };
    }
  };

  const toggleMirrorCam = () => {
    setMirrorCam((prev) => {
      const next = !prev;
      mirrorCamRef.current = next;
      prevGrayRef.current = null;
      trackedPeopleRef.current = [];
      try {
        window.localStorage.setItem('nova_cam_mirror', String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const handlePreviewClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    const hit = trackedPeopleRef.current.find(
      (p) =>
        nx >= p.cx - p.bw / 2 &&
        nx <= p.cx + p.bw / 2 &&
        ny >= p.cy - p.bh / 2 &&
        ny <= p.cy + p.bh / 2
    );
    if (hit) {
      handleSelectPerson(hit.id);
    }
  };

  const cycleQualityMode = () => {
    setQualityMode((prev) =>
      prev === 'auto' ? 'lite' : prev === 'lite' ? 'high' : 'auto'
    );
  };

  const qualityLabel =
    qualityMode === 'auto'
      ? isLiteEffective
        ? 'AVTO · ECO'
        : 'AVTO · YUQORI'
      : qualityMode === 'lite'
      ? 'ECO REJIM'
      : 'YUQORI REJIM';

  const bubbleTopPct = Math.round(21 - Math.max(0, Math.min(1, scrollProgress)) * 8);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <video ref={videoRef} playsInline muted className="hidden" />

      {/* Night Luminous Radial Halo Behind Robot (pure radial-gradient, zero CSS blur filter) */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
          isNight ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className="absolute left-1/2 top-[48%] h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              emotion === 'cool'
                ? 'radial-gradient(circle, rgba(56,189,248,0.34) 0%, rgba(16,185,129,0.12) 48%, rgba(0,0,0,0) 74%)'
                : 'radial-gradient(circle, rgba(37,99,235,0.38) 0%, rgba(56,189,248,0.16) 46%, rgba(14,165,233,0.06) 66%, rgba(0,0,0,0) 76%)',
          }}
        />
      </div>

      {/* Full-Stage WebGL Canvas */}
      <div ref={containerRef} className="relative z-[1] h-full w-full cursor-pointer" />

      {/* Floating Speech Window Above Robot Head When Person Selected */}
      {camActive && speechBubble && (
        <div
          key={speechBubble.key}
          style={{ top: `${bubbleTopPct}%` }}
          className="pointer-events-auto absolute left-1/2 z-30 w-max max-w-[230px] -translate-x-1/2 transition-all duration-300"
        >
          <div className="grad-border relative rounded-2xl bg-[var(--surface)]/95 px-3.5 py-2 shadow-lg">
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex h-2 w-2 rounded-full bg-[#2563eb]" />
                <span className="font-mono-tech text-[10px] uppercase tracking-wider text-[var(--accent)]">
                  #{speechBubble.personId} SHAXS
                </span>
              </div>
              <div className="flex items-center gap-2">
                <SparkleButton
                  variant="secondary"
                  size="xs"
                  withParticles={false}
                  onClick={() => announceSelectedPerson(speechBubble.personId, true)}
                  title="Qayta aytish"
                  className="sparkle-icon-only"
                >
                  <Volume2 className="h-3 w-3" />
                </SparkleButton>
                <SparkleButton
                  variant="secondary"
                  size="xs"
                  withParticles={false}
                  onClick={() => setSpeechBubble(null)}
                  title="Yopish"
                  className="sparkle-icon-only"
                >
                  <X className="h-3 w-3" />
                </SparkleButton>
              </div>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="text-sm font-semibold tracking-tight text-[var(--ink)]">
                {speechBubble.text}
              </span>
            </div>
            <div className="font-mono-tech text-[9px] uppercase tracking-wider text-[var(--dim)]">
              Jonli nigoh tanlandi
            </div>
            {/* Downward speech pointer toward robot head */}
            <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-[var(--grid)] bg-[var(--surface)]" />
          </div>
        </div>
      )}

      {/* Top-Left Camera, Eco/YUQORI Performance & Mirror (AKS) Controls + Non-overlapping Feed */}
      <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex flex-col items-start gap-2.5 sm:inset-x-6 sm:top-4">
        <div className="pointer-events-auto flex flex-wrap items-center gap-2.5">
          <SparkleButton
            variant={camActive ? 'active' : 'primary'}
            size="xs"
            showSparkle
            withParticles={camActive}
            disabled={camBusy}
            onClick={() => (camActive ? stopCamera(true) : startCamera())}
          >
            {camActive ? <CameraOff className="h-3.5 w-3.5" /> : <Camera className="h-3.5 w-3.5" />}
            <span className="uppercase tracking-wider">
              {camBusy
                ? 'YUKLANMOQDA...'
                : camActive
                ? `CAM TRACK: ON (${peopleList.length})`
                : 'CAM TRACK: OFF'}
            </span>
          </SparkleButton>

          <SparkleButton
            variant={qualityMode === 'high' ? 'active' : 'secondary'}
            size="xs"
            withParticles={false}
            onClick={cycleQualityMode}
            title="Kuchsiz qurilmalar uchun Eco / Yuqori 3D rejimini almashtirish"
          >
            <Gauge className="h-3.5 w-3.5 text-[#38bdf8]" />
            <span className="uppercase tracking-wider">{qualityLabel}</span>
          </SparkleButton>

          <SparkleButton
            variant={mirrorCam ? 'secondary' : 'active'}
            size="xs"
            withParticles={false}
            onClick={toggleMirrorCam}
            title="Kamera chap/o‘ng aks yo‘nalishini to‘g‘rilash"
          >
            <FlipHorizontal2 className="h-3.5 w-3.5" />
            <span className="uppercase tracking-wider">
              {mirrorCam ? 'OYNA: AKS' : 'OYNA: TO‘G‘RI'}
            </span>
          </SparkleButton>

          {camActive && (
            <>
              <SparkleButton
                variant={trackingMode === 'random_locked' ? 'emerald' : 'secondary'}
                size="xs"
                showSparkle={trackingMode === 'random_locked'}
                withParticles={false}
                onClick={handleRandomPickPerson}
                disabled={peopleList.length === 0}
                title="Yaqin yoki uzoqdagi barcha odamlar orasidan tasodifiy shaxs tanlash"
              >
                <Dices className="h-3.5 w-3.5" />
                <span className="uppercase tracking-wider">TASODIFIY TANLASH</span>
              </SparkleButton>

              {trackingMode === 'random_locked' && (
                <SparkleButton
                  variant="secondary"
                  size="xs"
                  withParticles={false}
                  onClick={handleReturnClosestMode}
                  title="Eng yaqin turgan odamga qarash rejimiga qaytish"
                >
                  <LocateFixed className="h-3.5 w-3.5 text-[#38bdf8]" />
                  <span className="uppercase tracking-wider">ENG YAQINGA</span>
                </SparkleButton>
              )}

              <SparkleButton
                variant={voiceEnabled ? 'secondary' : 'subtle'}
                size="xs"
                withParticles={false}
                onClick={() => setVoiceEnabled((v) => !v)}
                title="Robot ovozini yoqish/o‘chirish"
                className="sparkle-icon-only"
              >
                {voiceEnabled ? (
                  <Volume2 className="h-3.5 w-3.5 text-[#6366f1]" />
                ) : (
                  <VolumeX className="h-3.5 w-3.5 text-[var(--dim)]" />
                )}
              </SparkleButton>

              <SparkleButton
                variant="secondary"
                size="xs"
                withParticles={false}
                onClick={() => setShowFeed((s) => !s)}
              >
                {showFeed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                <span className="uppercase tracking-wider">
                  {showFeed ? 'YASHIRISH' : 'KO‘RISH'}
                </span>
              </SparkleButton>
            </>
          )}
        </div>

        {camError && (
          <div className="pointer-events-auto rounded-xl border border-[#2563eb]/40 bg-[var(--surface)] px-3 py-1.5 font-mono-tech text-[11px] text-[#2563eb]">
            {camError}
          </div>
        )}

        {/* Multi-Person Camera Preview + Clickable Person Selector */}
        {camActive && showFeed && (
          <div className="pointer-events-auto w-44 overflow-hidden rounded-xl border border-[var(--grid)] bg-[#0f172a] shadow-lg sm:w-52">
            <canvas
              ref={previewCanvasRef}
              width={208}
              height={156}
              onClick={handlePreviewClick}
              className="block h-auto w-full cursor-pointer"
              title="Boshqa shaxsni tanlash uchun ustiga bosing"
            />
            <div className="flex items-center justify-between bg-[#0f172a] px-2.5 py-1 font-mono-tech text-[9px] uppercase text-slate-200">
              <span>{peopleList.length} odam</span>
              <span className={trackingMode === 'random_locked' ? 'text-emerald-400' : 'text-[#38bdf8]'}>
                {trackingMode === 'random_locked'
                  ? `TANLANDI #${lockedPersonId ?? '-'}`
                  : `ENG YAQIN #${lockedPersonId ?? '-'}`}
              </span>
            </div>
            {peopleList.length > 0 && (
              <div className="flex flex-wrap gap-2 border-t border-white/10 bg-[#1e293b] p-2">
                {peopleList.map((p) => {
                  const isSelected = p.id === lockedPersonId;
                  return (
                    <SparkleButton
                      key={p.id}
                      variant={isSelected ? 'active' : 'secondary'}
                      size="xs"
                      withParticles={false}
                      onClick={() => handleSelectPerson(p.id)}
                    >
                      <span className="uppercase">#{p.id} Shaxs</span>
                    </SparkleButton>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
