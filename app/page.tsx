import Link from "next/link";
import { PrismaClient } from '../lib/generated/prisma-client'
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

const prisma = new PrismaClient();

export default async function Home() {
  const userCount = await prisma.user.count();
  const session = await getServerSession(authOptions);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Contab
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {session?.user ? `Signed in as ${session.user.email}` : "You are not signed in"}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Users</h2>
            <p className="text-gray-600 mb-4">
              Currently managing {userCount} user{userCount !== 1 ? 's' : ''}
            </p>
            <Link 
              href="/users"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Manage Users
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Contacts</h2>
        <div className="mt-8">
          {session?.user ? (
            <div className="flex items-center gap-4">
              <Link href="/protected" className="text-blue-600 underline">
                Go to protected page
              </Link>
              <form action="/api/auth/signout" method="post">
                <button className="bg-gray-200 px-3 py-2 rounded">Sign out</button>
              </form>
            </div>
          ) : (
            <Link href="/signin" className="text-blue-600 underline">
              Sign in
            </Link>
          )}
        </div>
            <p className="text-gray-600 mb-4">
              Contact management coming soon...
            </p>
            <button 
              disabled
              className="inline-block bg-gray-300 text-gray-500 px-4 py-2 rounded-lg font-medium cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
