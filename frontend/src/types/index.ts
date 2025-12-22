export interface User {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    role: 'USER' | 'ADMIN';
}

export interface LoginCredentials {
    email: string;
    password?: string;
}

export interface RegisterCredentials {
    email: string;
    username: string;
    password?: string;
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
