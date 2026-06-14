import { useCallback } from 'react';
import styled from 'styled-components';

interface OpacityControlProps {
  value: number;
  onChange: (value: number) => void;
}

const Panel = styled.div`
  position: fixed;
  top: 18px;
  right: 22px;
  z-index: 25;
  pointer-events: auto;

  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 999px;

  /* Omit backdrop-filter: FiveM DUI often composites it as a solid dark tile. */
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  box-shadow: none;

  user-select: none;
`;

const Label = styled.span`
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(240, 242, 248, 0.78);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
  white-space: nowrap;
`;

const Value = styled.strong`
  min-width: 34px;
  text-align: right;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.04em;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
`;

const Slider = styled.input.attrs({ type: 'range' })`
  -webkit-appearance: none;
  appearance: none;
  width: 120px;
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
    width: 16px;
    height: 16px;
    border-radius: 999px;
    background: rgba(var(--w2f-accent), 1);
    border: 2px solid rgba(255, 255, 255, 0.92);
    box-shadow: 0 0 16px rgba(var(--w2f-accent), 0.6);
    cursor: pointer;
    margin-top: -6px;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 999px;
    background: rgba(var(--w2f-accent), 1);
    border: 2px solid rgba(255, 255, 255, 0.92);
    box-shadow: 0 0 16px rgba(var(--w2f-accent), 0.6);
    cursor: pointer;
  }
`;

/**
 * Floating slider that fades the whole appearance menu so the player can see
 * more of the character / world behind it. Rendered as a sibling of the menu
 * `Wrapper` (not inside it) so the control itself never fades out — otherwise
 * dragging to a low opacity would hide the very slider needed to bring it back.
 */
const OpacityControl = ({ value, onChange }: OpacityControlProps) => {
  const handleChange = useCallback(
    (event: { target: { value: string } }) => {
      onChange(parseInt(event.target.value, 10) / 100);
    },
    [onChange],
  );

  return (
    <Panel role="group" aria-label="Menu opacity">
      <Label>Opacity</Label>
      <Slider
        min={20}
        max={100}
        step={5}
        value={Math.round(value * 100)}
        onChange={handleChange}
        aria-label="Menu opacity"
      />
      <Value>{Math.round(value * 100)}%</Value>
    </Panel>
  );
};

export default OpacityControl;
