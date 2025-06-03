import React, { ReactNode } from "react";

interface HeaderProps {
  title: string;
  subtitle: string;
  rightElement?: ReactNode;
}

const Header = ({ title, subtitle, rightElement }: HeaderProps) => {
  return (
    <div className="header">
      <div>
        <h1 className="header__title">{title}</h1>
        <p className="header__subtitle">{subtitle}</p>
      </div>
      {rightElement && <div className="header__right">{rightElement}</div>}
    </div>
  );
};

export default Header;
