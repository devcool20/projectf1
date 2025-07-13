export interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export type AuthMode = 'login' | 'signup'; 