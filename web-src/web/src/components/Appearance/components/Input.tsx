import { useCallback, useRef } from 'react';
import styled from 'styled-components';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface InputProps {
  title?: string;
  min?: number;
  max?: number;
  blacklisted?: number[];
  defaultValue: number;
  clientValue: number;
  onChange: (value: number) => void;
}

const Container = styled.div`
  min-width: 0;

  display: flex;
  flex-direction: column;
  flex-grow: 1;

  margin-top: ${({ title }) => (title ? '5px' : '0')};

  > span {
    width: 100%;

    display: flex;
    justify-content: space-between;
    color: var(--w2f-muted);
    font-weight: 600;
    letter-spacing: 0.04em;
  }

  > div {
    min-width: 0;
    height: 30px;

    display: flex;
    align-items: center;

    margin-top: 10px;

    button {
      height: 100%;
      min-width: 30px;

      display: flex;
      align-items: center;
      justify-content: center;

      color: rgba(${props => props.theme.fontColor || '255, 255, 255'}, 1);

      outline: 0;
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 8px;

      background: rgba(255, 255, 255, 0.045);

      &:hover {
        color: rgba(${props => props.theme.fontColorHover || '255, 255, 255'}, 1);
        background: rgba(${props => props.theme.primaryBackground || '192, 28, 40'}, 0.55);
        transition: background 0.12s, border-color 0.12s;
      }
    }

    input {
      min-width: 0;
      height: 100%;

      flex-grow: 1;
      flex-shrink: 1;

      text-align: center;
      font-size: 14px;
      color: rgba(${props => props.theme.fontColor || '255, 255, 255'}, 1);

      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 8px;
      margin: 0 2px;

      background: rgba(${props => props.theme.secondaryBackground || '10, 10, 12'}, 0.78);

      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    }
  }
`;

const Input: React.FC<InputProps> = ({ title, min = 0, max = 255, blacklisted = [], defaultValue, clientValue, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleContainerClick = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  const isBlacklisted = function (_value: number, blacklisted: number[]) {
    for (var i = 0; i < blacklisted.length; i++) {
      if (blacklisted[i] == _value) {
        return true
      }
    }
    return false
  }

  const normalize = function (_value: number) {
    if (_value < min) {
      _value = max;
    } else if (_value > max) {
      _value = min;
    }

    return _value;
  }

  const checkBlacklisted = function (_value: number, blacklisted: number[], factor: number) {
    if(factor === 0) {
      if(!isBlacklisted(_value, blacklisted)) {
        return normalize(_value);
      }
      factor = _value > defaultValue ? 1 : -1;
    }

    do {
      _value = normalize(_value + factor);
    } while (isBlacklisted(_value, blacklisted))
    return _value;
  };

  const getSafeValue = useCallback(
    (_value: number, factor: number) => {
      let safeValue = _value;

      return checkBlacklisted(safeValue, blacklisted, factor);
    },
    [min, max, blacklisted],
  );

  const handleChange = useCallback(
    (_value: any, factor: number) => {
      let parsedValue;

      if (!_value && _value !== 0) return;

      if (Number.isNaN(_value)) return;

      if (typeof _value === 'string') {
        parsedValue = parseInt(_value);
      } else {
        parsedValue = _value;
      }

      const safeValue = getSafeValue(parsedValue, factor);

      onChange(safeValue);
    },
    [getSafeValue, onChange],
  );

  return (
    <Container onClick={handleContainerClick}>
      <span>
        <small>{title}</small>
        <small>{clientValue} / {max}</small>
      </span>
      <div>
        <button type="button" onClick={() => handleChange(defaultValue, -1)}>
          <FiChevronLeft strokeWidth={5} />
        </button>
        <input type="number" ref={inputRef} value={defaultValue} onChange={e => handleChange(e.target.value, 0)} />
        <button type="button" onClick={() => handleChange(defaultValue, 1)}>
          <FiChevronRight strokeWidth={5} />
        </button>
      </div>
    </Container>
  );
};

export default Input;
