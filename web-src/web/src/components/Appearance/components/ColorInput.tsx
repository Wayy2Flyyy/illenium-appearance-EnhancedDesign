import { useCallback } from 'react';
import styled, { css } from 'styled-components';

interface ColorInputProps {
  title?: string;
  colors?: number[][];
  defaultValue?: number;
  clientValue?: number;
  onChange: (value: number) => void;
}

interface ButtonProps {
  selected: boolean;
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
    width: 100%;

    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: flex-start;

    margin-top: 10px;
  }
`;

const Button = styled.button<ButtonProps>`
  height: 22px;
  width: 22px;

  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;

  margin: 2px;

  &:hover {
    border: 2px solid rgba(${props => props.theme.primaryBackground || '192, 28, 40'}, 0.85);
    transform: translateY(-1px);
  }

  ${({ selected }) =>
    selected &&
    css`
      border: 2px solid rgba(${props => props.theme.primaryBackground || '192, 28, 40'}, 1);
      box-shadow: 0 0 0 2px rgba(${props => props.theme.primaryBackground || '192, 28, 40'}, 0.25);
    `}
`;

const ColorInput: React.FC<ColorInputProps> = ({ title, colors = [], defaultValue, clientValue, onChange }) => {
  const selectColor = useCallback(
    (color: number) => {
      onChange(color);
    },
    [onChange],
  );

  return (
    <Container>
      <span>
        <small>{`${title}: ${defaultValue}`}</small>
        <small>{clientValue}</small>
      </span>
      <div>
        {colors.map((color, index) => (
          <Button
            key={index}
            style={{ backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})` }}
            selected={defaultValue === index}
            onClick={() => selectColor(index)}
          />
        ))}
      </div>
    </Container>
  );
};

export default ColorInput;
