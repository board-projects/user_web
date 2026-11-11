import RequestService from './RequestService';
import ToastService from './ToastService';

jest.mock('./ToastService', () => ({
  __esModule: true,
  default: { showLoading: jest.fn(), updateSuccess: jest.fn(), updateError: jest.fn() },
}));

describe('authentication requests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.cookie = 'access_token=; Max-Age=0; path=/';
  });

  it('accepts the NestJS POST success status', async () => {
    const data = { message: 'OTP sent' };
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 201, json: async () => data });
    expect(await new RequestService('/auth/send-otp').post({ email: 'test@example.com' })).toEqual(data);
    expect(ToastService.updateSuccess).toHaveBeenCalledWith(data.message);
    expect(ToastService.updateError).not.toHaveBeenCalled();
  });

  it('does not advance login when email delivery fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({ message: 'Failed to send OTP email' }) });
    expect(await new RequestService('/auth/send-otp').post({ email: 'test@example.com' })).toBeNull();
    expect(ToastService.updateError).toHaveBeenCalledWith('Failed to send OTP email');
  });

  it('sends the access token saved by login', async () => {
    document.cookie = 'access_token=test-jwt; path=/';
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    await new RequestService('/users').get();
    expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer test-jwt' }),
    }));
  });
});
