
export default function Navbar() {


  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between h-full px-4 lg:px-8">
        {/* Left */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-blue-500 ml-auto">notification</div>
        <div>login</div>
        </div>
      </div>
    </header>
  )
}
