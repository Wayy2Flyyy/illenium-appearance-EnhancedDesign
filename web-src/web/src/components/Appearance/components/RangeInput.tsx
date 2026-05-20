import { useCallback, useRef } from 'react';
import styled from 'styled-components';

interface RangeInputProps {
  title?: string;
  min: number;
  max: number;
  factor?: number;
  defaultValue?: number;
  clientValue?: number;
  onChange: (value: number) => void;
}

const Container = styled.div`
  width: 100%;

  > span {
    width: 100%;

    display: flex;
    justify-content: space-between;
    color: var(--w2f-muted);
    font-weight: 600;
    letter-spacing: 0.04em;
  }

  > div {
    display: flex;
    align-items: center;

    position: relative;

    margin-top: 10px;

    > small {
    color: var(--w2f-muted);
    font-weight: 700;
      font-size: 8px;
    }
  }

  input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.08);
    outline: none;
    opacity: 1;
    border-radius: 999px;
    margin: 0 10px;
  }

  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: rgba(${props => props.theme.primaryBackground || '192, 28, 40'}, 1);
    cursor: pointer;
    border: 2px solid rgba(255, 255, 255, 0.85);
    border-radius: 999px;
    box-shadow: 0 0 18px rgba(${props => props.theme.primaryBackground || '192, 28, 40'}, 0.65);
  }
`;

const RangeInput: React.FC<RangeInputProps> = ({
  min,
  max,
  factor = 1,
  title,
  defaultValue = 1,
  clientValue,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleContainerClick = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  const handleChange = useCallback(
    (e: { target: { value: string } }) => {
      const parsedValue = parseFloat(e.target.value);
      onChange(parsedValue);
    },
    [onChange],
  );

  return (
    <Container onClick={handleContainerClick}>
      <span>
        <small>
          {title}: {defaultValue}
        </small>
        <small>{clientValue}</small>
      </span>
      <div>
        <small>{min}</small>
        <input
          type="range"
          ref={inputRef}
          value={defaultValue}
          min={min}
          max={max}
          step={factor}
          onChange={handleChange}
        />
        <small>{max}</small>
      </div>
    </Container>
  );
};

export default RangeInput;
