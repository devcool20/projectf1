import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function StartupRedirect() {
  const router = useRouter();

  // On mount, immediately send the user to the Community tab
  useEffect(() => {
    router.replace('/community');
  }, [router]);

  // Render nothing – we’re just here to redirect
  return null;
}
