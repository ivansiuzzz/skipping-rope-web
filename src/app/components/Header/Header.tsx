import React from "react";
import { Button } from "antd";

interface HeaderProps {
  title: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  buttonText,
  onButtonClick,
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 0px",
      }}
    >
      <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 600 }}>{title}</h1>

      {buttonText && (
        <Button type="primary" size="large" onClick={onButtonClick}>
          {buttonText}
        </Button>
      )}
    </div>
  );
};
