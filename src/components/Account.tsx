import { Box, Button } from "@mui/material";
import { useAccount, useConnect } from "wagmi";
import { ConnectedAccount } from "./ConnectedAccount";

const Account = () => {
  const account = useAccount();
  const { connectors, connect } = useConnect();

  const connector = connectors[0];

  return (
    <Box sx={{ pt: 1, display: "flex", justifyContent: "flex-end" }}>
      {account.status === "connected" ? (
        <ConnectedAccount address={account.address} />
      ) : (
        <Button variant="outlined" onClick={() => connect({ connector })}>
          Connect
        </Button>
      )}
    </Box>
  );
};

export default Account;
