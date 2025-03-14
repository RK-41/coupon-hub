import CouponDisplay from './components/CouponDisplay';

function App() {
  return (
    <div className="max-w-3xl min-h-screen mx-auto p-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Coupon Hub</h1>
        <p className="text-slate-500">Get exclusive deals with our round-robin coupon system</p>
      </header>

      <main className="bg-white rounded-lg shadow-md p-8">
        <CouponDisplay />
      </main>

      <footer className="text-center py-4 text-sm text-white bg-gray-400 absolute bottom-0 left-0 right-0">
        <p>© {new Date().getFullYear()} Coupon Hub. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
