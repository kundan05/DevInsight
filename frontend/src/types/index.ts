export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: 'USER' | 'ADMIN' | 'CANDIDATE' | 'INTERVIEWER';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  category: string;
  starterCode?: string;
  testCases?: TestCase[];
  points: number;
  tags: string[];
  createdAt: string;
  _count?: { submissions: number };
}

export interface TestCase {
  input: any;
  expectedOutput: any;
  isHidden?: boolean;
}

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  userId: string;
  code: string;
  language: string;
  status: 'PENDING' | 'RUNNING' | 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR';
  score: number;
  testsPassed?: number;
  totalTests?: number;
  feedback?: any;
  submittedAt: string;
}

export interface ChallengeSubmissionResult {
  submission: ChallengeSubmission;
  message: string;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  timeLimit: number;
  passingScore: number;
  isActive: boolean;
  questions: AssessmentQuestion[];
  author?: { id: string; username: string; avatar?: string };
  createdAt: string;
  _count?: { questions: number };
}

export interface AssessmentQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  starterCode?: string;
  testCases: TestCase[];
  points: number;
  orderIndex: number;
  timeLimit?: number;
  memoryLimit?: number;
}

export interface AssessmentSubmission {
  id: string;
  assessmentId: string;
  questionId: string;
  userId: string;
  code: string;
  language: string;
  status: string;
  score: number;
  testsPassed: number;
  totalTests: number;
  feedback?: any;
  executionTime?: number;
  submittedAt: string;
}

export interface RoomState {
  roomId: string;
  code: string;
  language: string;
  users: UserPresence[];
}

export interface UserPresence {
  userId: string;
  username: string;
  socketId: string;
  joinedAt: string;
}

export interface CursorPosition {
  line: number;
  column: number;
  selectionStart?: { line: number; column: number };
  selectionEnd?: { line: number; column: number };
}

export interface RemoteCursor {
  userId: string;
  username: string;
  position: CursorPosition | null;
  color: string;
}

export interface CollaborationState {
  doc: any;
  awareness: any;
  provider: any;
  users: RemoteCursor[];
  connected: boolean;
  language: string;
  undoManager: any;
}
