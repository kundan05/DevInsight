import { UserRepository } from '../repositories/UserRepository';
import { NotFoundError } from '../errors/AppError';

export class UserService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  async getProfile(username: string) {
    const user = await this.userRepo.findByUsername(username);
    if (!user) {
      throw new NotFoundError('User');
    }

    const stats = await this.getUserStats(user.id);

    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      avatar: user.avatar,
      githubUrl: user.githubUrl,
      linkedinUrl: user.linkedinUrl,
      role: user.role,
      createdAt: user.createdAt,
      _count: {
        snippets: stats.snippetCount,
        challengeSubmissions: stats.challengesSolved,
        achievements: 0,
      },
    };
  }

  async updateProfile(userId: string, data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    avatar?: string;
    githubUrl?: string;
    linkedinUrl?: string;
  }) {
    const user = await this.userRepo.update(userId, data);
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      avatar: user.avatar,
      githubUrl: user.githubUrl,
      linkedinUrl: user.linkedinUrl,
      role: user.role,
    };
  }

  async getUserStats(userId: string) {
    return this.userRepo.getUserStats(userId);
  }

  async getLeaderboard(limit = 10) {
    return this.userRepo.getLeaderboard(limit);
  }
}
