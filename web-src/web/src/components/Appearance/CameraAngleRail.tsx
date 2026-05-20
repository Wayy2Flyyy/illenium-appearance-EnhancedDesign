import styled from 'styled-components';

import type { CameraPreset } from './interfaces';
import { CAMERA_PRESETS } from './cameraPresets';

const Rail = styled.div`
  position: absolute;
  top: 50%;
  right: max(22px, 2vw);
  transform: translateY(-50%);
  pointer-events: auto;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  border-radius: 999px;

  /* Omit backdrop-filter: FiveM DUI often composites it as a solid dark tile. */
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  box-shadow: none;
`;

const AngleBtn = styled.button<{ $active: boolean }>`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 999px;
  cursor: pointer;
  color: ${({ $active }) => ($active ? '#fff' : 'rgba(240, 242, 248, 0.7)')};
  border: 1px solid
    ${({ $active }) => ($active ? 'rgba(239, 68, 68, 0.75)' : 'rgba(255, 255, 255, 0.14)')};
  background: ${({ $active }) =>
    $active ? 'rgba(239, 68, 68, 0.14)' : 'transparent'};
  box-shadow: ${({ $active }) =>
    $active ? '0 0 14px rgba(239, 68, 68, 0.2)' : 'none'};
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.65);
  transition:
    color 0.12s,
    border-color 0.12s,
    background 0.12s,
    box-shadow 0.12s;

  &:hover {
    color: #fff;
    border-color: rgba(239, 68, 68, 0.75);
    background: ${({ $active }) =>
      $active ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.06)'};
  }
`;

interface CameraAngleRailProps {
  cameraPreset: CameraPreset;
  onSelect: (preset: CameraPreset) => void;
}

const CameraAngleRail = ({ cameraPreset, onSelect }: CameraAngleRailProps) => (
  <Rail role="toolbar" aria-label="Camera angles">
    {CAMERA_PRESETS.map(({ id, title, Icon }) => (
      <AngleBtn
        key={id}
        type="button"
        $active={cameraPreset === id}
        title={title}
        aria-label={title}
        aria-pressed={cameraPreset === id}
        onClick={() => onSelect(id)}
      >
        <Icon size={19} />
      </AngleBtn>
    ))}
  </Rail>
);

export default CameraAngleRail;
