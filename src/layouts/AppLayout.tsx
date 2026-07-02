import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Drawer } from '@/components/ui/Drawer';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import { useUiStore } from '@/store/uiStore';

export function AppLayout() {
  const { mobileNavOpen, setMobileNavOpen } = useUiStore();

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50 dark:bg-ink-950">
      <OfflineBanner />

      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      <Drawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} side="left">
        <Sidebar onNavigate={() => setMobileNavOpen(false)} />
      </Drawer>

      <div className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </div>

      <CommandPalette />
    </div>
  );
}
