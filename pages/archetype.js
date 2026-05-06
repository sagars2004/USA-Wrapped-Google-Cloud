import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ArchetypePage() {
  const router = useRouter();
  useEffect(() => { router.replace('/'); }, [router]);
  return null;
}
