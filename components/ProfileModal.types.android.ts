export interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  session: any;
  onLogin: () => void;
}

export interface F1Team {
  name: string;
  color: string;
  logo: any;
} 