import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function RegionPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/'); }, [router]);
  return null;
}
