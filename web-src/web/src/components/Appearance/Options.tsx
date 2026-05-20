import { useState, useRef, useEffect, ReactElement, useCallback, ReactNode } from 'react';
import styled, { css } from 'styled-components';
import {
  FaVideo,
  FaStreetView,
  FaUndo,
  FaRedo,
  FaSave,
  FaTimes,
  FaTshirt,
  FaHatCowboy,
  FaSocks,
} from 'react-icons/fa';
import { GiClothes } from 'react-icons/gi';

import { CameraPreset, ClothesState, RotateState } from './interfaces';
import { CAMERA_PRESETS } from './cameraPresets';

interface ToggleButtonProps {
  active: boolean;
}

interface ToggleOptionProps {
  active: boolean;
  onClick: () => void;
  children?: ReactNode;
  title?: string;
  /** Transparent glass style (camera presets sidebar). */
  glass?: boolean;
}

interface ExtendendContainerProps {
  width: number;
}

interface ExtendendOptionProps {
  icon: ReactElement;
  children?: ReactNode;
  /** Transparent backgrounds for sidebar camera grouping. */
  glass?: boolean;
}

interface OptionsProps {
  cameraPreset: CameraPreset;
  rotate: RotateState;
  clothes: ClothesState;
  handleSetClothes: (key: keyof ClothesState) => void;
  handleSetCameraPreset: (preset: CameraPreset) => void;
  handleTurnAround: () => void;
  handleRotateLeft: () => void;
  handleRotateRight: () => void;
  handleSave: () => void;
  handleExit: () => void;
  enableExit: boolean;
}

const Container = styled.div`
  height: 100vh;
  width: 62px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;

  padding: 28px 0;

  > * {
    & + * {
      margin-top: 10px;
    }
  }
`;

const ToggleButton = styled.button<ToggleButtonProps>`
  height: 42px;
  width: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${props => props.theme.borderRadius || '4px'};

  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);

  transition: all 0.2s;

  color: rgba(${props => props.theme.fontColor || '255, 255, 255'}, 0.9);
  background: rgba(${props => props.theme.secondaryBackground || '10, 10, 12'}, 0.72);
  backdrop-filter: blur(14px);

  &:hover {
    color: rgba(${props => props.theme.fontColor || '255, 255, 255'}, 1);
    background: rgba(${props => props.theme.primaryBackground || '192, 28, 40'}, 0.65);
    transition: background 0.12s, border-color 0.12s;
    border-color: rgba(${props => props.theme.primaryBackground || '192, 28, 40'}, 0.75);
  }

  &:active {
    filter: brightness(0.9);
  }

  ${({ active }) =>
    active &&
    css`
      color: rgba(${props => props.theme.fontColorSelected || '0, 0, 0'}, 0.7);
      background: rgba(${props => props.theme.primaryBackgroundSelected || '220, 38, 38'}, 0.9);

      &:hover {
        color: rgba(${props => props.theme.fontColorSelected || '0, 0, 0'}, 0.9);
        background: rgba(${props => props.theme.primaryBackgroundSelected || '255, 255, 255'}, 1);
        ${props => props.theme.smoothBackgroundTransition ? 'transition: background 0.2s;' : ''}
      }
    `}
`;

const GlassToggleButton = styled.button<ToggleButtonProps>`
  height: 42px;
  width: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: ${props => props.theme.borderRadius || '4px'};

  transition: border-color 0.12s, background 0.12s, color 0.12s;

  box-shadow: none;

  border: 1px solid
    ${({ active }) => (active ? 'rgba(239, 68, 68, 0.45)' : 'rgba(255, 255, 255, 0.08)')};
  background: ${({ active }) =>
    active ? 'rgba(239, 68, 68, 0.12)' : 'transparent'};
  color: rgba(${props => props.theme.fontColor || '255, 255, 255'}, ${({ active }) => (active ? '1' : '0.86')});

  &:hover {
    color: rgba(${props => props.theme.fontColor || '255, 255, 255'}, 1);
    border-color: rgba(239, 68, 68, 0.55);
    background: ${({ active }) =>
      active ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.07)'};
  }

  &:active {
    filter: brightness(0.94);
  }
`;

