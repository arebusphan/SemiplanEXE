import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function Layout() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

            {/* Sidebar */}
            <Sidebar />

            {/* Right side */}
            <div className="lg:ml-[260px] min-h-screen flex flex-col">

                {/* Navbar */}
                <Navbar />

                {/* Page Content */}
                <main className="flex-1 p-6 lg:p-8">
                    <Outlet />
                </main>

            </div>
        </div>
    )
}