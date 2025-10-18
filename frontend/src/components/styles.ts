// SongForm.styles.ts
import styled from "@emotion/styled";

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-bottom: 24px;
`;

export const Input = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid ${({ hasError }) => (hasError ? "red" : "#ccc")};
  font-size: 16px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #1890ff;
  }
`;

export const ErrorText = styled.span`
  color: red;
  font-size: 14px;
`;

export const Button = styled.button`
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  background-color: #52c41a;
  color: white;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: #389e0d;
  }
`;