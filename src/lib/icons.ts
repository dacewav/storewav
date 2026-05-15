/**
 * Icon definitions — migrated to lucide-svelte.
 * Brand icons (whatsapp, instagram, youtube) remain as inline SVGs in Icon.svelte.
 *
 * IconName type kept here for backward compatibility with stores and pages.
 */
export type IconName =
	| 'heart' | 'play' | 'pause' | 'close' | 'search' | 'check'
	| 'warning' | 'error' | 'volumeOn' | 'volumeOff' | 'music' | 'tag'
	| 'sun' | 'moon' | 'chevronDown' | 'chevronLeft' | 'chevronUp'
	| 'settings' | 'edit' | 'trash' | 'plus' | 'undo' | 'redo'
	| 'save' | 'export' | 'share' | 'import' | 'logout'
	| 'skipBack' | 'skipForward' | 'shoppingCart' | 'bell'
	| 'layoutDashboard' | 'image' | 'messageSquare' | 'drum' | 'home'
	| 'sparkles' | 'palette' | 'layers' | 'building' | 'barChart'
	| 'users' | 'user' | 'fileText' | 'mail' | 'zap' | 'smile' | 'film'
	| 'whatsapp' | 'instagram' | 'youtube';
