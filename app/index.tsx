import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Delay navigation until after the first render
    const timeout = setTimeout(() => {
      router.replace("/onboarding");
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  return null;
}
