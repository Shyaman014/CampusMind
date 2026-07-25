const { sendEmail, getVerificationEmailHtml, getPasswordResetEmailHtml, getWelcomeEmailHtml } = require('../utils/sendEmail');

jest.mock('resend', () => {
  const mSend = jest.fn();
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: mSend,
      },
    })),
  };
});

const { Resend } = require('resend');

describe('sendEmail Utility (Resend Implementation)', () => {
  const originalEnv = process.env;
  let mockSend;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.RESEND_API_KEY = 'test_resend_api_key_123';
    process.env.EMAIL_FROM = 'test@campusmind.ai';

    const resendInstance = new Resend();
    mockSend = resendInstance.emails.send;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should successfully send an email using Resend SDK with RESEND_API_KEY and EMAIL_FROM', async () => {
    mockSend.mockResolvedValueOnce({ data: { id: 'resend-msg-id-123' }, error: null });

    const options = {
      email: 'user@example.com',
      subject: 'Test Subject',
      message: 'Test text message',
      html: '<p>Test html message</p>',
    };

    const result = await sendEmail(options);

    expect(Resend).toHaveBeenCalledWith('test_resend_api_key_123');
    expect(mockSend).toHaveBeenCalledWith({
      from: 'CampusMind AI <test@campusmind.ai>',
      to: 'user@example.com',
      subject: 'Test Subject',
      text: 'Test text message',
      html: '<p>Test html message</p>',
    });
    expect(result).toEqual({ id: 'resend-msg-id-123' });
  });

  it('should throw an error if RESEND_API_KEY is missing', async () => {
    delete process.env.RESEND_API_KEY;

    const options = {
      email: 'user@example.com',
      subject: 'Test Subject',
      message: 'Test text message',
    };

    await expect(sendEmail(options)).rejects.toThrow('RESEND_API_KEY environment variable is not set');
  });

  it('should throw clear error if email sending fails (error object returned by Resend)', async () => {
    mockSend.mockResolvedValueOnce({
      data: null,
      error: { message: 'Domain not verified', statusCode: 403 },
    });

    const options = {
      email: 'user@example.com',
      subject: 'Fail Subject',
      message: 'Fail message',
    };

    await expect(sendEmail(options)).rejects.toThrow('Domain not verified');
  });

  it('should format email sender correctly if EMAIL_FROM does not contain name formatting', async () => {
    mockSend.mockResolvedValueOnce({ data: { id: 'msg-id' }, error: null });
    process.env.FROM_NAME = 'CampusMind Support';
    process.env.EMAIL_FROM = 'support@campusmind.ai';

    await sendEmail({
      email: 'user@example.com',
      subject: 'Test',
      message: 'Hello',
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'CampusMind Support <support@campusmind.ai>',
      })
    );
  });

  it('should preserve and generate existing email templates correctly', () => {
    const verHtml = getVerificationEmailHtml('John Doe', 'http://localhost/verify');
    expect(verHtml).toContain('John Doe');
    expect(verHtml).toContain('http://localhost/verify');
    expect(verHtml).toContain('Verify Your Email Address');

    const resetHtml = getPasswordResetEmailHtml('Jane Doe', 'http://localhost/reset');
    expect(resetHtml).toContain('Jane Doe');
    expect(resetHtml).toContain('http://localhost/reset');
    expect(resetHtml).toContain('Password Reset Request');

    const welcomeHtml = getWelcomeEmailHtml('Alex', 'http://localhost');
    expect(welcomeHtml).toContain('Alex');
    expect(welcomeHtml).toContain('Welcome to CampusMind AI!');
  });
});
