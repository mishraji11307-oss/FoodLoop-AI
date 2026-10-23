import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: todos, error } = await supabase.from('todos').select();

  return (
    <div className="max-w-xl mx-auto py-12 px-4 space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <h1 className="text-xl font-bold">Supabase Connection Test</h1>
        <Link href="/" className="text-sm text-emerald-600 hover:underline">
          ← Back to FoodLoop AI
        </Link>
      </div>

      {error ? (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
          <p className="font-bold">Supabase Query Note:</p>
          <p>{error.message}</p>
          <p className="text-slate-500 text-[11px] mt-1">
            (If the 'todos' table does not exist in your database yet, create it in your Supabase SQL editor or run the migrations in database/migrations).
          </p>
        </div>
      ) : (
        <ul className="space-y-2 text-sm">
          {todos && todos.length > 0 ? (
            todos.map((todo: any) => (
              <li key={todo.id} className="p-2.5 rounded-lg bg-white border shadow-sm">
                {todo.name || JSON.stringify(todo)}
              </li>
            ))
          ) : (
            <p className="text-sm text-slate-500">Connected to Supabase! No rows found in 'todos' table.</p>
          )}
        </ul>
      )}
    </div>
  );
}
