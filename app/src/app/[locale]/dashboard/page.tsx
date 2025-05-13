import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    // Although middleware should handle this, good to have a fallback
    // Or use auth().protect() in middleware for a more direct approach
    redirect('/sign-in'); 
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="mb-4">
        Welcome, {user.firstName || user.username || 'User'}! This is your protected dashboard.
      </p>
      <div className="bg-gray-100 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">User Details:</h2>
        <pre className="bg-gray-200 p-4 rounded overflow-x-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  );
}