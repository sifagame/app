import React from "react";
import "./App.css";
import { Box, Grid, Tabs, Tab, Container } from "@mui/material";
import Logo from "./components/Logo";
import Account from "./components/Account";
import Faucet from "./components/Faucet";
import { Emitter } from "./components/Emitter";

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

  const handleChangeTab = (_: React.SyntheticEvent, newTab: string) => {
    setTab(newTab);
  };

  return (
    <Container maxWidth="lg">
      <header>
        <Grid container sx={{ justifyContent: "space-between" }}>
          <Grid item>
            <Logo />
          </Grid>
          <Grid item>
            <Tabs
              value={tab}
              onChange={handleChangeTab}
              aria-label="basic tabs example"
            >
              <Tab value="faucet" label="Faucet" />
			  <Tab value="emitter" label="Emitter" />
              <Tab value="play" label="Play" disabled />
              <Tab value="stake" label="Stake" disabled />
            </Tabs>
          </Grid>
          <Grid item sx={{ flexGrow: 1 }}>
            <Account />
          </Grid>
        </Grid>
      </header>
      <CustomTabPanel value={tab} index="faucet">
        <Faucet />
      </CustomTabPanel>
      <CustomTabPanel value={tab} index="emitter">
        <Emitter />
      </CustomTabPanel>
      <CustomTabPanel value={tab} index="play">
        TBA
      </CustomTabPanel>
      <CustomTabPanel value={tab} index="stake">
        Vault
      </CustomTabPanel>
    </Container>
  );
}

export default App;
