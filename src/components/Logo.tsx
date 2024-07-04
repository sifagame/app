import { Badge } from "@mui/material";
import "../styles/Logo.scss";

const Logo = () => {
  const isTestnet = import.meta.env.VITE_ENVIRONMENT === "testnet";

  return isTestnet ? (
    <a href="/" className="sifa-logo">
      <Badge color="warning" badgeContent="testnet">
        <img src="sifa.svg" alt="Sifa" />
      </Badge>
    </a>
  ) : (
    <a href="/" className="sifa-logo">
      <img src="sifa.svg" alt="Sifa" />
    </a>
  );
};

export default Logo;
