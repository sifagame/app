import React from "react";
import "./App.css";
import { Box, Grid, Tabs, Tab, Container } from "@mui/material";
import Logo from "./components/Logo";
import Account from "./components/Account";
import Faucet from "./components/Faucet";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
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
  const [tab, setTab] = React.useState(0);

  const handleChangeTab = (_: React.SyntheticEvent, newTab: number) => {
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
              <Tab label="Faucet" />
              <Tab label="Play" disabled />
              <Tab label="Stake" disabled />
            </Tabs>
          </Grid>
          <Grid item sx={{ flexGrow: 1 }}>
            <Account />
          </Grid>
        </Grid>
      </header>
      <CustomTabPanel value={tab} index={0}>
        <Faucet />
      </CustomTabPanel>
      <CustomTabPanel value={tab} index={1}>
        TBA
      </CustomTabPanel>
      <CustomTabPanel value={tab} index={2}>
        Vault
      </CustomTabPanel>
    </Container>
  );
}

export default App;
