import { supabase } from '@/lib/supabaseClient'; // Use the client from supabaseClient.ts

export default async function DbTestPage() {
  // const cookieStore = cookies(); // Not needed if using the global client directly
  // const supabase = createClient(cookieStore); // Using the imported supabase client
  let data: any = null;
  let error: any = null;

  try {
    const { data: queryData, error: queryError } = await supabase.from('test_table').select('id, name').limit(1); // Example query
    // Or a simpler query if no table exists yet:
    // const { data: queryData, error: queryError } = await supabase.rpc('echo', { message: 'hello' });
    // Or just a select 1:
    // const { data: queryData, error: queryError } = await supabase.select('1 as test');

    data = queryData;
    error = queryError;
  } catch (e) {
    error = e;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Supabase DB Test Page</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {typeof error === 'object' ? JSON.stringify(error) : error.toString()}</span>
        </div>
      )}
      {data && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Data:</strong>
          <pre className="mt-2 bg-gray-200 p-4 rounded overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
      {!error && !data && (
         <p>No data returned, and no error. Check Supabase client and query.</p>
      )}
       <p className="mt-4 text-sm text-gray-600">
        This page attempts to connect to Supabase and perform a simple read query.
        Ensure your Supabase URL and anon key are correctly set in your environment variables.
        For this test to work with `supabase.from('test_table').select('id, name').limit(1)`, 
        you need a table named `test_table` with `id` and `name` columns.
        Alternatively, you can modify the query to a simple `select 1` or an RPC call.
      </p>
    </div>
  );
}