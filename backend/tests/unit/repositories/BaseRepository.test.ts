import { BaseRepository } from '../../../src/repositories/BaseRepository';

class TestRepository extends BaseRepository<any, any, any> {
  protected get model() {
    return this.prisma.user;
  }
  protected getEntityName(): string {
    return 'Test';
  }
}

describe('BaseRepository', () => {
  let repo: TestRepository;

  beforeEach(() => {
    repo = new TestRepository();
  });

  it('should be defined', () => {
    expect(repo).toBeDefined();
  });

  it('should have prisma client', () => {
    expect((repo as any).prisma).toBeDefined();
  });
});
