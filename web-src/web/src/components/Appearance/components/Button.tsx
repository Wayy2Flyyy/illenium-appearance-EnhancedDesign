import { ReactNode } from 'react';
import styled from 'styled-components';

interface ButtonProps {
  children: string | ReactNode;
  margin?: string;
  width?: string;
  onClick: () => void;
}

const CustomButton = styled.span<ButtonProps>`
  padding: 9px 14px;
  margin: ${props => props?.margin || "0px"};
  width: ${props => props?.width || "auto"};
  color: rgba(${props => props.theme.fontColor || '255, 255, 255'}, 0.9);
  background:
    linear-gradient(135deg, rgba(${props => props.theme.primaryBackground || '192, 28, 40'}, 0.45), rgba(${props => props.theme.secondaryBackground || '10, 10, 12'}, 0.78));
  text-align: center;
  border-radius: ${props => props.theme.borderRadius || "4px"};
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: filter 0.12s, border-color 0.12s;

  &:hover {
    border-color: rgba(${props => props.theme.primaryBackground || '192, 28, 40'}, 0.75);
    filter: brightness(1.16);
  }
`;

const Button = ({ children, onClick, margin, width }: ButtonProps) => {
  return <CustomButton onClick={onClick} margin={margin} width={width}>{children}</CustomButton>;
};

export default Button;