const Option = styled.button`
  height: 42px;
  width: 42px;

  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${props => props.theme.borderRadius || '4px'};

  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);

  transition: all 0.1s;

  color: rgba(${props => props.theme.fontColor || '255, 255, 255'}, 0.9);
  background: rgba(${props => props.theme.secondaryBackground || '10, 10, 12'}, 0.72);
  backdrop-filter: blur(14px);

  &:hover {
    color: rgba(${props => props.theme.fontColorHover || '255, 255, 255'}, 1);
    background: rgba(${props => props.theme.primaryBackground || '192, 28, 40'}, 0.65);
    transition: background 0.12s, border-color 0.12s;
    border-color: rgba(${props => props.theme.primaryBackground || '192, 28, 40'}, 0.75);
  }

  &:active {
    color: rgba(${props => props.theme.secondaryBackground || '0, 0, 0'}, 0.7);
    background: rgba(${props => props.theme.primaryBackgroundSelected || '220, 38, 38'}, 0.9);
  }
`;

const ExtendedContainer = styled.div<ExtendendContainerProps>`
  height: 40px;

  display: flex;
  align-items: flex-start;
  justify-content: flex-start;

  width: ${({ width }) => `${width + 40}px`};

  transition: width 0.3s;

  overflow: hidden;
`;

const ExtendedIcon = styled.div<{ $glass?: boolean }>`
  height: 40px;
  width: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: ${props => props.theme.borderRadius || '4px'};

  border: ${({ $glass }) => ($glass ? `1px solid rgba(255, 255, 255, 0.08)` : '0')};
  color: rgba(${props => props.theme.fontColor || '255, 255, 255'}, 0.9);

  ${({ $glass }) =>
    $glass
      ? css`
          background: transparent;
        `
      : css`
          border: 0;
          background: rgba(${props => props.theme.secondaryBackground || '0, 0, 0'}, 0.7);
        `}
`;

const ExtendedChildren = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;

  padding-left: 10px;

  > * {
    & + * {
      margin-left: 10px;
    }
  }
`;

const ToggleOption: React.FC<ToggleOptionProps> = ({ children, active, onClick, title, glass }) => {
  const Btn = glass ? GlassToggleButton : ToggleButton;
  return (
    <Btn type="button" active={active} onClick={onClick} title={title}>
      {children}
    </Btn>
  );
};

const ExtendedOption: React.FC<ExtendendOptionProps> = ({ children, icon, glass }) => {
  const [extended, setExtended] = useState(true);

  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      setWidth(ref.current.offsetWidth);
      setExtended(false);
    }
  }, [ref, setWidth]);

  const handleMouseEnter = useCallback(() => {
    setExtended(true);
  }, [setExtended]);

  const handleMouseLeave = useCallback(() => {
    setExtended(false);
  }, [setExtended]);

  return (
    <ExtendedContainer width={extended ? width : 0} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <ExtendedIcon $glass={glass}>{icon}</ExtendedIcon>
      <ExtendedChildren ref={ref}>{children}</ExtendedChildren>
    </ExtendedContainer>
  );
};

const Options: React.FC<OptionsProps> = ({
  cameraPreset,
  rotate,
  clothes,
  handleSetClothes,
  handleSetCameraPreset,
  handleTurnAround,
  handleRotateLeft,
  handleRotateRight,
  handleExit,
  handleSave,
  enableExit,
}) => {
  return (
    <Container>
      <ExtendedOption glass icon={<FaVideo size={20} />}>
        {CAMERA_PRESETS.map(({ id, title, Icon }) => (
          <ToggleOption
            key={id}
            glass
            active={cameraPreset === id}
            onClick={() => handleSetCameraPreset(id)}
            title={title}
          >
            <Icon size={20} />
          </ToggleOption>
        ))}
      </ExtendedOption>
      <ExtendedOption icon={<GiClothes size={20} />}>
        <ToggleOption active={clothes.head} onClick={() => handleSetClothes('head')}>
          <FaHatCowboy size={20} />
        </ToggleOption>
        <ToggleOption active={clothes.body} onClick={() => handleSetClothes('body')}>
          <FaTshirt size={20} />
        </ToggleOption>
        <ToggleOption active={clothes.bottom} onClick={() => handleSetClothes('bottom')}>
          <FaSocks size={20} />
        </ToggleOption>
      </ExtendedOption>
      <Option onClick={handleTurnAround}>
        <FaStreetView size={20} />
      </Option>
      <ToggleOption active={rotate.left} onClick={handleRotateLeft}>
        <FaRedo size={20} />
      </ToggleOption>
      <ToggleOption active={rotate.right} onClick={handleRotateRight}>
        <FaUndo size={20} />
      </ToggleOption>
      <Option onClick={handleSave}>
        <FaSave size={20} />
      </Option>
      {enableExit &&
      <Option onClick={handleExit}>
        <FaTimes size={20} />
      </Option>}
      
    </Container>
  );
};

export default Options;
