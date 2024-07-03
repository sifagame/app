import GA from "react-ga";

const useAnalyticsEventTracker = (category = "Main") => {
  const eventTracker = (action = "Default Action", label = "Default Label") => {
    GA.event({ category, action, label });
  };
  return eventTracker;
};
export default useAnalyticsEventTracker;
