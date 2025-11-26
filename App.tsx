import React from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import OrderList from './components/OrderList';

function App() {
  return (
    <div className="flex min-h-screen bg-[#f3f4f6]">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <TopNav />
        <main className="flex-1 p-2 overflow-x-hidden">
          {/* Breadcrumb replacement or other top content could go here */}
          <OrderList />
        </main>
      </div>
    </div>
  );
}

export default App;