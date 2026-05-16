import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, ClipboardList, CreditCard,
  FileText, Settings, LogOut, GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard',   roles: ['ADMIN', 'SECRETARIA', 'PROFESSOR'] },
  { to: '/estudantes', icon: Users,           label: 'Estudantes',  roles: ['ADMIN', 'SECRETARIA', 'PROFESSOR'] },
  { to: '/turmas',     icon: BookOpen,         label: 'Turmas',      roles: ['ADMIN', 'SECRETARIA', 'PROFESSOR'] },
  { to: '/matriculas', icon: ClipboardList,    label: 'Matrículas',  roles: ['ADMIN', 'SECRETARIA'] },
  { to: '/financeiro', icon: CreditCard,       label: 'Financeiro',  roles: ['ADMIN', 'SECRETARIA'] },
  { to: '/relatorios', icon: FileText,         label: 'Relatórios',  roles: ['ADMIN', 'SECRETARIA'] },
  { to: '/usuarios',   icon: Settings,         label: 'Usuários',    roles: ['ADMIN'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  const visibleItems = navItems.filter((item) =>
    item.roles.includes(user?.role || '')
  );

  return (
    <aside className="w-64 min-h-screen bg-gray-900 flex flex-col text-white">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center font-bold text-white text-lg">
            M
          </div>
          <div>
            <div className="font-bold text-sm leading-tight text-white">Maximus</div>
            <div className="text-gray-400 text-xs">Centro de Ensino</div>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {visibleItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Perfil + Logout */}
      <div className="px-3 py-4 border-t border-gray-800">
        <div className="px-3 py-2 mb-2">
          <div className="text-sm font-medium text-white truncate">{user?.nome}</div>
          <div className="text-xs text-gray-400">{user?.role}</div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}
