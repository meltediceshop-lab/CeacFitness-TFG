export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-stone-200">404</h1>
        <p className="text-stone-500">Página no encontrada</p>
      </div>
    </div>
  );
}
