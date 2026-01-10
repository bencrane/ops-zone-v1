import { redirect } from 'next/navigation';

export default function AdminPage() {
  // Legacy admin route - redirect to workspace selector
  redirect('/select');
}

