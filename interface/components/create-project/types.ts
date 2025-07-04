export enum PoolMode {
  DIRECT_POOL = 0,
  BONDING_CURVE = 1
}

export interface ProjectFormData {
  // Token configuration
  isNewToken: boolean;
  existingToken?: string;
  name?: string;
  symbol?: string;
  description?: string;
  tokenAmount?: string;
  
  // Pool configuration
  mode: PoolMode;
  initialPrice: string;
  targetMarketCap?: string;
  borrowTimeLimit: number;
}

export interface StepProps {
  formData: ProjectFormData;
  updateFormData: (data: Partial<ProjectFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export enum TransactionStatus {
  IDLE = 'idle',
  PENDING = 'pending',
  CONFIRMING = 'confirming',
  SUCCESS = 'success',
  ERROR = 'error'
}