import React from "react";
import "./App.css";
import { Box, Grid, Tabs, Tab, Container } from "@mui/material";
import Logo from "./components/Logo";
import Account from "./components/Account";
import Faucet from "./components/Faucet";
import Emitter from "./components/Emitter";
import Staking from "./components/Staking";
import { useAccount } from "wagmi";
import { config } from "./wagmi";

interface TabPanelProps {
  children?: React.ReactNode;
  index: string;
  value: string;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function App() {
  const [tab, setTab] = React.useState("faucet");
  const { address, chainId } = useAccount();

  const connected = address && chainId === config.chains[0]?.id;

  const handleChangeTab = (_: React.SyntheticEvent, newTab: string) => {
    setTab(newTab);
  };

  return (
    <Container maxWidth="lg">
      <header>
        <Grid container sx={{ justifyContent: "space-between", pb: 5 }}>
          <Grid item>
            <Logo />
          </Grid>
          <Grid item>
            <Tabs
              value={tab}
              onChange={handleChangeTab}
              aria-label="SIFA tabs"
            >
              <Tab value="play" label="Play" disabled />
              <Tab value="faucet" label="Faucet" />
              <Tab value="emitter" label="Emitter" />
              <Tab value="stake" label="Stake" />
            </Tabs>
          </Grid>
          <Grid item sx={{ flexGrow: 1 }}>
            <Account />
          </Grid>
        </Grid>
      </header>
      {connected ? (
        <>
          <CustomTabPanel value={tab} index="play">
            TBA
          </CustomTabPanel>
          <CustomTabPanel value={tab} index="faucet">
            <Faucet />
          </CustomTabPanel>
          <CustomTabPanel value={tab} index="emitter">
            <Emitter />
          </CustomTabPanel>
          <CustomTabPanel value={tab} index="stake">
            <Staking />
          </CustomTabPanel>
        </>
      ) : (
        <p>Please connect</p>
      )}
    </Container>
  );
}

export default App;
