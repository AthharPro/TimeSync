import { SvgIconComponent } from '@mui/icons-material'

export interface IAppIconProps {
  icon: SvgIconComponent
  size?: number
  color?: string
  marginBottom?: number
}

export interface IBrandLogoProps {
  src: string;
  alt?: string;
  title?: string;
}

export interface IFeatureListItemProps {
  text: string
}

export interface ISectionContainerProps extends React.PropsWithChildren {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  component?: React.ElementType;
}

export interface ISectionTitleProps {
  title: string;
  subtitle?: string;
}

export interface IFeatureCardProps {
  icon: SvgIconComponent;
  title: string;
  description: string;
}

export interface IFeatureListProps {
  features: string[];
}

export interface IHeaderDrawerProps {
  open: boolean;
  onClose: () => void;
  navItems: { label: string; target: string }[];
  handleScrollTo: (id: string) => void;
  navigate: (path: string) => void;
}

export interface ILandingActionButtonsProps {
  onGetStarted: () => void;
  onExplore: () => void;
  containbtn?: string;
  outlinebtn?: string;
}

export interface INavItemSectionProps {
  items: { label: string; target: string }[];
  onNavigate: (id: string) => void;
  display?: React.CSSProperties['display'];
  direction?: 'row' | 'column';
  alignItems?: string;
}

export interface IRoleCardProps {
  icon: SvgIconComponent;
  title: string;
  description: string;
  features: string[];
}

export interface IScrollingCardsProps {
  items: IFeatureCardProps[];
  animationDuration?: number;
}

 export  interface IHeaderLayoutProps {
  logo: React.ReactNode;
  navItems: React.ReactNode;
  signInButton: React.ReactNode;
  isMobile: boolean;
  onMenuClick: () => void;
  drawer?: React.ReactNode;
}

export interface IHeroSectionLayoutProps {
  id?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  image?: React.ReactNode;
  background?: string;
  mobileImageFirst?: boolean;
}