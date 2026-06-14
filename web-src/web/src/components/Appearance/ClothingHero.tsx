import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

import Nui from '../../Nui';
import CameraAngleRail from './CameraAngleRail';
import {
  ComponentConfig,
  ComponentSettings,
  HairSettings,
  PedAppearance,
  PedComponent,
  PedHair,
  PedProp,
  PropConfig,
  PropSettings,
  CameraPreset,
} from './interfaces';

type CategoryType = 'component' | 'prop' | 'hair';

interface Category {
  id: string;
  title: string;
  type: CategoryType;
  targetId?: number;
  enabled: boolean;
}

interface ClothingHeroProps {
  componentSettings: ComponentSettings[];
  propSettings: PropSettings[];
  hairSettings: HairSettings;
  data: PedAppearance;
  storedData: PedAppearance;
  componentConfig: ComponentConfig;
  propConfig: PropConfig;
  hasTracker: boolean;
  isPedFreemodeModel: boolean | undefined;
  handleComponentDrawableChange: (component_id: number, drawable: number) => void;
  handleComponentTextureChange: (component_id: number, texture: number) => void;
  handlePropDrawableChange: (prop_id: number, drawable: number) => void;
  handlePropTextureChange: (prop_id: number, texture: number) => void;
  handleHairChange: (key: keyof PedHair, value: number) => void;
  handleRandomize: (updates: {
    components?: { component_id: number; drawable: number }[];
    props?: { prop_id: number; drawable: number }[];
    hair?: { style: number };
  }) => void;
  handleApplyOutfit: (outfit: PedAppearance) => void;
  handleSave: () => void;
  handleExit: () => void;
  enableExit: boolean;
  cameraPreset: CameraPreset;
  onCameraPreset: (preset: CameraPreset) => void;
}

interface OutfitSlot {
  name: string;
  data: PedAppearance;
}

const SLOT_COUNT = 8;
const SLOT_STORAGE_KEY = 'w2f.illenium.outfitSlots.v1';

const loadStoredSlots = (): (OutfitSlot | null)[] => {
  const empty: (OutfitSlot | null)[] = Array(SLOT_COUNT).fill(null);
  if (typeof window === 'undefined' || !window.localStorage) return empty;

  try {
    const raw = window.localStorage.getItem(SLOT_STORAGE_KEY);
    if (!raw) return empty;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return empty;

    return Array.from({ length: SLOT_COUNT }, (_, index) => {
      const entry = parsed[index];
      if (!entry || typeof entry !== 'object' || !entry.data) return null;
      return {
        name: typeof entry.name === 'string' && entry.name.trim() ? entry.name : `Look ${index + 1}`,
        data: entry.data as PedAppearance,
      };
    });
  } catch {
    return empty;
  }
};

const persistSlots = (slots: (OutfitSlot | null)[]) => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(SLOT_STORAGE_KEY, JSON.stringify(slots));
  } catch {
    /* storage full / disabled — slots simply won't persist this session */
  }
};

interface PillProps {
  active?: boolean;
}

interface CardProps {
  active?: boolean;
  preview?: boolean;
}

const Layer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

const SpinZone = styled.div<{ $active: boolean }>`
  position: absolute;
  top: 80px;
  bottom: 340px;
  left: 50%;
  transform: translateX(-50%);
  width: min(480px, 48vw);
  pointer-events: auto;
  cursor: ${({ $active }) => ($active ? 'grabbing' : 'grab')};
  user-select: none;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 10px;
`;

const SpinHint = styled.span`
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(240, 242, 248, 0.22);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
  pointer-events: none;
  user-select: none;
  transition: color 0.2s;

  ${SpinZone}:hover & {
    color: rgba(240, 242, 248, 0.45);
  }
`;

/** Top chrome: category pills centered with ‹ › scroll arrows. */
const CategoryTopChrome = styled.div`
  position: absolute;
  top: 28px;
  left: 50%;
  transform: translateX(-50%);
  width: min(940px, 82vw);
  pointer-events: auto;

  display: flex;
  align-items: center;
  gap: 8px;
`;

const ScrollArrowRound = styled.button`
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: transparent;
  color: var(--w2f-text);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.65);
  transition:
    border-color 0.12s,
    color 0.12s;

  &:hover {
    border-color: rgba(var(--w2f-accent), 0.85);
    color: #fff;
  }

  &:disabled {
    opacity: 0.25;
    pointer-events: none;
  }
`;

const CategoryScroll = styled.div`
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;

  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;

  scroll-behavior: smooth;
  cursor: grab;

  &.dragging {
    cursor: grabbing;
    scroll-behavior: auto;
    user-select: none;
  }

  &::-webkit-scrollbar {
    display: none;
  }

  &:focus-visible {
    outline: 1px solid rgba(var(--w2f-accent), 0.45);
    outline-offset: 2px;
    border-radius: 999px;
  }
`;

