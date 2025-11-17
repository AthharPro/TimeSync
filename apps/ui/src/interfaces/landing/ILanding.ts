import { SvgIconComponent } from '@mui/icons-material'

export interface IAppIconProps {
  icon: SvgIconComponent
  size?: number
  color?: string
  marginBottom?: number
}

export interface BrandLogoProps {
  src: string;
  alt?: string;
  title?: string;
}

export interface FeatureListItemProps {
  text: string
}

export interface SectionContainerProps extends React.PropsWithChildren {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  component?: React.ElementType;
}

export interface ISectionTitleProps {
  title: string;
  subtitle?: string;
}

export interface FeatureCardProps {
  icon: SvgIconComponent;
  title: string;
  description: string;
}

export interface FeatureListProps {
  features: string[];
}

export interface HeaderDrawerProps {
  open: boolean;
  onClose: () => void;
  navItems: { label: string; target: string }[];
  handleScrollTo: (id: string) => void;
  navigate: (path: string) => void;
}

export interface LandingActionButtonsProps {
  onGetStarted: () => void;
  onExplore: () => void;
  containbtn?: string;
  outlinebtn?: string;
}

export interface NavItemSectionProps {
  items: { label: string; target: string }[];
  onNavigate: (id: string) => void;
  display?: React.CSSProperties['display'];
  direction?: 'row' | 'column';
  alignItems?: string;
}

export interface RoleCardProps {
  icon: SvgIconComponent;
  title: string;
  description: string;
  features: string[];
}

export interface ScrollingCardsProps {
  items: FeatureCardProps[];
  animationDuration?: number;
}

 export  interface HeaderLayoutProps {
  logo: React.ReactNode;
  navItems: React.ReactNode;
  signInButton: React.ReactNode;
  isMobile: boolean;
  onMenuClick: () => void;
  drawer?: React.ReactNode;
}

export interface HeroSectionLayoutProps {
  id?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  image?: React.ReactNode;
  background?: string;
  mobileImageFirst?: boolean;
}