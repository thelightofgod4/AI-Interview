import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

export default async function Home() {
  const { userId } = auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  redirect('/dashboard');
} 
