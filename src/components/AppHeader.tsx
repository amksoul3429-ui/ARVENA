import { Download, Menu, Moon, RefreshCw, Sun, Wallet, Zap } from "lucide-react";
import type { Page } from "../core/navigation";
import type { AsteriaTheme } from "../hooks/useAsteriaTheme";

type Props = {
  page: Page;
  theme: AsteriaTheme;
  credits: number;
  xp: number;
  canInstall: boolean;
  updateReady: boolean;
  onOpenNavigation: () => void;
  onToggleTheme: () => void;
  onInstall: () => void;
  onApplyUpdate: () => void;
};

export default function AppHeader({ page, theme, credits, xp, canInstall, updateReady, onOpenNavigation, onToggleTheme, onInstall, onApplyUpdate }: Props) {
  return <header>
    <button className="hamb" aria-label="Open navigation" aria-expanded="false" aria-controls="asteria-navigation-dialog" onClick={onOpenNavigation}><Menu/></button>
    <span>ASTERIA　›　<b>{page.toUpperCase()}</b></span>
    <div className="chips">
      {canInstall&&<button className="pwa-action" onClick={onInstall}><Download size={14}/> INSTALL</button>}
      {updateReady&&<button className="pwa-action update" onClick={onApplyUpdate}><RefreshCw size={14}/> UPDATE READY</button>}
      <button className="theme-toggle" onClick={onToggleTheme} aria-label={theme==='dark'?'Switch to light theme':'Switch to dark theme'}>{theme==='dark'?<Sun size={15}/>:<Moon size={15}/>}<span>{theme==='dark'?'LIGHT':'DARK'}</span></button>
      <i><Wallet size={14}/> {credits} credits</i>
      <i><Zap size={14}/> LVL {Math.floor(xp/500)+1}</i>
    </div>
  </header>;
}
