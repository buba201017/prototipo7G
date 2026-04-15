import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { MapPin, Plane, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from './ui/utils';

const navigation = [
  { name: 'Monitoreo en Mapa', path: '/', icon: MapPin, description: 'Vista global' },
];

export function Layout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col bg-blue-950 text-white shadow-2xl transition-all duration-300 ease-in-out relative z-20 shrink-0",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        {/* Brand */}
        <div className={cn(
          "flex items-center gap-3 px-4 py-5 border-b border-blue-800",
          collapsed && "justify-center px-2"
        )}>
          <div className="bg-blue-500 rounded-lg p-1.5 shrink-0">
            <Plane className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-white leading-tight truncate" style={{ fontSize: '15px', fontWeight: 700 }}>Tasf.B2B</div>
              <div className="text-blue-300 truncate" style={{ fontSize: '10px' }}>Gestión de Equipajes</div>
            </div>
          )}
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[60px] bg-blue-950 border border-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-white hover:bg-blue-800 transition-colors z-30 shadow-md"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-hidden">
          {!collapsed && (
            <div className="px-2 pb-2">
              <span className="text-blue-400 uppercase tracking-widest" style={{ fontSize: '10px' }}>Módulos</span>
            </div>
          )}
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.name : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-blue-200 hover:bg-blue-800 hover:text-white",
                  collapsed && "justify-center px-2"
                )}
              >
                <Icon className={cn("shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
                {!collapsed && (
                  <div className="overflow-hidden">
                    <div className="truncate" style={{ fontSize: '13px', fontWeight: isActive ? 600 : 400 }}>{item.name}</div>
                    {!isActive && (
                      <div className="text-blue-400 truncate" style={{ fontSize: '10px' }}>{item.description}</div>
                    )}
                  </div>
                )}

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-300 rounded-l-full" />
                )}

                {/* Tooltip when collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={cn(
          "border-t border-blue-800 py-4 px-4",
          collapsed && "px-2"
        )}>
          {!collapsed ? (
            <div className="text-blue-400" style={{ fontSize: '10px' }}>
              <div>© 2026 Tasf.B2B</div>
              <div className="mt-0.5">Sistema Operacional v2.1</div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Plane className="w-4 h-4 text-blue-600" />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="text-gray-400" style={{ fontSize: '12px' }}>
              {navigation.find(n => n.path === location.pathname)?.description ?? 'Panel principal'}
            </div>
            <span className="text-gray-300">/</span>
            <div className="text-gray-800" style={{ fontSize: '13px', fontWeight: 600 }}>
              {navigation.find(n => n.path === location.pathname)?.name ?? 'Dashboard'}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-gray-600" style={{ fontSize: '12px' }}>Sistema en línea</span>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>

        <footer className="bg-white border-t border-gray-200">
          <div className="px-6 py-3 text-center text-gray-400" style={{ fontSize: '11px' }}>
            © 2026 Tasf.B2B — Transporte Aéreo de Equipajes | Sistema de Gestión Operacional
          </div>
        </footer>
      </div>
    </div>
  );
}
