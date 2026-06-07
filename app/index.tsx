import { Redirect } from "expo-router";

// Always show onboarding — remove the AsyncStorage gate for dev/testing.
// To restore "show once" behaviour, bring back the AsyncStorage check.
export default function Index() {
  return <Redirect href="/onboarding" />;
}