import React from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import OrderList from './components/OrderList';

function App() {
  return (
    <div className="flex h-screen bg-[#f3f4f6] overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col h-full overflow-hidden">
        <TopNav />
        <main className="flex-1 p-2 flex flex-col overflow-hidden relative">
          {/* OrderList will take up the remaining height and handle internal scrolling */}
          <OrderList />
        </main>
      </div>
    </div>
  );
}

export default App;