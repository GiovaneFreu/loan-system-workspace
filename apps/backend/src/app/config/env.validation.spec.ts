import { validateEnv } from './env.validation';

describe('Environment Validation', () => {
  const baseConfig = {
    DATABASE_TYPE: 'postgres',
    DATABASE_HOST: 'localhost',
    DATABASE_PORT: '5432',
    DATABASE_USER: 'test',
    DATABASE_PASSWORD: 'test',
    DATABASE_NAME: 'test_db',
  };

  describe('NODE_ENV validation', () => {
    it('should accept development environment', () => {
      const config = { ...baseConfig, NODE_ENV: 'development' };
      expect(() => validateEnv(config)).not.toThrow();
    });

    it('should accept production environment', () => {
      const config = { ...baseConfig, NODE_ENV: 'production' };
      expect(() => validateEnv(config)).not.toThrow();
    });

    it('should accept staging environment', () => {
      const config = { ...baseConfig, NODE_ENV: 'staging' };
      expect(() => validateEnv(config)).not.toThrow();
    });

    it('should accept test environment', () => {
      const config = { ...baseConfig, NODE_ENV: 'test' };
      expect(() => validateEnv(config)).not.toThrow();
    });

    it('should accept docker environment', () => {
      const config = { ...baseConfig, NODE_ENV: 'docker' };
      expect(() => validateEnv(config)).not.toThrow();
    });

    it('should reject invalid environment', () => {
      const config = { ...baseConfig, NODE_ENV: 'invalid' };
      expect(() => validateEnv(config)).toThrow(/Environment validation failed/);
    });

    it('should use development as default when NODE_ENV is not provided', () => {
      const result = validateEnv(baseConfig);
      expect(result.NODE_ENV).toBe('development');
    });
  });

  describe('Database configuration validation', () => {
    it('should require DATABASE_HOST', () => {
      const config = { ...baseConfig };
      delete config.DATABASE_HOST;
      expect(() => validateEnv(config)).toThrow();
    });

    it('should require DATABASE_PORT', () => {
      const config = { ...baseConfig };
      delete config.DATABASE_PORT;
      expect(() => validateEnv(config)).toThrow();
    });

    it('should validate DATABASE_PORT as number', () => {
      const config = { ...baseConfig, DATABASE_PORT: 'invalid' };
      expect(() => validateEnv(config)).toThrow();
    });

    it('should validate DATABASE_PORT range', () => {
      const config = { ...baseConfig, DATABASE_PORT: '70000' };
      expect(() => validateEnv(config)).toThrow();
    });

    it('should accept DATABASE_SSL as boolean string', () => {
      const config = { ...baseConfig, DATABASE_SSL: 'true' };
      const result = validateEnv(config);
      expect(result.DATABASE_SSL).toBe(true);
    });
  });

  describe('Optional configuration', () => {
    it('should use default PORT when not provided', () => {
      const result = validateEnv(baseConfig);
      expect(result.PORT).toBe(8080);
    });

    it('should accept custom PORT', () => {
      const config = { ...baseConfig, PORT: '8080' };
      const result = validateEnv(config);
      expect(result.PORT).toBe(8080);
    });

    it('should use default LOG_LEVEL when not provided', () => {
      const result = validateEnv(baseConfig);
      expect(result.LOG_LEVEL).toBe('info');
    });
  });
});