const Pill = styled.button<PillProps>`
  flex-shrink: 0;
  padding: 8px 16px;
  height: 36px;
  border-radius: 999px;
  color: ${({ active }) => (active ? '#fff' : 'rgba(240, 242, 248, 0.55)')};
  border: 1px solid ${({ active }) => (active ? 'rgba(var(--w2f-accent), 0.7)' : 'transparent')};
  background: transparent;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.65);
  cursor: pointer;
  transition:
    color 0.12s,
    border-color 0.12s;

  &:hover {
    color: #fff;
  }
`;

const StripWrap = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 168px;
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavBtn = styled.button`
  width: 42px;
  height: 42px;
  margin: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: transparent;
  color: var(--w2f-text);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.65);
  transition:
    border-color 0.12s,
    color 0.12s;

  &:hover {
    border-color: rgba(var(--w2f-accent), 0.85);
    color: #fff;
  }
`;

const Strip = styled.div`
  width: min(900px, 72vw);
  height: 168px;
  overflow: hidden;
  position: relative;
  cursor: grab;

  -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);

  &.dragging {
    cursor: grabbing;
  }
`;

const StripInner = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  will-change: transform;
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);

  &.no-anim {
    transition: none;
  }
`;

const Card = styled.div<CardProps>`
  flex-shrink: 0;
  width: 150px;
  height: 150px;
  border-radius: 16px;
  border: 1px solid
    ${({ active, preview }) =>
      active ? 'rgba(var(--w2f-accent), 0.9)' : preview ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.1)'};
  background: transparent;
  box-shadow: ${({ active }) =>
    active ? '0 0 34px rgba(var(--w2f-accent), 0.32), inset 0 0 0 1px rgba(var(--w2f-accent), 0.4)' : 'none'};

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;

  color: ${({ active }) => (active ? '#fff' : 'rgba(240, 242, 248, 0.85)')};
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
  user-select: none;
  transform: ${({ active }) => (active ? 'scale(1)' : 'scale(0.86)')};
  opacity: ${({ active }) => (active ? 1 : 0.65)};
  transition:
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 220ms ease,
    border-color 0.12s,
    box-shadow 0.12s;

  small {
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    opacity: 0.7;
  }

  strong {
    font-size: 36px;
    font-weight: 900;
    letter-spacing: 0.04em;
  }
`;

/**
 * Rigid texture slider (replaces the legacy dot row). The track is fixed
 * width and never grows with the texture count, so it stays visually stable
 * across categories.
 */
const TextureSliderWrap = styled.div`
  position: absolute;
  bottom: 116px;
  left: 50%;
  transform: translateX(-50%);
  width: min(420px, 38vw);
  pointer-events: auto;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  user-select: none;
`;

const TextureSliderLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(240, 242, 248, 0.78);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);

  strong {
    color: #fff;
    font-weight: 900;
  }

  span.muted {
    opacity: 0.55;
  }
`;

const TextureSlider = styled.input.attrs({ type: 'range' })`
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  outline: none;
  cursor: pointer;

  &::-webkit-slider-runnable-track {
    height: 4px;
    border-radius: 999px;
    background: transparent;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 999px;
    background: rgba(var(--w2f-accent), 1);
    border: 2px solid rgba(255, 255, 255, 0.92);
    box-shadow: 0 0 16px rgba(var(--w2f-accent), 0.6);
    cursor: pointer;
    margin-top: -7px;
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 999px;
    background: rgba(var(--w2f-accent), 1);
    border: 2px solid rgba(255, 255, 255, 0.92);
    box-shadow: 0 0 16px rgba(var(--w2f-accent), 0.6);
    cursor: pointer;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const TextureSliderTicks = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: rgba(240, 242, 248, 0.45);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
`;

const BottomBar = styled.div`
  position: absolute;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  width: min(900px, 78vw);
  pointer-events: auto;

  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 0;
  border: 0;
  background: transparent;
`;

const Slots = styled.div`
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 6px;
`;

const SlotWrap = styled.div`
  position: relative;
  min-height: 44px;
  height: 44px;
`;

const Slot = styled.button<PillProps>`
  width: 100%;
  height: 100%;
  padding: 3px 4px;
  border-radius: 10px;
  border: 1px solid ${({ active }) => (active ? 'rgba(var(--w2f-accent), 0.7)' : 'rgba(255, 255, 255, 0.14)')};
  background: transparent;
  color: ${({ active }) => (active ? '#fff' : 'rgba(240, 242, 248, 0.7)')};
  font-weight: 800;
  letter-spacing: 0.03em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.65);
  cursor: pointer;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;

  transition:
    border-color 0.12s,
    color 0.12s;

  &:hover {
    color: #fff;
    border-color: rgba(var(--w2f-accent), 0.9);
  }
`;

const SlotLabel = styled.span<{ $wrap?: boolean; $fontSize: number }>`
  display: block;
  width: 100%;
  max-width: 100%;
  line-height: 1.12;
  text-align: center;
  word-break: break-word;
  overflow-wrap: anywhere;
  font-size: ${({ $fontSize }) => `${$fontSize}px`};
  white-space: ${({ $wrap }) => ($wrap ? 'normal' : 'nowrap')};

  ${({ $wrap }) =>
    $wrap &&
    css`
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    `}
`;

