import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <div className="footer">
      <p>&copy; 2024 LEMES. All Rights Reserved</p>
      <div className="footer__links">
        {["About", "Privacy Policy", "licensing", "Contact"].map((item) => (
          <Link key={item} href={`/${item.toLowerCase().replace("", "-")}`} className="footer__link">
            {item}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Footer;