/** Shrinks (and wraps if needed) slot labels so full saved names stay visible. */
const FitSlotLabel = ({ text }: { text: string }) => {
  const labelRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(10);
  const [wrap, setWrap] = useState(false);

  useLayoutEffect(() => {
    const label = labelRef.current;
    const slot = label?.parentElement;
    if (!label || !slot) return;

    const fit = () => {
      const maxWidth = Math.max(0, slot.clientWidth - 8);
      const maxHeight = Math.max(0, slot.clientHeight - 6);
      if (maxWidth <= 0 || maxHeight <= 0) return;

      let size = 10;
      let useWrap = false;

      label.style.whiteSpace = 'nowrap';
      label.style.display = 'block';
      label.style.fontSize = `${size}px`;

      while (size > 6 && label.scrollWidth > maxWidth) {
        size -= 0.25;
        label.style.fontSize = `${size}px`;
      }

      if (label.scrollWidth > maxWidth) {
        useWrap = true;
        label.style.whiteSpace = 'normal';
        label.style.display = '-webkit-box';
        size = Math.min(size, 8.5);

        label.style.fontSize = `${size}px`;
        while (size > 5.5 && label.scrollHeight > maxHeight) {
          size -= 0.25;
          label.style.fontSize = `${size}px`;
        }
      }

      setFontSize(size);
      setWrap(useWrap);
    };

    fit();

    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(fit);
    observer.observe(slot);
    return () => observer.disconnect();
  }, [text]);

  return (
    <SlotLabel ref={labelRef} $fontSize={fontSize} $wrap={wrap}>
      {text}
    </SlotLabel>
  );
};

const SlotDialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 30;
  pointer-events: auto;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
`;

const SlotDialogPanel = styled.div`
  width: min(360px, 88vw);
  padding: 20px 22px 18px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(8, 8, 10, 0.94);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.65);

  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const SlotDialogTitle = styled.p`
  margin: 0;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(240, 242, 248, 0.72);
  text-align: center;
`;

const SlotDialogInput = styled.input`
  width: 100%;
  height: 42px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.04em;
  outline: none;
  text-align: center;

  &:focus {
    border-color: rgba(var(--w2f-accent), 0.85);
    box-shadow: 0 0 0 2px rgba(var(--w2f-accent), 0.22);
  }

  &::placeholder {
    color: rgba(240, 242, 248, 0.35);
  }
`;

const SlotDialogHint = styled.span`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-align: center;
  color: rgba(240, 242, 248, 0.45);
`;

const SlotDialogActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
`;

const SlotDialogButton = styled.button<{ tone?: 'primary' | 'ghost' | 'danger' }>`
  min-width: 92px;
  height: 36px;
  padding: 0 16px;
  border-radius: 10px;
  border: 1px solid
    ${({ tone }) =>
      tone === 'primary'
        ? 'rgba(var(--w2f-accent), 0.85)'
        : tone === 'danger'
          ? 'rgba(255, 255, 255, 0.14)'
          : 'rgba(255, 255, 255, 0.18)'};
  background: ${({ tone }) => (tone === 'primary' ? 'rgba(var(--w2f-accent), 0.18)' : 'transparent')};
  color: #fff;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    border-color 0.12s,
    background 0.12s,
    box-shadow 0.12s;

  &:hover {
    border-color: rgba(var(--w2f-accent), 0.95);
    box-shadow: 0 0 18px rgba(var(--w2f-accent), 0.28);
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

const Action = styled.button<{ tone?: 'primary' | 'ghost' | 'danger' }>`
  height: 36px;
  padding: 0 18px;
  border-radius: 10px;
  border: 1px solid
    ${({ tone }) =>
      tone === 'primary'
        ? 'rgba(var(--w2f-accent), 0.85)'
        : tone === 'danger'
          ? 'rgba(255, 255, 255, 0.18)'
          : 'rgba(255, 255, 255, 0.18)'};
  background: transparent;
  color: ${({ tone }) => (tone === 'primary' ? '#fff' : 'rgba(240, 242, 248, 0.9)')};
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
  cursor: pointer;
  transition:
    color 0.12s,
    border-color 0.12s,
    box-shadow 0.12s;

  &:hover {
    color: #fff;
    border-color: rgba(var(--w2f-accent), 0.95);
    box-shadow: ${({ tone }) =>
      tone === 'primary' ? '0 0 22px rgba(var(--w2f-accent), 0.45)' : '0 0 14px rgba(var(--w2f-accent), 0.28)'};
  }
`;

const DRAG_CLICK_THRESHOLD = 18;

const safeNumber = (value: unknown, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const safeRange = (min = 0, max = 0) => {
  const safeMin = safeNumber(min, 0);
  const safeMax = safeNumber(max, safeMin);

  if (safeMax < safeMin) return [safeMin];

  return Array.from({ length: Math.max(0, safeMax - safeMin + 1) }, (_, index) => safeMin + index);
};

const isEnabled = (value: unknown, fallback = true) => {
  if (typeof value === 'boolean') return value;
  return fallback;
};

const byComponentId = (items: PedComponent[]) =>
  items.reduce((result, item) => ({ ...result, [item.component_id]: item }), {} as Record<number, PedComponent>);

const byPropId = (items: PedProp[]) =>
  items.reduce((result, item) => ({ ...result, [item.prop_id]: item }), {} as Record<number, PedProp>);

const componentSettingsById = (items: ComponentSettings[]) =>
  items.reduce((result, item) => ({ ...result, [item.component_id]: item }), {} as Record<number, ComponentSettings>);

const propSettingsById = (items: PropSettings[]) =>
  items.reduce((result, item) => ({ ...result, [item.prop_id]: item }), {} as Record<number, PropSettings>);

const CARD_WIDTH = 150;
const CARD_GAP = 14;
const STRIDE = CARD_WIDTH + CARD_GAP;

const ClothingHero = ({
  componentSettings,
  propSettings,
  hairSettings,
  data,
  componentConfig,
  propConfig,
  hasTracker,
  isPedFreemodeModel,
  handleComponentDrawableChange,
  handleComponentTextureChange,
  handlePropDrawableChange,
  handlePropTextureChange,
  handleHairChange,
  handleRandomize,
  handleApplyOutfit,
  handleSave,
  handleExit,
  enableExit,
  cameraPreset,
  onCameraPreset,
}: ClothingHeroProps) => {
  const componentData = useMemo(() => byComponentId(data.components), [data.components]);
  const propData = useMemo(() => byPropId(data.props), [data.props]);
  const compSettings = useMemo(() => componentSettingsById(componentSettings), [componentSettings]);
  const prSettings = useMemo(() => propSettingsById(propSettings), [propSettings]);

  const categories = useMemo<Category[]>(() => {
    const all: Category[] = [
      {
        id: 'head',
        title: 'Head',
        type: 'component',
        targetId: 0,
        enabled: !isPedFreemodeModel,
      },
      {
        id: 'mask',
        title: 'Mask',
        type: 'component',
        targetId: 1,
        enabled: isEnabled(componentConfig?.masks),
      },
      {
        id: 'hair',
        title: 'Hair',
        type: 'hair',
        enabled: true,
      },
      {
        id: 'jackets',
        title: 'Jackets',
        type: 'component',
        targetId: 11,
        enabled: isEnabled(componentConfig?.jackets),
      },
      {
        id: 'shirt',
        title: 'Shirt',
        type: 'component',
        targetId: 8,
        enabled: isEnabled(componentConfig?.shirts),
      },
      {
        id: 'vest',
        title: 'Vest / Armor',
        type: 'component',
        targetId: 9,
        enabled: isEnabled(componentConfig?.bodyArmor),
      },
      {
        id: 'decals',
        title: 'Decals',
        type: 'component',
        targetId: 10,
        enabled: isEnabled(componentConfig?.decals),
      },
      {
        id: 'hands',
        title: 'Hands',
        type: 'component',
        targetId: 3,
        enabled: isEnabled(componentConfig?.upperBody),
      },
      {
        id: 'legs',
        title: 'Legs',
        type: 'component',
        targetId: 4,
        enabled: isEnabled(componentConfig?.lowerBody),
      },
      {
        id: 'shoes',
        title: 'Shoes',
        type: 'component',
        targetId: 6,
        enabled: isEnabled(componentConfig?.shoes),
      },
      {
        id: 'bag',
        title: 'Bag',
        type: 'component',
        targetId: 5,
        enabled: isEnabled(componentConfig?.bags),
      },
      {
        id: 'accessories',
        title: 'Chains',
        type: 'component',
        targetId: 7,
        enabled: isEnabled(componentConfig?.scarfAndChains) && !hasTracker,
      },
      {
        id: 'hat',
        title: 'Hat',
        type: 'prop',
        targetId: 0,
        enabled: isEnabled(propConfig?.hats),
      },
      {
        id: 'glasses',
        title: 'Glasses',
        type: 'prop',
        targetId: 1,
        enabled: isEnabled(propConfig?.glasses),
      },
      {
        id: 'earrings',
        title: 'Earrings',
        type: 'prop',
        targetId: 2,
        enabled: isEnabled(propConfig?.ear),
      },
      {
        id: 'watch',
        title: 'Watch',
        type: 'prop',
        targetId: 6,
        enabled: isEnabled(propConfig?.watches),
      },
      {
        id: 'bracelet',
        title: 'Bracelet',
        type: 'prop',
        targetId: 7,
        enabled: isEnabled(propConfig?.bracelets),
      },
    ];

    return all.filter(category => category.enabled);
  }, [componentConfig, propConfig, hasTracker, isPedFreemodeModel]);

  const [activeId, setActiveId] = useState(categories[0]?.id ?? 'hair');
  const activeCategory = categories.find(c => c.id === activeId) || categories[0];

  const [slots, setSlots] = useState<(OutfitSlot | null)[]>(() => loadStoredSlots());
  const [slotDialogIndex, setSlotDialogIndex] = useState<number | null>(null);
  const [slotDialogName, setSlotDialogName] = useState('');
  const slotDialogInputRef = useRef<HTMLInputElement>(null);

  // Persist slot edits across menu close/open + character reloads.
  useEffect(() => {
    persistSlots(slots);
  }, [slots]);

  useEffect(() => {
    if (slotDialogIndex === null) return;
    const timer = window.setTimeout(() => slotDialogInputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [slotDialogIndex]);

  useEffect(() => {
    if (slotDialogIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        setSlotDialogIndex(null);
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [slotDialogIndex]);

  // Top category pills: horizontal drag-scroll + ‹ › arrows.
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const categoryDrag = useRef({ dragging: false, startX: 0, scroll0: 0, pointerId: 0, targetCategoryId: null as string | null });
  const suppressCategoryClick = useRef(false);
  const [categoryBarDragging, setCategoryBarDragging] = useState(false);
  const [canScrollCatsLeft, setCanScrollCatsLeft] = useState(false);
  const [canScrollCatsRight, setCanScrollCatsRight] = useState(false);

  const updateCategoryScrollHints = useCallback(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    const eps = 2;
    setCanScrollCatsLeft(el.scrollLeft > eps);
    setCanScrollCatsRight(el.scrollLeft < maxScroll - eps);
  }, []);

  const scrollCategoryRow = useCallback(
    (dir: -1 | 1) => {
      const el = categoryScrollRef.current;
      if (!el) return;
      const step = Math.round(Math.min(340, Math.max(160, el.clientWidth * 0.42)));
      el.scrollBy({ left: dir * step, behavior: 'smooth' });
      window.setTimeout(updateCategoryScrollHints, 400);
    },
    [updateCategoryScrollHints],
  );

  useEffect(() => {
    updateCategoryScrollHints();

    const el = categoryScrollRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => updateCategoryScrollHints());
    ro.observe(el);
    return () => ro.disconnect();
  }, [categories, updateCategoryScrollHints]);

  useEffect(() => {
    if (categoryBarDragging) return;
    const root = categoryScrollRef.current;
    if (!root) return;
    const btn = Array.from(root.querySelectorAll<HTMLButtonElement>('button[data-category]')).find(
      b => b.getAttribute('data-category') === activeId,
    );
    btn?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    const t = window.setTimeout(updateCategoryScrollHints, 380);
    return () => window.clearTimeout(t);
  }, [activeId, categories.length, categoryBarDragging, updateCategoryScrollHints]);

  const handleCategoryPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const el = categoryScrollRef.current;
    if (!el) return;
    const categoryButton = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-category]');

    suppressCategoryClick.current = false;
    categoryDrag.current = {
      dragging: true,
      startX: event.clientX,
      scroll0: el.scrollLeft,
      pointerId: event.pointerId,
      targetCategoryId: categoryButton?.dataset.category ?? null,
    };
    setCategoryBarDragging(true);
    try {
      el.setPointerCapture(event.pointerId);
    } catch {
      /* CEF occasionally rejects capture */
    }
  }, []);

  const handleCategoryPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!categoryDrag.current.dragging || !categoryScrollRef.current) return;

      const dx = event.clientX - categoryDrag.current.startX;

      if (Math.abs(dx) > DRAG_CLICK_THRESHOLD) {
        suppressCategoryClick.current = true;
        categoryScrollRef.current.scrollLeft = categoryDrag.current.scroll0 - dx;
        updateCategoryScrollHints();
      }
    },
    [updateCategoryScrollHints],
  );

  const handleCategoryPointerUpOrCancel = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!categoryDrag.current.dragging) return;
      if (categoryDrag.current.pointerId !== event.pointerId) return;

      const dx = Math.abs(event.clientX - categoryDrag.current.startX);
      const selectedCategoryId = categoryDrag.current.targetCategoryId;

      categoryDrag.current.dragging = false;
      setCategoryBarDragging(false);

      try {
        categoryScrollRef.current?.releasePointerCapture(event.pointerId);
      } catch {
        /* noop */
      }

      updateCategoryScrollHints();

      if (dx <= DRAG_CLICK_THRESHOLD && selectedCategoryId) {
        suppressCategoryClick.current = false;
        setActiveId(selectedCategoryId);
        return;
      }

      window.setTimeout(() => {
        suppressCategoryClick.current = false;
      }, 0);
    },
    [updateCategoryScrollHints],
  );

  const handleLostCategoryPointerCapture = useCallback(() => {
    categoryDrag.current.dragging = false;
    suppressCategoryClick.current = false;
    setCategoryBarDragging(false);
    updateCategoryScrollHints();
  }, [updateCategoryScrollHints]);

  // Manual ped-rotation drag state.
  const spinDrag = useRef({ active: false, lastX: 0 });
  const [spinActive, setSpinActive] = useState(false);

  const onSpinPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    spinDrag.current = { active: true, lastX: e.clientX };
    setSpinActive(true);
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* CEF may reject */ }
  }, []);

  const onSpinPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!spinDrag.current.active) return;
    const dx = e.clientX - spinDrag.current.lastX;
    spinDrag.current.lastX = e.clientX;
    if (dx !== 0) {
      Nui.post('appearance_rotate_ped', { delta: dx * 0.8 });
    }
  }, []);

  const onSpinEnd = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!spinDrag.current.active) return;
    spinDrag.current.active = false;
    setSpinActive(false);
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* noop */ }
  }, []);

  // Drag state for the carousel.
  const stripRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ dragging: false, startX: 0, startOffset: 0, moved: 0 });
  const [offset, setOffset] = useState(0);
  const [animating, setAnimating] = useState(true);

  const currentDrawable = useCallback(
    (category: Category) => {
      if (category.type === 'hair') return safeNumber(data?.hair?.style, 0);

      if (category.type === 'component' && category.targetId !== undefined) {
        return safeNumber(componentData[category.targetId]?.drawable, 0);
      }

      if (category.type === 'prop' && category.targetId !== undefined) {
        return safeNumber(propData[category.targetId]?.drawable, -1);
      }

      return 0;
    },
    [componentData, propData, data?.hair?.style],
  );

  const currentTexture = useCallback(
    (category: Category) => {
      if (category.type === 'hair') return safeNumber(data?.hair?.texture, 0);

      if (category.type === 'component' && category.targetId !== undefined) {
        return safeNumber(componentData[category.targetId]?.texture, 0);
      }

      if (category.type === 'prop' && category.targetId !== undefined) {
        return safeNumber(propData[category.targetId]?.texture, 0);
      }

      return 0;
    },
    [componentData, propData, data?.hair?.texture],
  );

  const drawableRange = useCallback(
    (category: Category): number[] => {
      const current = currentDrawable(category);

      if (category.type === 'hair') {
        return safeRange(hairSettings?.style?.min ?? current, hairSettings?.style?.max ?? current);
      }

      if (category.type === 'component' && category.targetId !== undefined) {
        const settings = compSettings[category.targetId];

        if (!settings?.drawable) {
          return [current];
        }

        return safeRange(settings.drawable.min ?? current, settings.drawable.max ?? current);
      }

      if (category.type === 'prop' && category.targetId !== undefined) {
        const settings = prSettings[category.targetId];

        if (!settings?.drawable) {
          return [current];
        }

        return safeRange(settings.drawable.min ?? current, settings.drawable.max ?? current);
      }

      return [current];
    },
    [compSettings, prSettings, hairSettings, currentDrawable],
  );

  const textureRange = useCallback(
    (category: Category): number[] => {
      const current = currentTexture(category);

      if (category.type === 'hair') {
        return safeRange(0, hairSettings?.texture?.max ?? current);
      }

      if (category.type === 'component' && category.targetId !== undefined) {
        const settings = compSettings[category.targetId];

        if (!settings?.texture) {
          return [current];
        }

        return safeRange(0, settings.texture.max ?? current);
      }

      if (category.type === 'prop' && category.targetId !== undefined) {
        const settings = prSettings[category.targetId];

        if (!settings?.texture) {
          return [current];
        }

        return safeRange(0, settings.texture.max ?? current);
      }

      return [current];
    },
    [compSettings, prSettings, hairSettings, currentTexture],
  );

  const changeDrawable = (category: Category, drawable: number) => {
    if (category.type === 'hair') handleHairChange('style', drawable);
    if (category.type === 'component' && category.targetId !== undefined)
      handleComponentDrawableChange(category.targetId, drawable);
    if (category.type === 'prop' && category.targetId !== undefined)
      handlePropDrawableChange(category.targetId, drawable);
  };

  const changeTexture = (category: Category, texture: number) => {
    if (category.type === 'hair') handleHairChange('texture', texture);
    if (category.type === 'component' && category.targetId !== undefined)
      handleComponentTextureChange(category.targetId, texture);
    if (category.type === 'prop' && category.targetId !== undefined)
      handlePropTextureChange(category.targetId, texture);
  };

  // Sync strip offset with the actual current drawable each time the active category changes.
  const range = activeCategory ? drawableRange(activeCategory) : [];
  const activeIndex = activeCategory ? Math.max(0, range.indexOf(currentDrawable(activeCategory))) : 0;

  useEffect(() => {
    setAnimating(true);
    setOffset(-activeIndex * STRIDE - CARD_WIDTH / 2);
  }, [activeId, activeIndex]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!stripRef.current) return;
    stripRef.current.setPointerCapture(event.pointerId);
    dragState.current = { dragging: true, startX: event.clientX, startOffset: offset, moved: 0 };
    setAnimating(false);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.dragging) return;
    const dx = event.clientX - dragState.current.startX;
    dragState.current.moved = Math.abs(dx);
    setOffset(dragState.current.startOffset + dx);
  };

  const finishDrag = () => {
    if (!dragState.current.dragging) return;
    dragState.current.dragging = false;

    const total = range.length;
    if (total === 0 || !activeCategory) return;

    const ideal = -offset - CARD_WIDTH / 2;
    const targetIndex = Math.min(Math.max(Math.round(ideal / STRIDE), 0), total - 1);
    const drawable = range[targetIndex];

    setAnimating(true);
    setOffset(-targetIndex * STRIDE - CARD_WIDTH / 2);

    if (drawable !== currentDrawable(activeCategory)) {
      changeDrawable(activeCategory, drawable);
    }
  };

  const stepDrawable = (delta: number) => {
    if (!activeCategory || range.length === 0) return;
    const next = Math.min(Math.max(activeIndex + delta, 0), range.length - 1);
    changeDrawable(activeCategory, range[next]);
  };

  const saveSlot = useCallback(
    (index: number, customName?: string) => {
      setSlots(current => {
        const next = [...current];
        const existing = current[index];
        const name = customName?.trim() || existing?.name || `Look ${index + 1}`;
        next[index] = {
          name,
          data: JSON.parse(JSON.stringify(data)) as PedAppearance,
        };
        return next;
      });
    },
    [data],
  );

  const clearSlot = useCallback((index: number) => {
    setSlots(current => {
      const next = [...current];
      next[index] = null;
      return next;
    });
  }, []);

  const loadSlot = useCallback(
    (slot: OutfitSlot | null) => {
      if (!slot) return;
      handleApplyOutfit(slot.data);
    },
    [handleApplyOutfit],
  );

  const openSlotDialog = useCallback((index: number) => {
    setSlotDialogIndex(index);
    setSlotDialogName(slots[index]?.name ?? `Look ${index + 1}`);
  }, [slots]);

  const closeSlotDialog = useCallback(() => {
    setSlotDialogIndex(null);
  }, []);

  const commitSlotSave = useCallback(() => {
    if (slotDialogIndex === null) return;
    const trimmed = slotDialogName.trim();
    if (!trimmed) return;
    saveSlot(slotDialogIndex, trimmed);
    setSlotDialogIndex(null);
  }, [slotDialogIndex, slotDialogName, saveSlot]);

  const commitSlotLoad = useCallback(() => {
    if (slotDialogIndex === null) return;
    loadSlot(slots[slotDialogIndex]);
    setSlotDialogIndex(null);
  }, [slotDialogIndex, slots, loadSlot]);

  const randomLook = useCallback(() => {
    const componentUpdates: { component_id: number; drawable: number }[] = [];
    const propUpdates: { prop_id: number; drawable: number }[] = [];
    let hairUpdate: { style: number } | undefined;

    categories.forEach(category => {
      const options = drawableRange(category);
      if (options.length === 0) return;
      const random = options[Math.floor(Math.random() * options.length)];

      if (category.type === 'component' && category.targetId !== undefined) {
        componentUpdates.push({ component_id: category.targetId, drawable: random });
      } else if (category.type === 'prop' && category.targetId !== undefined) {
        propUpdates.push({ prop_id: category.targetId, drawable: random });
      } else if (category.type === 'hair') {
        hairUpdate = { style: random };
      }
    });

    handleRandomize({ components: componentUpdates, props: propUpdates, hair: hairUpdate });
  }, [categories, drawableRange, handleRandomize]);

  if (!activeCategory) return null;

  const textures = textureRange(activeCategory);
  const activeTexture = currentTexture(activeCategory);

  return (
    <Layer>
      <CameraAngleRail cameraPreset={cameraPreset} onSelect={onCameraPreset} />

      <SpinZone
        $active={spinActive}
        onPointerDown={onSpinPointerDown}
        onPointerMove={onSpinPointerMove}
        onPointerUp={onSpinEnd}
        onPointerCancel={onSpinEnd}
      >
        <SpinHint>↺ drag to rotate</SpinHint>
      </SpinZone>

      <CategoryTopChrome>
        <ScrollArrowRound
          type="button"
          aria-label="Scroll categories left"
          disabled={!canScrollCatsLeft}
          onClick={() => scrollCategoryRow(-1)}
        >
          ‹
        </ScrollArrowRound>

        <CategoryScroll
          ref={categoryScrollRef}
          tabIndex={0}
          role="toolbar"
          aria-label="Clothing categories"
          className={categoryBarDragging ? 'dragging' : ''}
          onPointerDown={handleCategoryPointerDown}
          onPointerMove={handleCategoryPointerMove}
          onPointerUp={handleCategoryPointerUpOrCancel}
          onPointerCancel={handleCategoryPointerUpOrCancel}
          onScroll={updateCategoryScrollHints}
          onLostPointerCapture={handleLostCategoryPointerCapture}
        >
          {categories.map(category => (
            <Pill
              key={category.id}
              active={category.id === activeCategory.id}
              type="button"
              data-category={category.id}
              onClick={() => {
                if (suppressCategoryClick.current) {
                  suppressCategoryClick.current = false;
                  return;
                }

                setActiveId(category.id);
              }}
            >
              {category.title}
            </Pill>
          ))}
        </CategoryScroll>

        <ScrollArrowRound
          type="button"
          aria-label="Scroll categories right"
          disabled={!canScrollCatsRight}
          onClick={() => scrollCategoryRow(1)}
        >
          ›
        </ScrollArrowRound>
      </CategoryTopChrome>

      <TextureSliderWrap>
        <TextureSliderLabel>
          Texture <strong>{activeTexture}</strong>
          <span className="muted">/ {Math.max(0, textures.length - 1)}</span>
        </TextureSliderLabel>
        <TextureSlider
          min={0}
          max={Math.max(0, textures.length - 1)}
          step={1}
          value={Math.max(0, textures.indexOf(activeTexture))}
          disabled={textures.length <= 1}
          onChange={event => {
            const index = parseInt(event.target.value, 10);
            const nextTexture = textures[index];
            if (typeof nextTexture === 'number' && nextTexture !== activeTexture) {
              changeTexture(activeCategory, nextTexture);
            }
          }}
        />
        <TextureSliderTicks>
          <span>0</span>
          <span>{Math.max(0, textures.length - 1)}</span>
        </TextureSliderTicks>
      </TextureSliderWrap>

      <StripWrap>
        <NavBtn onClick={() => stepDrawable(-1)}>‹</NavBtn>

        <Strip
          ref={stripRef}
          className={dragState.current.dragging ? 'dragging' : ''}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          onPointerLeave={finishDrag}
          onWheel={event => stepDrawable(event.deltaY > 0 ? 1 : -1)}
        >
          <StripInner
            ref={innerRef}
            className={animating ? '' : 'no-anim'}
            style={{ transform: `translate3d(${offset}px, 0, 0)` }}
          >
            {range.map((drawable, index) => {
              const isActive = drawable === currentDrawable(activeCategory);
              const distance = Math.abs(index - activeIndex);
              return (
                <Card
                  key={drawable}
                  active={isActive}
                  preview={distance === 1}
                  onClick={() => {
                    if (dragState.current.moved > 6) return;
                    if (!isActive) changeDrawable(activeCategory, drawable);
                  }}
                >
                  <small>{activeCategory.title}</small>
                  <strong>{drawable}</strong>
                </Card>
              );
            })}
          </StripInner>
        </Strip>

        <NavBtn onClick={() => stepDrawable(1)}>›</NavBtn>
      </StripWrap>

      <BottomBar>
        <Slots>
          {slots.map((slot, index) => {
            const label = slot ? slot.name : `Slot ${index + 1}`;

            return (
              <SlotWrap key={index}>
                <Slot
                  active={Boolean(slot)}
                  title={label}
                  onClick={() => openSlotDialog(index)}
                >
                  <FitSlotLabel text={label} />
                </Slot>
              </SlotWrap>
            );
          })}
        </Slots>

        <Actions>
          <Action onClick={randomLook}>Random</Action>
          <Action tone="primary" onClick={handleSave}>
            Save
          </Action>
          {enableExit && (
            <Action tone="danger" onClick={handleExit}>
              Exit
            </Action>
          )}
        </Actions>
      </BottomBar>

      {slotDialogIndex !== null && (
        <SlotDialogOverlay
          onMouseDown={event => {
            if (event.target === event.currentTarget) closeSlotDialog();
          }}
        >
          <SlotDialogPanel
            onMouseDown={event => event.stopPropagation()}
            onKeyDown={event => event.stopPropagation()}
          >
            <SlotDialogTitle>Quick select · Look {slotDialogIndex + 1}</SlotDialogTitle>
            <SlotDialogInput
              ref={slotDialogInputRef}
              value={slotDialogName}
              maxLength={24}
              placeholder={`Look ${slotDialogIndex + 1}`}
              onChange={event => setSlotDialogName(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  commitSlotSave();
                }
              }}
            />
            <SlotDialogHint>Press Enter to save your current outfit to this slot</SlotDialogHint>
            <SlotDialogActions>
              {slots[slotDialogIndex] && (
                <SlotDialogButton type="button" onClick={commitSlotLoad}>
                  Load
                </SlotDialogButton>
              )}
              <SlotDialogButton type="button" tone="primary" onClick={commitSlotSave}>
                Save
              </SlotDialogButton>
              {slots[slotDialogIndex] && (
                <SlotDialogButton
                  type="button"
                  tone="danger"
                  onClick={() => {
                    clearSlot(slotDialogIndex);
                    closeSlotDialog();
                  }}
                >
                  Clear
                </SlotDialogButton>
              )}
              <SlotDialogButton type="button" onClick={closeSlotDialog}>
                Cancel
              </SlotDialogButton>
            </SlotDialogActions>
          </SlotDialogPanel>
        </SlotDialogOverlay>
      )}
    </Layer>
  );
};

export default ClothingHero;
